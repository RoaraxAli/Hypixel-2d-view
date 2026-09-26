import nbt from 'prismarine-nbt';

// Minecraft Color Map
const COLOR_CODES = {
  '0': '#000000',
  '1': '#0000AA',
  '2': '#00AA00',
  '3': '#00AAAA',
  '4': '#AA0000',
  '5': '#AA00AA',
  '6': '#FFAA00',
  '7': '#AAAAAA',
  '8': '#555555',
  '9': '#5555FF',
  'a': '#55FF55',
  'b': '#55FFFF',
  'c': '#FF5555',
  'd': '#FF55FF',
  'e': '#FFFF55',
  'f': '#FFFFFF'
};

const RARITY_COLORS = {
  'COMMON': '#FFFFFF',
  'UNCOMMON': '#55FF55',
  'RARE': '#5555FF',
  'EPIC': '#AA00AA',
  'LEGENDARY': '#FFAA00',
  'MYTHIC': '#FF55FF',
  'DIVINE': '#55FFFF',
  'SPECIAL': '#FF5555',
  'VERY_SPECIAL': '#FF5555'
};

/**
 * Convert Minecraft color codes (§) into clean HTML spans
 */
export function formatMinecraftText(text) {
  if (!text) return '';
  
  const parts = text.split(/(§[0-9a-fk-or])/gi);
  let html = '';
  let currentColor = null;
  let bold = false;
  let italic = false;
  let underline = false;
  let strikethrough = false;

  for (const part of parts) {
    if (!part) continue;

    if (part.startsWith('§')) {
      const code = part[1].toLowerCase();
      if (COLOR_CODES[code] !== undefined) {
        currentColor = COLOR_CODES[code];
        bold = false;
        italic = false;
        underline = false;
        strikethrough = false;
      } else if (code === 'l') {
        bold = true;
      } else if (code === 'm') {
        strikethrough = true;
      } else if (code === 'n') {
        underline = true;
      } else if (code === 'o') {
        italic = true;
      } else if (code === 'r') {
        currentColor = null;
        bold = false;
        italic = false;
        underline = false;
        strikethrough = false;
      }
      continue;
    }

    const styles = [];
    if (currentColor) styles.push(`color: ${currentColor}`);
    if (bold) styles.push('font-weight: 700');
    if (italic) styles.push('font-style: italic');
    if (underline && strikethrough) styles.push('text-decoration: underline line-through');
    else if (underline) styles.push('text-decoration: underline');
    else if (strikethrough) styles.push('text-decoration: line-through');

    const styleAttr = styles.length > 0 ? ` style="${styles.join('; ')}"` : '';
    // Escape HTML characters
    const escaped = part
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    html += `<span${styleAttr}>${escaped}</span>`;
  }

  return html;
}

/**
 * Strip Minecraft color codes for plain text
 */
export function stripMinecraftCodes(text) {
  if (!text) return '';
  return text.replace(/§[0-9a-fk-or]/gi, '');
}

/**
 * Parse a Base64 Gzipped NBT string into an array of parsed item objects
 */
export async function parseNbtItems(base64Data) {
  if (!base64Data) return [];

  try {
    const buffer = Buffer.from(base64Data, 'base64');
    const parsed = await nbt.parse(buffer);
    const simplified = nbt.simplify(parsed.parsed || parsed);
    const rawList = simplified.i || simplified.items || [];

    return rawList.map((raw, index) => parseSingleItem(raw, index));
  } catch (err) {
    console.error('Failed to parse NBT data:', err.message);
    return [];
  }
}

/**
 * Parse an individual item tag from simplified NBT
 */
export function parseSingleItem(item, slot = null) {
  if (!item || !item.id || item.id === -1) {
    return {
      empty: true,
      slot
    };
  }

  const tag = item.tag || {};
  const display = tag.display || {};
  const extra = tag.ExtraAttributes || {};

  const rawName = display.Name || 'Unknown Item';
  const cleanName = stripMinecraftCodes(rawName);
  const formattedName = formatMinecraftText(rawName);

  const rawLore = Array.isArray(display.Lore) ? display.Lore : [];
  const loreHtml = rawLore.map(line => formatMinecraftText(line));
  const lorePlain = rawLore.map(line => stripMinecraftCodes(line));

  // Determine rarity from last lines of lore
  let rarity = 'COMMON';
  for (let i = lorePlain.length - 1; i >= 0; i--) {
    const line = lorePlain[i].trim();
    for (const [r, _] of Object.entries(RARITY_COLORS)) {
      if (line.includes(r)) {
        rarity = r;
        break;
      }
    }
    if (rarity !== 'COMMON') break;
  }

  // Parse enchantments
  const enchants = {};
  if (extra.enchantments && typeof extra.enchantments === 'object') {
    for (const [key, lvl] of Object.entries(extra.enchantments)) {
      enchants[key] = lvl;
    }
  }

  // Stars (regular + master stars)
  const starsCount = extra.upgrade_level || extra.dungeon_item_level || 0;
  let starsDisplay = '';
  if (starsCount > 0) {
    const regularStars = Math.min(starsCount, 5);
    const masterStars = Math.max(0, starsCount - 5);
    starsDisplay = '✪'.repeat(regularStars) + (masterStars > 0 ? ['➊','➋','➌','➍','➎'][masterStars - 1] || '✪' : '');
  }

  // Gemstones
  const gems = [];
  if (extra.gems) {
    for (const [key, val] of Object.entries(extra.gems)) {
      if (typeof val === 'string' || typeof val === 'object') {
        gems.push({ slot: key, quality: typeof val === 'string' ? val : val.quality });
      }
    }
  }

  // Runes
  let rune = null;
  if (extra.runes && typeof extra.runes === 'object') {
    const [runeType, runeLvl] = Object.entries(extra.runes)[0] || [];
    if (runeType) {
      rune = { type: runeType, level: runeLvl };
    }
  }

  // Skull texture if applicable
  let skullTexture = null;
  try {
    const textures = tag.SkullOwner?.Properties?.textures;
    if (Array.isArray(textures) && textures[0]?.Value) {
      skullTexture = textures[0].Value;
    }
  } catch {}

  return {
    empty: false,
    slot,
    count: item.Count || 1,
    id: item.id,
    damage: item.Damage || 0,
    skyblockId: extra.id || null,
    rawName,
    cleanName,
    formattedName,
    loreHtml,
    lorePlain,
    rarity,
    rarityColor: RARITY_COLORS[rarity] || '#FFFFFF',
    modifier: extra.modifier || null,
    recombobulated: Boolean(extra.rarity_upgrades),
    starsCount,
    starsDisplay,
    hotPotatoCount: extra.hot_potato_count || 0,
    enchants,
    gems,
    rune,
    skullTexture,
    rawExtra: extra
  };
}
