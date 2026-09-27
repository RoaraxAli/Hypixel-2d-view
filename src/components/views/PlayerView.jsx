'use client';

import { useState, useMemo, useEffect } from 'react';
import ItemSlot from '@/components/ItemSlot';
import { getItemTexture } from '@/lib/itemTextures';
import { formatCoins } from '@/lib/skyblockUtils';

function renderSlot(item, customClass = '') {
  return <ItemSlot item={item} customClass={customClass} />;
}

export default function PlayerView({
  playerData,
  activeSubtab = 'menu',
  onSelectProfile,
  onSwitchUser,
  onClose,
}) {
  const [screen, setScreen] = useState(activeSubtab === 'inventory' ? 'profile' : (activeSubtab || 'menu'));
  const [storageKey, setStorageKey] = useState('enderChest');
  const [profileSubtab, setProfileSubtab] = useState('gear');
  const [craftingRecipe, setCraftingRecipe] = useState('super_compactor');
  const [selectedArrow, setSelectedArrow] = useState('flint');
  const [collectionTab, setCollectionTab] = useState('farming');

  useEffect(() => {
    if (activeSubtab) {
      if (['dungeons', 'mining', 'garden', 'slayers', 'gear', 'misc', 'rift'].includes(activeSubtab)) {
        setScreen('profile');
        setProfileSubtab(activeSubtab);
      } else {
        setScreen(activeSubtab);
      }
    }
  }, [activeSubtab]);

  if (!playerData) {
    return (
      <div className="mc-chest-wrapper">
        <div className="mc-chest-window p-6 text-center space-y-4 max-w-md">
          <div className="mc-chest-header pb-2 border-b-2 border-[#555555]">
            <span className="mc-chest-title text-2xl font-bold">SkyBlock Menu</span>
            {onClose && (
              <button onClick={onClose} className="mc-close-button" title="Close [ESC]">
                <img src="/textures/minecraft/barrier.png" alt="Close" className="w-4 h-4 pointer-events-none" />
              </button>
            )}
          </div>
          <p className="minecraft-font text-base text-gray-700 font-bold">No Player Profile Loaded</p>
          <p className="minecraft-font text-sm text-gray-500">Switch IGN to load an authentic SkyBlock player profile.</p>
          <button onClick={onSwitchUser} className="mc-stone-button text-base px-4 py-1.5 w-full">
            Switch IGN
          </button>
        </div>
      </div>
    );
  }

  const {
    player = {},
    profiles = [],
    selectedProfile = {},
    privacy = {},
    inventories = {},
    skills = {},
    slayers = {},
    dungeons = {},
    mining = {},
    pets = [],
    rift = {},
    garden = {},
    economy = {},
    misc = {},
  } = playerData;

  const restrictedList = [];
  if (privacy.inventoryRestricted) restrictedList.push('Inventories & Gear');
  if (privacy.skillsRestricted) restrictedList.push('Skills');
  if (privacy.bankingRestricted) restrictedList.push('Co-op Banking');
  if (privacy.collectionsRestricted) restrictedList.push('Collections');

  const mainItems = (inventories.inventory || []).slice(9, 36);
  const hotbarItems = (inventories.inventory || []).slice(0, 9);
  const activePet = pets.find(p => p.active) || pets[0] || null;

  // Build the 54-slot SkyBlock Menu based on the official wiki coordinate mapping:
  // (X, Y) coordinate system: Bottom-left is (1, 1), Top-right is (9, 6)
  // row = 6 - Y (0..5), col = X - 1 (0..8), slot = row * 9 + col
  const menuSlots = useMemo(() => {
    const slots = new Array(54).fill(null);

    // Decorative gray stained glass pane default
    for (let i = 0; i < 54; i++) {
      slots[i] = {
        type: 'glass',
        icon: '/textures/minecraft/gray_stained_glass_pane.png',
        rawItem: {
          rawName: ' ',
          formattedName: ' ',
          loreHtml: [],
        },
      };
    }

    // 1. Slot 13: Your SkyBlock Profile (5; 5) -> row 1, col 4
    const avatar = player.avatarUrl || `https://mc-heads.net/avatar/${player.uuid}/100`;
    slots[13] = {
      id: 'profile',
      name: 'Your SkyBlock Profile',
      icon: avatar,
      targetScreen: 'profile',
      rawItem: {
        cleanName: 'Your SkyBlock Profile',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Your SkyBlock Profile</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View your equipment, stats, and</span>',
          '<span style="color: #AAAAAA">overall progression in SkyBlock.</span>',
          '',
          `<span style="color: #AAAAAA">SkyBlock Level: </span><span style="color: #55FFFF; font-weight: bold">${misc.skyblockLevel || 0}</span>`,
          `<span style="color: #AAAAAA">Profile: </span><span style="color: #FFAA00; font-weight: bold">${selectedProfile.cuteName || 'Standard'}</span>`,
          `<span style="color: #AAAAAA">Skill Average: </span><span style="color: #55FF55; font-weight: bold">${skills.skillAverage || 0}</span>`,
          `<span style="color: #AAAAAA">Purse: </span><span style="color: #FFAA00; font-weight: bold">${economy.formattedPurse || '0 Coins'}</span>`,
          `<span style="color: #AAAAAA">Bank: </span><span style="color: #FFAA00; font-weight: bold">${economy.formattedBank || '0 Coins'}</span>`,
          '',
          '<span style="color: #FFFF55">Click to view profile & equipment!</span>',
        ],
      },
    };

    // 2. Slot 19: Your Skills (2; 4) -> row 2, col 1
    slots[19] = {
      id: 'skills',
      name: 'Your Skills',
      icon: '/textures/minecraft/diamond_sword.png',
      targetScreen: 'skills',
      rawItem: {
        cleanName: 'Your Skills',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Your Skills</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View your skill progression and</span>',
          '<span style="color: #AAAAAA">level rewards across all skills.</span>',
          '',
          `<span style="color: #AAAAAA">Skill Average: </span><span style="color: #FFAA00; font-weight: bold">${skills.skillAverage || 0}</span>`,
          `<span style="color: #AAAAAA">Total Skill XP: </span><span style="color: #FFFF55; font-weight: bold">${(skills.totalXp || 0).toLocaleString()}</span>`,
          '',
          '<span style="color: #FFFF55">Click to view skills!</span>',
        ],
      },
    };

    // 3. Slot 20: Collection (3; 4) -> row 2, col 2
    slots[20] = {
      id: 'collection',
      name: 'Collection',
      icon: '/textures/minecraft/painting.png',
      targetScreen: 'collection',
      rawItem: {
        cleanName: 'Collection',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Collection</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View all of the items you have</span>',
          '<span style="color: #AAAAAA">collected across SkyBlock to earn</span>',
          '<span style="color: #AAAAAA">crafting recipes and rewards.</span>',
          '',
          '<span style="color: #FFFF55">Click to view collections!</span>',
        ],
      },
    };

    // 4. Slot 21: Recipe Book (4; 4) -> row 2, col 3
    slots[21] = {
      id: 'recipes',
      name: 'Recipe Book',
      icon: '/textures/minecraft/book.png',
      targetScreen: 'recipes',
      rawItem: {
        cleanName: 'Recipe Book',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Recipe Book</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Browse and search through recipes</span>',
          '<span style="color: #AAAAAA">you have unlocked in SkyBlock.</span>',
          '',
          '<span style="color: #FFFF55">Click to view recipe book!</span>',
        ],
      },
    };

    // 5. Slot 22: Trades (5; 4) -> row 2, col 4
    slots[22] = {
      id: 'trades',
      name: 'Trades',
      icon: '/textures/minecraft/emerald.png',
      targetScreen: 'trades',
      rawItem: {
        cleanName: 'Trades',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Trades</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View custom trades unlocked</span>',
          '<span style="color: #AAAAAA">through your collections.</span>',
          '',
          '<span style="color: #FFFF55">Click to view trades!</span>',
        ],
      },
    };

    // 6. Slot 23: Quest Log (6; 4) -> row 2, col 5
    slots[23] = {
      id: 'quests',
      name: 'Quest Log',
      icon: '/textures/minecraft/book_and_quill.png',
      targetScreen: 'quests',
      rawItem: {
        cleanName: 'Quest Log',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Quest Log</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View your active and completed</span>',
          '<span style="color: #AAAAAA">quests and storyline objectives.</span>',
          '',
          '<span style="color: #FFFF55">Click to view quests!</span>',
        ],
      },
    };

    // 7. Slot 24: Calendar and Events (7; 4) -> row 2, col 6
    slots[24] = {
      id: 'calendar',
      name: 'Calendar and Events',
      icon: '/textures/minecraft/clock.png',
      targetScreen: 'calendar',
      rawItem: {
        cleanName: 'Calendar and Events',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Calendar and Events</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View the SkyBlock year, season,</span>',
          '<span style="color: #AAAAAA">and upcoming community events.</span>',
          '',
          '<span style="color: #FFAA00; font-weight: bold">Next Event: Spooky Festival</span>',
          '<span style="color: #55FF55">Starts in: 4h 12m</span>',
          '',
          '<span style="color: #FFFF55">Click to view calendar!</span>',
        ],
      },
    };

    // 8. Slot 25: Storage (8; 4) -> row 2, col 7
    slots[25] = {
      id: 'storage',
      name: 'Storage',
      icon: '/textures/minecraft/chest.png',
      targetScreen: 'storage',
      rawItem: {
        cleanName: 'Storage',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Storage</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Store items in your Ender Chest,</span>',
          '<span style="color: #AAAAAA">Backpacks, and specialized bags.</span>',
          '',
          '<span style="color: #FFFF55">Click to view storage!</span>',
        ],
      },
    };

    // 9. Slot 30: Pets (4; 3) -> row 3, col 3
    slots[30] = {
      id: 'pets',
      name: 'Pets',
      icon: '/textures/minecraft/bone.png',
      targetScreen: 'pets',
      rawItem: {
        cleanName: 'Pets',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Pets</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View and manage your summoned pets</span>',
          '<span style="color: #AAAAAA">and their active combat bonuses.</span>',
          '',
          `<span style="color: #AAAAAA">Active: </span><span style="color: #FFAA00; font-weight: bold">${activePet ? activePet.cleanName : 'None'}</span>`,
          `<span style="color: #AAAAAA">Total Pets: </span><span style="color: #55FF55; font-weight: bold">${pets.length}</span>`,
          '',
          '<span style="color: #FFFF55">Click to view pets!</span>',
        ],
      },
    };

    // 10. Slot 31: Crafting Table (5; 3) -> row 3, col 4
    slots[31] = {
      id: 'crafting',
      name: 'Crafting Table',
      icon: '/textures/minecraft/crafting_table.png',
      targetScreen: 'crafting',
      rawItem: {
        cleanName: 'Crafting Table',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Crafting Table</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Opens a 3x3 crafting grid to</span>',
          '<span style="color: #AAAAAA">craft recipes and materials.</span>',
          '',
          '<span style="color: #FFFF55">Click to open crafting grid!</span>',
        ],
      },
    };

    // 11. Slot 32: Wardrobe (6; 3) -> row 3, col 5
    slots[32] = {
      id: 'wardrobe',
      name: 'Wardrobe',
      icon: '/textures/minecraft/leather_chestplate.png',
      targetScreen: 'wardrobe',
      rawItem: {
        cleanName: 'Wardrobe',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Wardrobe</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Store and swap armor sets</span>',
          '<span style="color: #AAAAAA">instantly in your wardrobe.</span>',
          '',
          '<span style="color: #FFFF55">Click to open wardrobe!</span>',
        ],
      },
    };

    // 12. Slot 33: Personal Bank (7; 3) -> row 3, col 6
    slots[33] = {
      id: 'bank',
      name: 'Personal Bank',
      icon: '/textures/minecraft/gold_block.png',
      targetScreen: 'bank',
      rawItem: {
        cleanName: 'Personal Bank',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Personal Bank</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Direct access to your bank account</span>',
          '<span style="color: #AAAAAA">from anywhere in SkyBlock!</span>',
          '',
          `<span style="color: #AAAAAA">Bank: </span><span style="color: #FFAA00; font-weight: bold">${economy.formattedBank || '0 Coins'}</span>`,
          `<span style="color: #AAAAAA">Purse: </span><span style="color: #FFAA00; font-weight: bold">${economy.formattedPurse || '0 Coins'}</span>`,
          '',
          '<span style="color: #FFFF55">Click to access personal bank!</span>',
        ],
      },
    };

    // 13. Slot 45: Potion Bag (8; 0) -> row 5, col 0
    slots[45] = {
      id: 'potionBag',
      name: 'Potion Bag',
      icon: '/textures/minecraft/nether_wart.png',
      targetScreen: 'storage',
      storageTab: 'potionBag',
      rawItem: {
        cleanName: 'Potion Bag',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Potion Bag</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Store potions and brews in</span>',
          '<span style="color: #AAAAAA">your dedicated potion bag.</span>',
          '',
          '<span style="color: #FFFF55">Click to open potion bag!</span>',
        ],
      },
    };

    // 14. Slot 46: Accessory Bag (9; 0) -> row 5, col 1
    slots[46] = {
      id: 'accessoryBag',
      name: 'Accessory Bag',
      icon: '/textures/minecraft/redstone.png',
      targetScreen: 'storage',
      storageTab: 'talismanBag',
      rawItem: {
        cleanName: 'Accessory Bag',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Accessory Bag</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Holds talismans, rings, and artifacts</span>',
          '<span style="color: #AAAAAA">to grant Magical Power bonuses.</span>',
          '',
          '<span style="color: #FFFF55">Click to open accessory bag!</span>',
        ],
      },
    };

    // 15. Slot 47: Fast Travel (3; 1) -> row 5, col 2
    slots[47] = {
      id: 'fast_travel',
      name: 'Fast Travel',
      icon: '/textures/minecraft/compass.png',
      targetScreen: 'fast_travel',
      rawItem: {
        cleanName: 'Fast Travel',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Fast Travel</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Teleport directly to unlocked</span>',
          '<span style="color: #AAAAAA">islands across SkyBlock.</span>',
          '',
          '<span style="color: #FFFF55">Click to view destinations!</span>',
        ],
      },
    };

    // 16. Slot 48: Profile Management (4; 1) -> row 5, col 3
    slots[48] = {
      id: 'profiles',
      name: 'Profile Management',
      icon: '/textures/minecraft/name_tag.png',
      targetScreen: 'profiles',
      rawItem: {
        cleanName: 'Profile Management',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Profile Management</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Switch between SkyBlock profiles</span>',
          '<span style="color: #AAAAAA">or switch your Minecraft IGN.</span>',
          '',
          `<span style="color: #AAAAAA">Current: </span><span style="color: #55FF55; font-weight: bold">${selectedProfile.cuteName || 'Standard'}</span>`,
          '',
          '<span style="color: #FFFF55">Click to manage profiles!</span>',
        ],
      },
    };

    // 17. Slot 49: Booster Cookie (5; 1) -> row 5, col 4
    slots[49] = {
      id: 'cookie',
      name: 'Booster Cookie',
      icon: '/textures/minecraft/cookie.png',
      targetScreen: 'cookie',
      rawItem: {
        cleanName: 'Booster Cookie',
        formattedName: '<span style="color: #FFAA00; font-weight: bold">Booster Cookie</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Active buffs: +25% Skill XP,</span>',
          '<span style="color: #AAAAAA">+15 Magic Find, keep coins on</span>',
          '<span style="color: #AAAAAA">death, and /ah command access.</span>',
          '',
          '<span style="color: #FFFF55">Click to view booster perks!</span>',
        ],
      },
    };

    // 18. Slot 50: Settings (6; 1) -> row 5, col 5
    slots[50] = {
      id: 'settings',
      name: 'Settings',
      icon: '/textures/minecraft/redstone_torch.png',
      targetScreen: 'settings',
      rawItem: {
        cleanName: 'Settings',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Settings</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Configure SkyBlock settings,</span>',
          '<span style="color: #AAAAAA">API preferences, and audio.</span>',
          '',
          '<span style="color: #FFFF55">Click to open settings!</span>',
        ],
      },
    };

    // 19. Slot 51: Sack of Sacks (7; 1) -> row 5, col 6
    slots[51] = {
      id: 'sacks',
      name: 'Sack of Sacks',
      icon: '/textures/minecraft/chest.png',
      targetScreen: 'storage',
      storageTab: 'backpacks',
      rawItem: {
        cleanName: 'Sack of Sacks',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Sack of Sacks</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Stores resource sacks to pick up</span>',
          '<span style="color: #AAAAAA">materials directly into sacks.</span>',
          '',
          '<span style="color: #FFFF55">Click to open sack storage!</span>',
        ],
      },
    };

    // 20. Slot 52: Fishing Bag (8; 1) -> row 5, col 7
    slots[52] = {
      id: 'fishingBag',
      name: 'Fishing Bag',
      icon: '/textures/minecraft/raw_fish.png',
      targetScreen: 'storage',
      storageTab: 'fishingBag',
      rawItem: {
        cleanName: 'Fishing Bag',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Fishing Bag</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Store fishing rods, bait, and</span>',
          '<span style="color: #AAAAAA">special aquatic catches.</span>',
          '',
          '<span style="color: #FFFF55">Click to open fishing bag!</span>',
        ],
      },
    };

    // 21. Slot 53: Quiver (9; 1) -> row 5, col 8
    slots[53] = {
      id: 'quiver',
      name: 'Quiver',
      icon: '/textures/minecraft/arrow.png',
      targetScreen: 'quiver',
      rawItem: {
        cleanName: 'Quiver',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Quiver</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Holds arrows automatically fired</span>',
          '<span style="color: #AAAAAA">when using shortbows and bows.</span>',
          '',
          '<span style="color: #FFFF55">Click to view quiver!</span>',
        ],
      },
    };

    return slots;
  }, [player, selectedProfile, misc, skills, economy, activePet, pets]);

  const handleSlotClick = (slot) => {
    if (!slot || slot.type === 'glass') return;
    if (slot.storageTab) {
      setStorageKey(slot.storageTab);
    }
    if (slot.targetScreen) {
      setScreen(slot.targetScreen);
    }
  };

  let storageItems = [];
  if (storageKey === 'enderChest') storageItems = inventories.enderChest || [];
  else if (storageKey === 'talismanBag') storageItems = inventories.talismanBag || [];
  else if (storageKey === 'potionBag') storageItems = inventories.potionBag || [];
  else if (storageKey === 'fishingBag') storageItems = inventories.fishingBag || [];
  else if (storageKey === 'personalVault') storageItems = inventories.personalVault || [];

  // -------------------------------------------------------------
  // VIEW: 54-SLOT SKYBLOCK MENU (Default)
  // -------------------------------------------------------------
  if (screen === 'menu') {
    return (
      <div className="mc-chest-wrapper">
        <div className="mc-chest-window">
          {/* Header */}
          <div className="mc-chest-header">
            <span className="mc-chest-title text-2xl font-bold">SkyBlock Menu</span>
            {onClose && (
              <button onClick={onClose} className="mc-close-button" title="Close [ESC]">
                <img src="/textures/minecraft/barrier.png" alt="Close" className="w-4 h-4 pointer-events-none" />
              </button>
            )}
          </div>

          {/* 54-Slot Chest Grid */}
          <div className="mc-chest-grid">
            {menuSlots.map((slot, idx) => {
              const dataAttr = slot?.rawItem && slot.rawItem.rawName !== ' '
                ? encodeURIComponent(JSON.stringify(slot.rawItem))
                : null;
              const isGlass = slot?.type === 'glass';

              return (
                <div
                  key={idx}
                  onClick={() => handleSlotClick(slot)}
                  className={`mc-slot-cell ${isGlass ? 'glass-border' : 'cursor-pointer hover:brightness-110'}`}
                  data-item={dataAttr}
                >
                  {slot?.icon && (
                    <img
                      src={slot.icon}
                      alt={slot.name || ''}
                      className="w-7 h-7 object-contain pointer-events-none select-none rounded-[2px]"
                      style={{ imageRendering: 'pixelated' }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Inventory Header */}
          <div className="mc-inventory-header">
            <span className="mc-chest-title text-xl">Inventory</span>
            <span className="minecraft-font text-base text-gray-600 font-bold">
              {player.username || ''}
            </span>
          </div>

          {/* 3x9 Main Player Inventory */}
          <div className="mc-inventory-grid">
            {Array.from({ length: 27 }).map((_, idx) => {
              const item = mainItems[idx];
              const dataAttr = item && !item.empty ? encodeURIComponent(JSON.stringify(item)) : null;
              const tex = item && !item.empty ? getItemTexture(item) : null;
              const isEnch = item && (item.starsCount > 0 || item.recombobulated || (item.enchants && Object.keys(item.enchants).length > 0));

              return (
                <div key={idx} className="mc-slot-cell" data-item={dataAttr}>
                  {item && !item.empty && (
                    <>
                      {tex ? (
                        <img
                          src={tex}
                          alt={item.cleanName || ''}
                          className={`w-7 h-7 object-contain pointer-events-none select-none ${isEnch ? 'mc-enchanted' : ''}`}
                          style={{ imageRendering: 'pixelated' }}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <span
                          className="text-[10px] font-bold truncate select-none pointer-events-none px-0.5"
                          style={{ color: item.rarityColor || '#fff' }}
                        >
                          {item.cleanName?.slice(0, 4)}
                        </span>
                      )}
                      {item.count && item.count > 1 && (
                        <span className="mc-slot-count text-[11px]">{item.count}</span>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* 1x9 Hotbar */}
          <div className="mc-hotbar-grid">
            {Array.from({ length: 9 }).map((_, idx) => {
              const item = hotbarItems[idx];
              const dataAttr = item && !item.empty ? encodeURIComponent(JSON.stringify(item)) : null;
              const tex = item && !item.empty ? getItemTexture(item) : null;
              const isEnch = item && (item.starsCount > 0 || item.recombobulated || (item.enchants && Object.keys(item.enchants).length > 0));

              return (
                <div key={idx} className="mc-slot-cell" data-item={dataAttr}>
                  {item && !item.empty && (
                    <>
                      {tex ? (
                        <img
                          src={tex}
                          alt={item.cleanName || ''}
                          className={`w-7 h-7 object-contain pointer-events-none select-none ${isEnch ? 'mc-enchanted' : ''}`}
                          style={{ imageRendering: 'pixelated' }}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <span
                          className="text-[10px] font-bold truncate select-none pointer-events-none px-0.5"
                          style={{ color: item.rarityColor || '#fff' }}
                        >
                          {item.cleanName?.slice(0, 4)}
                        </span>
                      )}
                      {item.count && item.count > 1 && (
                        <span className="mc-slot-count text-[11px]">{item.count}</span>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SUB-SCREEN WRAPPER
  // -------------------------------------------------------------
  const renderScreenHeader = (title) => (
    <div className="mc-chest-header pb-2 border-b-2 border-[#555555] w-full flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setScreen('menu')}
          className="mc-stone-button text-sm px-2.5 py-0.5"
        >
          ◀ Back to Menu
        </button>
        <span className="mc-chest-title text-2xl font-bold">{title}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="mc-close-button" title="Close [ESC]">
          <img src="/textures/minecraft/barrier.png" alt="Close" className="w-4 h-4 pointer-events-none" />
        </button>
      )}
    </div>
  );

  return (
    <div className="mc-chest-wrapper">
      <div className="mc-chest-window w-full max-w-4xl max-h-[92vh] flex flex-col p-4 overflow-y-auto">
        {/* SUB-SCREEN: PROFILE & GEAR */}
        {screen === 'profile' && (
          <div className="space-y-4">
            {renderScreenHeader('Your SkyBlock Profile')}

            {/* Profile Info Header */}
            <div className="mc-inset-box rounded p-3 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={player.avatarUrl || `https://mc-heads.net/avatar/${player.uuid}/100`}
                  className="w-16 h-16 rounded bg-[#090c10] border-2 border-amber-500/50"
                  alt="Avatar"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-black bg-amber-400/20 text-amber-400 border border-amber-400/30">
                      [{player.rank || 'DEFAULT'}]
                    </span>
                    <h2 className="text-xl font-black text-white">{player.username}</h2>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-800 text-gray-300">
                      {selectedProfile.cuteName || 'Standard'} ({selectedProfile.gameMode || 'Standard'})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 flex-wrap text-xs">
                    <span className="text-gray-300">SB Level: <strong className="text-cyan-400 font-mono">{misc.skyblockLevel || 0}</strong></span>
                    <span className="text-gray-300">Skill Avg: <strong className="text-emerald-400 font-mono">{skills.skillAverage || 0}</strong></span>
                    <span className="text-gray-300">Purse: <strong className="text-amber-400 font-mono">{economy.formattedPurse || 0}</strong></span>
                    <span className="text-gray-300">Bank: <strong className="text-blue-400 font-mono">{economy.formattedBank || 0}</strong></span>
                  </div>
                </div>
              </div>
              <button onClick={onSwitchUser} className="mc-stone-button text-xs px-3 py-1">
                Switch IGN
              </button>
            </div>

            {/* Equipped Armor & Equipment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mc-inset-box rounded p-3 space-y-2">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Equipped Armor</h4>
                <div className="flex gap-2">
                  {(inventories.armor || []).map((i, idx) => (
                    <div key={idx}>{renderSlot(i, 'w-12 h-12')}</div>
                  ))}
                </div>
              </div>
              <div className="mc-inset-box rounded p-3 space-y-2">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Equipment</h4>
                <div className="flex gap-2">
                  {(inventories.equipment || []).map((i, idx) => (
                    <div key={idx}>{renderSlot(i, 'w-12 h-12')}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sub-tab navigation for deep stats */}
            <div className="border-b-2 border-[#555555] flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { key: 'gear', label: 'Gear Stats' },
                { key: 'slayers', label: 'Slayers' },
                { key: 'dungeons', label: 'Dungeons' },
                { key: 'mining', label: 'Mining' },
                { key: 'garden', label: 'Garden' },
                { key: 'rift', label: 'Rift' },
                { key: 'misc', label: 'Misc' },
              ].map(st => (
                <button
                  key={st.key}
                  onClick={() => setProfileSubtab(st.key)}
                  className={`mc-stone-button text-xs px-2.5 py-1 ${profileSubtab === st.key ? 'active font-bold' : ''}`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {profileSubtab === 'gear' && (
              <div className="mc-inset-box rounded p-3">
                <h4 className="text-xs font-bold text-amber-400 mb-2 uppercase">Core Profile Stats</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-[#1f242c]"><span className="text-red-400 block font-bold">❤ Health</span> 1,240 HP</div>
                  <div className="p-2 rounded bg-[#1f242c]"><span className="text-emerald-400 block font-bold">❈ Defense</span> 650</div>
                  <div className="p-2 rounded bg-[#1f242c]"><span className="text-red-500 block font-bold">❁ Strength</span> 420</div>
                  <div className="p-2 rounded bg-[#1f242c]"><span className="text-white block font-bold">✦ Speed</span> 250%</div>
                  <div className="p-2 rounded bg-[#1f242c]"><span className="text-blue-400 block font-bold">☣ Crit Chance</span> 100%</div>
                  <div className="p-2 rounded bg-[#1f242c]"><span className="text-blue-500 block font-bold">☠ Crit Damage</span> 512%</div>
                  <div className="p-2 rounded bg-[#1f242c]"><span className="text-cyan-400 block font-bold">✎ Intelligence</span> 890</div>
                  <div className="p-2 rounded bg-[#1f242c]"><span className="text-amber-400 block font-bold">✯ Magic Find</span> 124</div>
                </div>
              </div>
            )}

            {profileSubtab === 'slayers' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(slayers.slayers || []).map(boss => (
                  <div key={boss.id} className="mc-inset-box rounded p-3 space-y-1 text-xs">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">{boss.icon} {boss.name}</span>
                      <span className="text-amber-400 font-mono">LVL {boss.level}</span>
                    </div>
                    <div className="text-gray-400 font-mono">{boss.xp.toLocaleString()} XP</div>
                  </div>
                ))}
              </div>
            )}

            {profileSubtab === 'dungeons' && (
              <div className="mc-inset-box rounded p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-purple-400">The Catacombs Lvl {dungeons.catacombs?.level || 0}</h4>
                  <span className="text-xs text-gray-300 font-mono">Secrets: {(dungeons.secrets || 0).toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  {(dungeons.classes || []).map(cls => (
                    <div key={cls.id} className="p-2 rounded bg-[#1f242c] text-center">
                      <span className="text-gray-300 block">{cls.name}</span>
                      <span className="font-bold text-amber-400 font-mono">Lvl {cls.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profileSubtab === 'mining' && (
              <div className="mc-inset-box rounded p-3 space-y-2 text-xs">
                <h4 className="font-bold text-cyan-400">Heart of the Mountain Lvl {mining?.level || 0}</h4>
                <div className="grid grid-cols-3 gap-2 font-mono">
                  <div className="p-2 rounded bg-[#1f242c] text-emerald-400">Mithril: {(mining?.powders?.mithril?.current || 0).toLocaleString()}</div>
                  <div className="p-2 rounded bg-[#1f242c] text-pink-400">Gemstone: {(mining?.powders?.gemstone?.current || 0).toLocaleString()}</div>
                  <div className="p-2 rounded bg-[#1f242c] text-cyan-400">Glacite: {(mining?.powders?.glacite?.current || 0).toLocaleString()}</div>
                </div>
              </div>
            )}

            {profileSubtab === 'garden' && (
              <div className="mc-inset-box rounded p-3 space-y-2 text-xs">
                <h4 className="font-bold text-emerald-400">Garden Level {garden.level?.level || 0}</h4>
                <p className="text-gray-300">Unlocked Plots: <strong className="text-white">{garden.unlockedPlotsCount || 0} / 24</strong></p>
                <p className="text-gray-300">Unique Visitors: <strong className="text-white">{garden.visitors?.unique || 0}</strong></p>
              </div>
            )}

            {profileSubtab === 'rift' && (
              <div className="mc-inset-box rounded p-3 space-y-2 text-xs">
                <h4 className="font-bold text-purple-400">The Rift Dimension</h4>
                <p className="text-gray-300">Enigma Souls: <strong className="text-white">{rift.enigmaSouls || 0} / 42</strong></p>
                <p className="text-gray-300">Timecharms: <strong className="text-white">{(rift.timecharms || []).length} / 8</strong></p>
              </div>
            )}

            {profileSubtab === 'misc' && (
              <div className="mc-inset-box rounded p-3 grid grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-[#1f242c] text-red-400">Deaths: {(misc.deaths || 0).toLocaleString()}</div>
                <div className="p-2 rounded bg-[#1f242c] text-emerald-400">Mob Kills: {(misc.kills || 0).toLocaleString()}</div>
                <div className="p-2 rounded bg-[#1f242c] text-pink-400">Fairy Souls: {(misc.fairySouls || 0).toLocaleString()}</div>
              </div>
            )}
          </div>
        )}

        {/* SUB-SCREEN: SKILLS */}
        {screen === 'skills' && (
          <div className="space-y-4">
            {renderScreenHeader('Your Skills')}
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-bold text-gray-200">Non-Cosmetic Skill Average</span>
              <span className="text-base text-emerald-400 font-mono font-bold">{skills.skillAverage || 0}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(skills.skills || []).map(skill => {
                const isMax = skill.level >= skill.maxLevel;
                return (
                  <div key={skill.id} className="mc-inset-box rounded p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{skill.icon}</span>
                        <div>
                          <h4 className="font-bold text-sm text-white">{skill.name}</h4>
                          <span className="text-[11px] text-gray-400 font-mono">{(skill.xp || 0).toLocaleString()} XP</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-black font-mono ${
                        isMax ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-gray-800 text-gray-200'
                      }`}>
                        {isMax ? 'MAX ' : 'LVL '}{skill.level}
                      </span>
                    </div>
                    <div className="w-full bg-[#090c10] h-2 rounded-full overflow-hidden border border-[#21262d]">
                      <div className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full" style={{ width: `${skill.progressPercent || 0}%` }} />
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-400 font-mono">
                      <span>{isMax ? 'Maxed Out' : `${(skill.currentXp || 0).toLocaleString()} / ${(skill.nextLevelXp || 0).toLocaleString()}`}</span>
                      <span>{skill.progressPercent || 0}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUB-SCREEN: STORAGE */}
        {screen === 'storage' && (
          <div className="space-y-4">
            {renderScreenHeader('Storage & Bags')}

            {/* Storage Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {[
                { key: 'enderChest', label: 'Ender Chest' },
                { key: 'talismanBag', label: 'Accessory Bag' },
                { key: 'backpacks', label: 'Backpacks / Sacks' },
                { key: 'potionBag', label: 'Potion Bag' },
                { key: 'fishingBag', label: 'Fishing Bag' },
                { key: 'personalVault', label: 'Personal Vault' },
              ].map(st => (
                <button
                  key={st.key}
                  onClick={() => setStorageKey(st.key)}
                  className={`mc-stone-button text-xs px-2.5 py-1 ${storageKey === st.key ? 'active font-bold' : ''}`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Storage Chest Content */}
            <div className="mc-inset-box rounded p-3 flex flex-col items-center">
              {storageKey === 'backpacks' ? (
                (!inventories.backpacks || inventories.backpacks.length === 0) ? (
                  <span className="text-xs text-gray-400 p-4">No backpacks or sacks found in inventory.</span>
                ) : (
                  <div className="space-y-4 w-full">
                    {inventories.backpacks.map(bp => (
                      <div key={bp.index}>
                        <span className="text-xs font-bold text-amber-400 block mb-1.5">{bp.name}</span>
                        <div className="grid grid-cols-9 gap-1">
                          {(bp.items || []).map((i, idx) => (
                            <div key={idx}>{renderSlot(i)}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : storageItems.length === 0 ? (
                <span className="text-xs text-gray-400 p-6">This bag is empty or player API is restricted.</span>
              ) : (
                <div className="grid grid-cols-9 gap-1">
                  {storageItems.slice(0, 54).map((i, idx) => (
                    <div key={idx}>{renderSlot(i)}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Player Inventory Below Storage */}
            <div className="mc-inset-box rounded p-3">
              <span className="text-xs font-bold text-gray-300 block mb-2">Player Inventory</span>
              <div className="p-2 bg-[#4a4a4a] rounded border-2 border-[#373737] w-fit mx-auto">
                <div className="grid grid-cols-9 gap-1 mb-1">
                  {mainItems.map((i, idx) => (
                    <div key={idx}>{renderSlot(i)}</div>
                  ))}
                </div>
                <div className="grid grid-cols-9 gap-1 pt-1 border-t-2 border-[#373737]">
                  {hotbarItems.map((i, idx) => (
                    <div key={idx}>{renderSlot(i)}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB-SCREEN: PETS */}
        {screen === 'pets' && (
          <div className="space-y-4">
            {renderScreenHeader(`Pet Collection (${pets.length})`)}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {pets.map((pet, idx) => (
                <div key={idx} className={`mc-inset-box rounded p-3 border ${pet.active ? 'border-amber-400' : 'border-[#373737]'} space-y-2 relative`}>
                  {pet.active && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-500 text-black">
                      ACTIVE
                    </span>
                  )}
                  <h4 className="font-bold text-sm text-white">{pet.cleanName}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black font-mono px-2 py-0.5 rounded bg-[#090c10] border border-[#21262d] text-amber-400">
                      Lvl {pet.level}
                    </span>
                    <span className="text-xs font-semibold text-gray-400 uppercase">{pet.tier}</span>
                  </div>
                  {pet.heldItem && (
                    <p className="text-[11px] text-cyan-400 font-mono truncate">Item: {pet.heldItem}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-SCREEN: CRAFTING TABLE */}
        {screen === 'crafting' && (
          <div className="space-y-4">
            {renderScreenHeader('Crafting Table')}
            <div className="mc-inset-box rounded p-4 text-center">
              <span className="text-xs text-gray-300 block mb-3">Quick Craft Recipes</span>
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {[
                  { id: 'super_compactor', name: 'Super Compactor 3000', icon: '/textures/minecraft/dropper.png' },
                  { id: 'aspect_of_the_end', name: 'Aspect of the End', icon: '/textures/minecraft/diamond_sword.png' },
                  { id: 'enchanted_diamond', name: 'Enchanted Diamond Block', icon: '/textures/minecraft/diamond_block.png' },
                  { id: 'recombobulator', name: 'Recombobulator 3000', icon: '/textures/minecraft/nether_star.png' },
                ].map(rec => (
                  <button
                    key={rec.id}
                    onClick={() => setCraftingRecipe(rec.id)}
                    className={`mc-stone-button text-xs px-3 py-1 flex items-center gap-1.5 ${craftingRecipe === rec.id ? 'active font-bold' : ''}`}
                  >
                    <img src={rec.icon} alt="" className="w-4 h-4 object-contain" />
                    {rec.name}
                  </button>
                ))}
              </div>

              {/* 3x3 Crafting Grid + Result */}
              <div className="flex items-center justify-center gap-6 my-4">
                <div className="grid grid-cols-3 gap-1 p-2 bg-[#4a4a4a] rounded border-2 border-[#373737]">
                  {Array.from({ length: 9 }).map((_, idx) => (
                    <div key={idx} className="mc-slot-cell">
                      {craftingRecipe === 'super_compactor' && (idx === 4 ? (
                        <img src="/textures/minecraft/redstone_torch.png" alt="" className="w-7 h-7" />
                      ) : (
                        <img src="/textures/minecraft/cobblestone.png" alt="" className="w-7 h-7" />
                      ))}
                      {craftingRecipe === 'aspect_of_the_end' && (idx === 7 ? (
                        <img src="/textures/minecraft/diamond.png" alt="" className="w-7 h-7" />
                      ) : [1, 4].includes(idx) ? (
                        <img src="/textures/minecraft/ender_pearl.png" alt="" className="w-7 h-7" />
                      ) : null)}
                      {craftingRecipe === 'enchanted_diamond' && (
                        <img src="/textures/minecraft/diamond.png" alt="" className="w-7 h-7" />
                      )}
                      {craftingRecipe === 'recombobulator' && (
                        <img src="/textures/minecraft/obsidian.png" alt="" className="w-7 h-7" />
                      )}
                    </div>
                  ))}
                </div>
                <span className="text-3xl text-gray-500 font-bold">➜</span>
                <div className="p-2 bg-[#4a4a4a] rounded border-2 border-[#373737]">
                  <div className="mc-slot-cell w-12 h-12">
                    {craftingRecipe === 'super_compactor' && <img src="/textures/minecraft/dropper.png" alt="" className="w-8 h-8" />}
                    {craftingRecipe === 'aspect_of_the_end' && <img src="/textures/minecraft/diamond_sword.png" alt="" className="w-8 h-8" />}
                    {craftingRecipe === 'enchanted_diamond' && <img src="/textures/minecraft/diamond_block.png" alt="" className="w-8 h-8" />}
                    {craftingRecipe === 'recombobulator' && <img src="/textures/minecraft/nether_star.png" alt="" className="w-8 h-8" />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB-SCREEN: WARDROBE */}
        {screen === 'wardrobe' && (
          <div className="space-y-4">
            {renderScreenHeader('Wardrobe')}
            <div className="mc-inset-box rounded p-4 space-y-4">
              <span className="text-xs text-gray-300 block">Armor Set Slots (1 - 4 Unlocked)</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { slot: 1, name: 'Active Armor Set', active: true, helmet: '/textures/minecraft/diamond_helmet.png', chest: '/textures/minecraft/diamond_chestplate.png', legs: '/textures/minecraft/diamond_leggings.png', boots: '/textures/minecraft/diamond_boots.png' },
                  { slot: 2, name: 'Sorrow Mining Set', active: false, helmet: '/textures/minecraft/iron_block.png', chest: '/textures/minecraft/iron_block.png', legs: '/textures/minecraft/iron_block.png', boots: '/textures/minecraft/iron_block.png' },
                  { slot: 3, name: 'Young Dragon Set', active: false, helmet: '/textures/minecraft/feather.png', chest: '/textures/minecraft/feather.png', legs: '/textures/minecraft/feather.png', boots: '/textures/minecraft/feather.png' },
                  { slot: 4, name: 'Mastiff Shaman Set', active: false, helmet: '/textures/minecraft/gold_block.png', chest: '/textures/minecraft/gold_block.png', legs: '/textures/minecraft/gold_block.png', boots: '/textures/minecraft/gold_block.png' },
                ].map(set => (
                  <div key={set.slot} className={`p-3 rounded border-2 ${set.active ? 'border-amber-400 bg-amber-500/10' : 'border-[#373737] bg-[#1a1f26]'} text-center space-y-2`}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white">Slot {set.slot}</span>
                      {set.active && <span className="text-[10px] font-black bg-amber-500 text-black px-1.5 py-0.5 rounded">EQUIPPED</span>}
                    </div>
                    <div className="flex justify-center gap-1.5 py-2">
                      <div className="mc-slot-cell w-9 h-9"><img src={set.helmet} alt="" className="w-6 h-6 object-contain" /></div>
                      <div className="mc-slot-cell w-9 h-9"><img src={set.chest} alt="" className="w-6 h-6 object-contain" /></div>
                      <div className="mc-slot-cell w-9 h-9"><img src={set.legs} alt="" className="w-6 h-6 object-contain" /></div>
                      <div className="mc-slot-cell w-9 h-9"><img src={set.boots} alt="" className="w-6 h-6 object-contain" /></div>
                    </div>
                    <button className="mc-stone-button text-xs px-2.5 py-0.5 w-full">
                      {set.active ? 'Unequip' : 'Equip Set'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUB-SCREEN: PERSONAL BANK */}
        {screen === 'bank' && (
          <div className="space-y-4">
            {renderScreenHeader('Personal Bank')}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="mc-inset-box rounded p-4 space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase">Coin Purse</span>
                <h3 className="text-2xl font-black text-white font-mono">{economy.formattedPurse || 0}</h3>
                <span className="text-xs text-gray-400 block">Carried coins. Lost on death without cookie buff.</span>
              </div>
              <div className="mc-inset-box rounded p-4 space-y-2">
                <span className="text-xs font-bold text-blue-400 uppercase">Bank Account</span>
                <h3 className="text-2xl font-black text-white font-mono">{economy.formattedBank || 0}</h3>
                <span className="text-xs text-gray-400 block">Safe from death penalty. Generates 2% interest.</span>
              </div>
            </div>
            <div className="mc-inset-box rounded p-4 space-y-3">
              <h4 className="text-xs font-bold text-gray-300 uppercase">Quick Bank Actions</h4>
              <div className="flex flex-wrap gap-2">
                <button className="mc-stone-button text-xs px-3 py-1 text-emerald-400 font-bold">Deposit Whole Purse</button>
                <button className="mc-stone-button text-xs px-3 py-1 text-emerald-400">Deposit Half</button>
                <button className="mc-stone-button text-xs px-3 py-1 text-amber-400 font-bold">Withdraw 10M</button>
                <button className="mc-stone-button text-xs px-3 py-1 text-amber-400">Withdraw 1M</button>
              </div>
            </div>
          </div>
        )}

        {/* SUB-SCREEN: FAST TRAVEL */}
        {screen === 'fast_travel' && (
          <div className="space-y-4">
            {renderScreenHeader('Fast Travel Warps')}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[
                { name: 'Hub Village', icon: '/textures/minecraft/compass.png', desc: 'Central city, AH, Bazaar, Bank' },
                { name: 'Private Island', icon: '/textures/minecraft/oak_log.png', desc: 'Your private SkyBlock estate' },
                { name: 'The Park', icon: '/textures/minecraft/birch_log.png', desc: 'Foraging forests and Melody' },
                { name: 'Spider\'s Den', icon: '/textures/minecraft/string.png', desc: 'Arachnid nest and Spider Slayer' },
                { name: 'Crimson Isle', icon: '/textures/minecraft/netherrack.png', desc: 'Kuudra and Nether factions' },
                { name: 'The End', icon: '/textures/minecraft/end_stone.png', desc: 'Dragons, Zealots, and Enderman' },
                { name: 'Deep Caverns', icon: '/textures/minecraft/iron_ingot.png', desc: 'Gunpowder, Lapis, Diamond mines' },
                { name: 'Dwarven Mines', icon: '/textures/minecraft/diamond_pickaxe.png', desc: 'Mithril, HOTM, and Commissions' },
                { name: 'The Garden', icon: '/textures/minecraft/wheat.png', desc: 'Crops, plots, and visitors' },
                { name: 'The Rift', icon: '/textures/minecraft/ender_eye.png', desc: 'Alternate dimension puzzles' },
                { name: 'Dungeon Hub', icon: '/textures/minecraft/wither_skeleton_skull.png', desc: 'Catacombs entrance and Mort' },
                { name: 'Gold Mine', icon: '/textures/minecraft/gold_ingot.png', desc: 'Rusty, Iron, and Gold ore' },
              ].map(dest => (
                <div key={dest.name} className="mc-inset-box rounded p-3 text-center space-y-2 hover:border-amber-400 cursor-pointer transition-colors">
                  <img src={dest.icon} alt={dest.name} className="w-8 h-8 mx-auto object-contain" />
                  <h4 className="font-bold text-xs text-white">{dest.name}</h4>
                  <p className="text-[10px] text-gray-400 line-clamp-2">{dest.desc}</p>
                  <button className="mc-stone-button text-[11px] px-2 py-0.5 w-full">Warp</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-SCREEN: PROFILE MANAGEMENT */}
        {screen === 'profiles' && (
          <div className="space-y-4">
            {renderScreenHeader('Profile Management')}
            <div className="flex justify-between items-center px-1">
              <span className="text-xs text-gray-300">Switch active SkyBlock profile:</span>
              <button onClick={onSwitchUser} className="mc-stone-button text-xs px-3 py-1">
                Switch IGN / User
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {profiles.map(p => {
                const isSelected = p.profileId === selectedProfile.profileId;
                return (
                  <div key={p.profileId} className={`mc-inset-box rounded p-4 space-y-2 border-2 ${isSelected ? 'border-amber-400 bg-amber-500/10' : 'border-[#373737]'}`}>
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-sm text-white">{p.cuteName}</h4>
                      {isSelected ? (
                        <span className="text-[10px] font-black bg-amber-500 text-black px-1.5 py-0.5 rounded">ACTIVE</span>
                      ) : (
                        <span className="text-[10px] text-gray-400">{p.gameMode || 'Standard'}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 font-mono">Profile ID: {p.profileId.slice(0, 8)}...</p>
                    <button
                      onClick={() => onSelectProfile && onSelectProfile(p.profileId)}
                      className={`mc-stone-button text-xs px-2.5 py-1 w-full ${isSelected ? 'active font-bold' : ''}`}
                    >
                      {isSelected ? 'Currently Selected' : 'Switch to Profile'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUB-SCREEN: BOOSTER COOKIE */}
        {screen === 'cookie' && (
          <div className="space-y-4">
            {renderScreenHeader('Booster Cookie Buff')}
            <div className="mc-inset-box rounded p-4 space-y-3">
              <div className="flex items-center gap-3">
                <img src="/textures/minecraft/cookie.png" alt="Cookie" className="w-10 h-10 object-contain" />
                <div>
                  <h3 className="font-bold text-base text-amber-400">Cookie Buff Active</h3>
                  <span className="text-xs text-gray-300 font-mono">Remaining Duration: 14d 6h 32m</span>
                </div>
              </div>
              <div className="pt-2 border-t border-[#373737] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-[#1a1f26] text-emerald-400">✓ +25% Skill XP boost across all skills</div>
                <div className="p-2 rounded bg-[#1a1f26] text-emerald-400">✓ +15 Magic Find</div>
                <div className="p-2 rounded bg-[#1a1f26] text-emerald-400">✓ Keep coins & potion effects upon death</div>
                <div className="p-2 rounded bg-[#1a1f26] text-emerald-400">✓ Access /ah and /craft anywhere in world</div>
                <div className="p-2 rounded bg-[#1a1f26] text-emerald-400">✓ Permanent flight on private island</div>
                <div className="p-2 rounded bg-[#1a1f26] text-emerald-400">✓ Earn SkyBlock Bits every 30 minutes</div>
              </div>
            </div>
          </div>
        )}

        {/* SUB-SCREEN: SETTINGS */}
        {screen === 'settings' && (
          <div className="space-y-4">
            {renderScreenHeader('SkyBlock Settings')}
            <div className="mc-inset-box rounded p-4 space-y-3">
              <h4 className="font-bold text-xs text-amber-400 uppercase">Public API Preferences</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-[#1a1f26] flex justify-between items-center">
                  <span>Inventory API</span>
                  <span className={privacy.inventoryRestricted ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {privacy.inventoryRestricted ? 'Disabled' : 'Enabled'}
                  </span>
                </div>
                <div className="p-2 rounded bg-[#1a1f26] flex justify-between items-center">
                  <span>Skills API</span>
                  <span className={privacy.skillsRestricted ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {privacy.skillsRestricted ? 'Disabled' : 'Enabled'}
                  </span>
                </div>
                <div className="p-2 rounded bg-[#1a1f26] flex justify-between items-center">
                  <span>Banking API</span>
                  <span className={privacy.bankingRestricted ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {privacy.bankingRestricted ? 'Disabled' : 'Enabled'}
                  </span>
                </div>
                <div className="p-2 rounded bg-[#1a1f26] flex justify-between items-center">
                  <span>Collections API</span>
                  <span className={privacy.collectionsRestricted ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {privacy.collectionsRestricted ? 'Disabled' : 'Enabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB-SCREEN: COLLECTION */}
        {screen === 'collection' && (
          <div className="space-y-4">
            {renderScreenHeader('Collections')}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {[
                { key: 'farming', label: 'Farming' },
                { key: 'mining', label: 'Mining' },
                { key: 'combat', label: 'Combat' },
                { key: 'foraging', label: 'Foraging' },
                { key: 'fishing', label: 'Fishing' },
              ].map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setCollectionTab(cat.key)}
                  className={`mc-stone-button text-xs px-2.5 py-1 ${collectionTab === cat.key ? 'active font-bold' : ''}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {collectionTab === 'farming' && [
                { name: 'Wheat', tier: 'IX Max', icon: '/textures/minecraft/wheat.png', count: '142,500' },
                { name: 'Carrot', tier: 'VIII', icon: '/textures/minecraft/carrot.png', count: '89,200' },
                { name: 'Potato', tier: 'IX Max', icon: '/textures/minecraft/potato.png', count: '115,000' },
                { name: 'Pumpkin', tier: 'VII', icon: '/textures/minecraft/pumpkin.png', count: '45,300' },
                { name: 'Melon', tier: 'IX Max', icon: '/textures/minecraft/melon.png', count: '220,100' },
                { name: 'Sugar Cane', tier: 'VIII', icon: '/textures/minecraft/sugar_cane.png', count: '78,400' },
                { name: 'Cactus', tier: 'VI', icon: '/textures/minecraft/cactus.png', count: '32,100' },
                { name: 'Cocoa Beans', tier: 'V', icon: '/textures/minecraft/cocoa_beans.png', count: '19,800' },
              ].map(col => (
                <div key={col.name} className="mc-inset-box rounded p-3 text-center space-y-1">
                  <img src={col.icon} alt={col.name} className="w-7 h-7 mx-auto object-contain" />
                  <h4 className="font-bold text-xs text-white">{col.name}</h4>
                  <span className="text-[10px] text-amber-400 font-bold block">{col.tier}</span>
                  <span className="text-[10px] text-gray-400 font-mono">{col.count} collected</span>
                </div>
              ))}

              {collectionTab === 'mining' && [
                { name: 'Cobblestone', tier: 'IX Max', icon: '/textures/minecraft/cobblestone.png', count: '512,000' },
                { name: 'Coal', tier: 'VIII', icon: '/textures/minecraft/coal.png', count: '64,000' },
                { name: 'Iron Ingot', tier: 'IX Max', icon: '/textures/minecraft/iron_ingot.png', count: '180,000' },
                { name: 'Gold Ingot', tier: 'VII', icon: '/textures/minecraft/gold_ingot.png', count: '52,000' },
                { name: 'Diamond', tier: 'IX Max', icon: '/textures/minecraft/diamond.png', count: '340,000' },
                { name: 'Lapis Lazuli', tier: 'VIII', icon: '/textures/minecraft/lapis_lazuli.png', count: '95,000' },
                { name: 'Redstone', tier: 'IX Max', icon: '/textures/minecraft/redstone.png', count: '450,000' },
                { name: 'Emerald', tier: 'VIII', icon: '/textures/minecraft/emerald.png', count: '120,000' },
              ].map(col => (
                <div key={col.name} className="mc-inset-box rounded p-3 text-center space-y-1">
                  <img src={col.icon} alt={col.name} className="w-7 h-7 mx-auto object-contain" />
                  <h4 className="font-bold text-xs text-white">{col.name}</h4>
                  <span className="text-[10px] text-amber-400 font-bold block">{col.tier}</span>
                  <span className="text-[10px] text-gray-400 font-mono">{col.count} collected</span>
                </div>
              ))}

              {collectionTab === 'combat' && [
                { name: 'Rotten Flesh', tier: 'IX Max', icon: '/textures/minecraft/rotten_flesh.png', count: '280,000' },
                { name: 'Bone', tier: 'VIII', icon: '/textures/minecraft/bone.png', count: '110,000' },
                { name: 'String', tier: 'IX Max', icon: '/textures/minecraft/string.png', count: '190,000' },
                { name: 'Spider Eye', tier: 'VII', icon: '/textures/minecraft/spider_eye.png', count: '48,000' },
                { name: 'Gunpowder', tier: 'VIII', icon: '/textures/minecraft/gunpowder.png', count: '76,000' },
                { name: 'Ender Pearl', tier: 'IX Max', icon: '/textures/minecraft/ender_pearl.png', count: '410,000' },
                { name: 'Slimeball', tier: 'VI', icon: '/textures/minecraft/slimeball.png', count: '35,000' },
                { name: 'Blaze Rod', tier: 'VII', icon: '/textures/minecraft/blaze_rod.png', count: '62,000' },
              ].map(col => (
                <div key={col.name} className="mc-inset-box rounded p-3 text-center space-y-1">
                  <img src={col.icon} alt={col.name} className="w-7 h-7 mx-auto object-contain" />
                  <h4 className="font-bold text-xs text-white">{col.name}</h4>
                  <span className="text-[10px] text-amber-400 font-bold block">{col.tier}</span>
                  <span className="text-[10px] text-gray-400 font-mono">{col.count} collected</span>
                </div>
              ))}

              {collectionTab === 'foraging' && [
                { name: 'Oak Wood', tier: 'IX Max', icon: '/textures/minecraft/oak_log.png', count: '185,000' },
                { name: 'Birch Wood', tier: 'VIII', icon: '/textures/minecraft/birch_log.png', count: '92,000' },
                { name: 'Spruce Wood', tier: 'VII', icon: '/textures/minecraft/spruce_log.png', count: '64,000' },
                { name: 'Dark Oak Wood', tier: 'IX Max', icon: '/textures/minecraft/dark_oak_log.png', count: '240,000' },
                { name: 'Acacia Wood', tier: 'VI', icon: '/textures/minecraft/acacia_log.png', count: '41,000' },
                { name: 'Jungle Wood', tier: 'VIII', icon: '/textures/minecraft/jungle_log.png', count: '105,000' },
              ].map(col => (
                <div key={col.name} className="mc-inset-box rounded p-3 text-center space-y-1">
                  <img src={col.icon} alt={col.name} className="w-7 h-7 mx-auto object-contain" />
                  <h4 className="font-bold text-xs text-white">{col.name}</h4>
                  <span className="text-[10px] text-amber-400 font-bold block">{col.tier}</span>
                  <span className="text-[10px] text-gray-400 font-mono">{col.count} collected</span>
                </div>
              ))}

              {collectionTab === 'fishing' && [
                { name: 'Raw Fish', tier: 'IX Max', icon: '/textures/minecraft/raw_fish.png', count: '160,000' },
                { name: 'Raw Salmon', tier: 'VIII', icon: '/textures/minecraft/salmon.png', count: '85,000' },
                { name: 'Clownfish', tier: 'VI', icon: '/textures/minecraft/tropical_fish.png', count: '28,000' },
                { name: 'Pufferfish', tier: 'VII', icon: '/textures/minecraft/pufferfish.png', count: '39,000' },
                { name: 'Prismarine Shard', tier: 'V', icon: '/textures/minecraft/prismarine_shard.png', count: '18,000' },
                { name: 'Clay', tier: 'VIII', icon: '/textures/minecraft/clay_ball.png', count: '94,000' },
              ].map(col => (
                <div key={col.name} className="mc-inset-box rounded p-3 text-center space-y-1">
                  <img src={col.icon} alt={col.name} className="w-7 h-7 mx-auto object-contain" />
                  <h4 className="font-bold text-xs text-white">{col.name}</h4>
                  <span className="text-[10px] text-amber-400 font-bold block">{col.tier}</span>
                  <span className="text-[10px] text-gray-400 font-mono">{col.count} collected</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-SCREEN: RECIPES */}
        {screen === 'recipes' && (
          <div className="space-y-4">
            {renderScreenHeader('Recipe Book')}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { name: 'Super Compactor 3000', req: 'Cobblestone X', icon: '/textures/minecraft/dropper.png', cost: '7x Enchanted Cobblestone, 1x Redstone Torch' },
                { name: 'Aspect of the End', req: 'Ender Pearl VIII', icon: '/textures/minecraft/diamond_sword.png', cost: '32x Enchanted Eyes of Ender, 1x Diamond' },
                { name: 'Hot Potato Book', req: 'Potato VIII', icon: '/textures/minecraft/book.png', cost: '1x Book, 3x Enchanted Baked Potato' },
                { name: 'Enchanted Lava Bucket', req: 'Coal VIII', icon: '/textures/minecraft/iron_ingot.png', cost: '2x Enchanted Block of Coal, 1x Bucket' },
                { name: 'Juju Shortbow', req: 'String IX', icon: '/textures/minecraft/bow_standby.png', cost: '32x Null Ovoid, 1x Enchanted String' },
                { name: 'Booster Cookie Recipe', req: 'Community Center', icon: '/textures/minecraft/cookie.png', cost: 'Community Bits Barter' },
              ].map(rec => (
                <div key={rec.name} className="mc-inset-box rounded p-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <img src={rec.icon} alt="" className="w-6 h-6 object-contain" />
                    <div>
                      <h4 className="font-bold text-xs text-white">{rec.name}</h4>
                      <span className="text-[10px] text-amber-400 font-mono">Req: {rec.req}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400">{rec.cost}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-SCREEN: TRADES */}
        {screen === 'trades' && (
          <div className="space-y-4">
            {renderScreenHeader('Trades')}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[
                { name: 'Dirt (x16)', cost: '16 Coins', icon: '/textures/minecraft/dirt.png' || '/textures/minecraft/stone.png' },
                { name: 'Ice (x1)', cost: '1 Coin', icon: '/textures/minecraft/ice.png' },
                { name: 'Sand (x1)', cost: '4 Coins', icon: '/textures/minecraft/sand.png' },
                { name: 'Red Mushroom', cost: '12 Coins', icon: '/textures/minecraft/red_mushroom.png' },
                { name: 'Brown Mushroom', cost: '12 Coins', icon: '/textures/minecraft/brown_mushroom.png' },
                { name: 'Netherrack', cost: '5 Coins', icon: '/textures/minecraft/netherrack.png' },
                { name: 'Clay Ball', cost: '15 Coins', icon: '/textures/minecraft/clay_ball.png' },
                { name: 'Oak Sapling', cost: '5 Coins', icon: '/textures/minecraft/oak_log.png' },
              ].map(tr => (
                <div key={tr.name} className="mc-inset-box rounded p-3 text-center space-y-1.5">
                  <img src={tr.icon} alt="" className="w-7 h-7 mx-auto object-contain" onError={(e) => { e.currentTarget.src = '/textures/minecraft/stone.png'; }} />
                  <h4 className="font-bold text-xs text-white">{tr.name}</h4>
                  <span className="text-xs text-amber-400 font-mono block">{tr.cost}</span>
                  <button className="mc-stone-button text-[11px] px-2 py-0.5 w-full">Trade</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-SCREEN: QUESTS */}
        {screen === 'quests' && (
          <div className="space-y-4">
            {renderScreenHeader('Quest Log')}
            <div className="space-y-2">
              {[
                { title: 'The Hub Discovery', progress: '100% Completed', desc: 'Visit all 12 key districts in the Hub village and meet the villagers.', done: true },
                { title: 'The Slayer Trials', progress: '3 / 4 Slayers Maxed', desc: 'Defeat Tier IV Revenant Horror, Tarantula Broodfather, and Sven Packmaster.', done: false },
                { title: 'Dungeon Master', progress: 'Floor VII Cleared', desc: 'Defeat Necron in Floor VII of The Catacombs with S+ score.', done: true },
                { title: 'Heart of the Mountain', progress: 'HOTM 7 Unlocked', desc: 'Reach Peak of the Mountain and complete 250 commissions in Dwarven Mines.', done: false },
              ].map(q => (
                <div key={q.title} className="mc-inset-box rounded p-3 flex justify-between items-center gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      {q.title}
                      {q.done && <span className="text-[10px] bg-emerald-500 text-black px-1.5 py-0.5 rounded font-black">COMPLETED</span>}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">{q.desc}</p>
                  </div>
                  <span className={`text-xs font-mono font-bold whitespace-nowrap ${q.done ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {q.progress}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-SCREEN: CALENDAR & EVENTS */}
        {screen === 'calendar' && (
          <div className="space-y-4">
            {renderScreenHeader('Calendar and Events')}
            <div className="mc-inset-box rounded p-3 flex justify-between items-center">
              <div>
                <span className="text-xs text-gray-400 block">Current SkyBlock Date</span>
                <h4 className="text-base font-black text-white">Year 360, Late Autumn (Day 24)</h4>
              </div>
              <span className="text-xs text-amber-400 font-mono font-bold">1:40 PM (Daytime)</span>
            </div>
            <div className="space-y-2">
              {[
                { name: 'Spooky Festival', time: 'Starts in 4h 12m', icon: '/textures/minecraft/pumpkin.png', desc: 'Trick or Treat candies, Fear Mongerer shop, and Spooky pies.' },
                { name: 'Season of Jerry', time: 'Starts in 1d 8h', icon: '/textures/minecraft/ice.png', desc: 'Jerry\'s Workshop mountain defense, gifts, and Red Gift boxes.' },
                { name: 'Mining Fiesta', time: 'Starts in 2d 16h', icon: '/textures/minecraft/diamond_pickaxe.png', desc: '2x Mining XP and Refined Minerals dropping from all ores.' },
                { name: 'Dark Auction', time: 'Starts in 32m', icon: '/textures/minecraft/gold_ingot.png', desc: 'Sirius secret underground auction with exclusive items.' },
              ].map(ev => (
                <div key={ev.name} className="mc-inset-box rounded p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={ev.icon} alt="" className="w-7 h-7 object-contain" />
                    <div>
                      <h4 className="font-bold text-sm text-white">{ev.name}</h4>
                      <p className="text-xs text-gray-400">{ev.desc}</p>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono font-bold whitespace-nowrap">{ev.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-SCREEN: QUIVER */}
        {screen === 'quiver' && (
          <div className="space-y-4">
            {renderScreenHeader('Quiver Storage')}
            <div className="mc-inset-box rounded p-4 space-y-3">
              <span className="text-xs text-gray-300 block">Selected Active Arrow</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: 'flint', name: 'Flint Arrow', count: '10,240', desc: 'Standard arrows' },
                  { id: 'icy', name: 'Icy Arrow', count: '2,560', desc: 'Slows down targets' },
                  { id: 'magma', name: 'Magma Arrow', count: '1,280', desc: 'Ignites target and deals bonus flame' },
                  { id: 'toxic', name: 'Toxic Arrow', count: '3,840', desc: 'Reduces healing and poisons' },
                  { id: 'bouncy', name: 'Bouncy Arrow', count: '640', desc: 'Ricochets to secondary mobs' },
                  { id: 'armadillo', name: 'Armadillo Arrow', count: '512', desc: 'Pierces through monster armor' },
                ].map(arr => (
                  <div
                    key={arr.id}
                    onClick={() => setSelectedArrow(arr.id)}
                    className={`p-3 rounded border-2 cursor-pointer ${selectedArrow === arr.id ? 'border-amber-400 bg-amber-500/10' : 'border-[#373737] bg-[#1a1f26]'} space-y-1`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-white">{arr.name}</h4>
                      <span className="text-xs text-amber-400 font-mono font-bold">{arr.count}</span>
                    </div>
                    <p className="text-[10px] text-gray-400">{arr.desc}</p>
                    <button className={`mc-stone-button text-[11px] px-2 py-0.5 w-full mt-1 ${selectedArrow === arr.id ? 'active font-bold' : ''}`}>
                      {selectedArrow === arr.id ? 'Active' : 'Select'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
