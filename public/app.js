// Hypixel SkyBlock Intelligence Platform Client Engine
let currentPlayerData = null;
let currentBazaarProducts = [];
let bazaarCurrentPage = 0;
const BAZAAR_PAGE_SIZE = 25;
let bazaarSortColumn = 'weeklyVolume';
let bazaarSortAsc = false;

let auctionCurrentPage = 0;
let currentMuseumData = null;
let currentMuseumCategory = 'all';

// Initialize application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }
  setupTooltipListener();
  setupKeyboardShortcuts();
  updateMapDimensions();
  
  // Check if user previously saved their username
  const savedUser = localStorage.getItem('skyblock_saved_username');
  if (savedUser) {
    lookupPlayer(savedUser);
  } else {
    // Show prompt asking user for their username first
    showPromptCard();
  }
  
  // Fetch Server & API status
  fetchStatus();
  // Fetch election for the Mayor pin badge
  fetchMayorPinBadge();
});

// Full-bleed map scaling: fills 100% of viewport without black bars, keeps pins locked to houses
function updateMapDimensions() {
  const container = document.getElementById('hub-canvas');
  const wrapper = document.getElementById('hub-map-wrapper');
  if (!container || !wrapper) return;

  const W = container.clientWidth;
  const H = container.clientHeight;
  if (!W || !H) return;

  const imgRatio = 2048 / 1152;
  const winRatio = W / H;

  let renderW, renderH, offsetL, offsetT;
  if (winRatio >= imgRatio) {
    renderW = W;
    renderH = W / imgRatio;
    offsetL = 0;
    offsetT = (H - renderH) / 2;
  } else {
    renderH = H;
    renderW = H * imgRatio;
    offsetL = (W - renderW) / 2;
    offsetT = 0;
  }

  wrapper.style.width = `${renderW}px`;
  wrapper.style.height = `${renderH}px`;
  wrapper.style.left = `${offsetL}px`;
  wrapper.style.top = `${offsetT}px`;
  wrapper.style.position = 'absolute';
}

window.addEventListener('resize', updateMapDimensions);

// Setup keyboard shortcuts: ESC to close, 1-9 for Hub destinations
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeHubWindow();
      closeBazaarModal();
      closePromptCard();
      return;
    }

    // Ignore 1-9 if typing in input/textarea
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
      return;
    }

    const hotbarKeys = ['player', 'auctions', 'bazaar', 'economy', 'dungeons', 'mining', 'garden', 'election', 'museum'];
    const keyNum = parseInt(e.key, 10);
    if (keyNum >= 1 && keyNum <= 9) {
      openHubWindow(hotbarKeys[keyNum - 1]);
    }
  });
}

// Open Hub Window Dialog for any Building or Destination
function openHubWindow(destination) {
  const overlay = document.getElementById('hub-window-overlay');
  const titleEl = document.getElementById('window-title');
  const subtitleEl = document.getElementById('window-subtitle');
  if (!overlay) return;

  const destMeta = {
    player: {
      title: 'Player Profile & Gear',
      subtitle: 'Inventories, Equipped Armor, Skills, Slayers & Pets',
      view: 'player',
      subtab: 'inventory'
    },
    auctions: {
      title: 'Auction House',
      subtitle: 'Active Listings, BIN Filters & 60s Ended Snipes',
      view: 'auctions'
    },
    bazaar: {
      title: 'SkyBlock Bazaar Market',
      subtitle: '2,100+ Commodities, Order Book Depth & Arbitrage Flips',
      view: 'bazaar'
    },
    economy: {
      title: 'The Bank & Economy',
      subtitle: 'Coin Purse, Bank Account, 50-Item Transaction Ledger & Essences',
      view: 'player',
      subtab: 'economy'
    },
    dungeons: {
      title: 'Catacombs & Slayer Mastery',
      subtitle: 'Floors F1-F7, Master Mode M1-M7 & 6 Slayer Bosses',
      view: 'player',
      subtab: 'dungeons'
    },
    mining: {
      title: 'Deep Caverns & Heart of the Mountain',
      subtitle: 'HotM Tree Perks, Mithril/Gemstone/Glacite Powders & Crystals',
      view: 'player',
      subtab: 'mining'
    },
    garden: {
      title: 'The Farming Garden',
      subtitle: 'Garden Level 1-15, Unlocked Plots, Visitors & Composter',
      view: 'player',
      subtab: 'garden'
    },
    election: {
      title: 'Community Center & Mayoral Election',
      subtitle: 'Active Mayor & Minister Perks, Live Candidate Polls',
      view: 'election'
    },
    firesales: {
      title: 'Fire Sales',
      subtitle: 'Active & Scheduled Limited Cosmetic Sales',
      view: 'firesales'
    },
    bingo: {
      title: 'Bingo Hub',
      subtitle: 'Active 5x5 Bingo Board, Goals & Progress',
      view: 'bingo'
    },
    news: {
      title: 'Update Board & Patch Notes',
      subtitle: 'Official Hypixel SkyBlock Update Threads',
      view: 'news'
    },
    museum: {
      title: 'The Royal Museum',
      subtitle: 'Donated Weapons, Armor Sets, Rarities, Valuations & Special Artifacts',
      view: 'museum'
    }
  };

  const meta = destMeta[destination] || destMeta.player;
  if (titleEl) titleEl.textContent = meta.title;
  if (subtitleEl) subtitleEl.textContent = meta.subtitle;

  // Switch View
  switchMainTab(meta.view);
  if (meta.subtab) {
    switchPlayerSubTab(meta.subtab);
  }

  const windowEl = overlay.querySelector('.skyblock-window');
  if (destination === 'bazaar') {
    overlay.classList.add('bazaar-mode');
    windowEl?.classList.add('bazaar-mode');
  } else {
    overlay.classList.remove('bazaar-mode');
    windowEl?.classList.remove('bazaar-mode');
  }

  overlay.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeHubWindow() {
  const overlay = document.getElementById('hub-window-overlay');
  const windowEl = overlay?.querySelector('.skyblock-window');
  if (overlay) {
    overlay.classList.add('hidden');
    overlay.classList.remove('bazaar-mode');
  }
  if (windowEl) {
    windowEl.classList.remove('bazaar-mode');
  }
  document.querySelectorAll('.mc-hotbar-slot').forEach(s => s.classList.remove('active'));
}

function handleOverlayBackdropClick(e) {
  if (e.target.id === 'hub-window-overlay') {
    closeHubWindow();
  }
}

// Show prompt asking user for their username
function showPromptCard() {
  const modal = document.getElementById('hub-username-modal');
  if (modal) modal.classList.remove('hidden');
  const input = document.getElementById('initial-username-input');
  if (input) {
    setTimeout(() => input.focus(), 100);
  }
  if (window.lucide) lucide.createIcons();
}

function closePromptCard() {
  const modal = document.getElementById('hub-username-modal');
  if (modal) modal.classList.add('hidden');
}

// Handle submission of initial username prompt
function handleInitialUserSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('initial-username-input');
  const rememberCheck = document.getElementById('remember-username-check');
  if (!input || !input.value.trim()) return;

  const username = input.value.trim();
  if (rememberCheck && rememberCheck.checked) {
    localStorage.setItem('skyblock_saved_username', username);
  } else {
    localStorage.removeItem('skyblock_saved_username');
  }

  closePromptCard();
  lookupPlayer(username);
}

// Fetch Server Status
async function fetchStatus() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();
    if (data.rateLimit) {
      const pill = document.getElementById('rate-limit-pill');
      if (pill) {
        pill.textContent = `${data.rateLimit.remaining}/${data.rateLimit.limit} req/min`;
      }
    }
  } catch (err) {
    console.error('Failed to fetch status:', err);
  }
}

// Fetch Mayor for the Hub Pin Badge
async function fetchMayorPinBadge() {
  try {
    const res = await fetch('/api/election');
    const data = await res.json();
    if (data.mayor?.name) {
      const pinMayor = document.getElementById('pin-stat-mayor');
      if (pinMayor) pinMayor.textContent = `Mayor: ${data.mayor.name}`;
    }
  } catch {}
}

// Global Loader helper
function showLoader(text = 'Loading data from Hypixel API...') {
  const loader = document.getElementById('global-loader');
  const txt = document.getElementById('loader-text');
  if (txt) txt.textContent = text;
  if (loader) loader.classList.remove('hidden');
}

function hideLoader() {
  const loader = document.getElementById('global-loader');
  if (loader) loader.classList.add('hidden');
}

// Main View Switcher
function switchMainTab(tabName) {
  document.querySelectorAll('.tab-view').forEach(v => v.classList.add('hidden'));
  const activeView = document.getElementById(`view-${tabName}`);
  if (activeView) activeView.classList.remove('hidden');

  // Trigger lazy loading
  if (tabName === 'bazaar') {
    if (currentBazaarProducts.length === 0) loadBazaar();
    else { renderBazaarChestGUI(); renderBazaarInventoryGUI(); }
  }
  if (tabName === 'auctions') loadAuctions(0);
  if (tabName === 'ended_auctions') loadEndedAuctions();
  if (tabName === 'election') loadElection();
  if (tabName === 'firesales') loadFiresales();
  if (tabName === 'bingo') loadBingo();
  if (tabName === 'news') loadNews();
  if (tabName === 'museum') loadMuseum();

  if (window.lucide) lucide.createIcons();
}

// Player Sub Tabs
function switchPlayerSubTab(subTabName) {
  document.querySelectorAll('.subtab-btn').forEach(b => {
    b.classList.remove('active', 'bg-amber-500/20', 'text-amber-300', 'border', 'border-amber-500/30');
    b.classList.add('text-gray-400', 'hover:text-white');
  });

  const activeBtn = document.getElementById(`subtab-btn-${subTabName}`);
  if (activeBtn) {
    activeBtn.classList.add('active', 'bg-amber-500/20', 'text-amber-300', 'border', 'border-amber-500/30');
    activeBtn.classList.remove('text-gray-400');
  }

  document.querySelectorAll('.player-subtab-pane').forEach(p => p.classList.add('hidden'));
  const activePane = document.getElementById(`player-subtab-${subTabName}`);
  if (activePane) activePane.classList.remove('hidden');

  if (window.lucide) lucide.createIcons();
}

// Player Search Form Handler
function handlePlayerSearch(e) {
  e.preventDefault();
  const input = document.getElementById('player-search-input');
  if (input && input.value.trim()) {
    lookupPlayer(input.value.trim());
  }
}

// Fetch and Render Player Data
async function lookupPlayer(query, profileId = null) {
  showLoader(`Fetching Hypixel profile for '${query}'...`);
  try {
    let url = `/api/player/${encodeURIComponent(query)}`;
    if (profileId) url += `?profile=${encodeURIComponent(profileId)}`;

    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    currentPlayerData = data;

    // Close username prompt modal if open
    closePromptCard();

    // Sync search input
    const searchInput = document.getElementById('player-search-input');
    if (searchInput) searchInput.value = data.player.username;

    // Update Hypixel Scoreboard & Hub Pins
    updateScoreboard(data);

    // Populate all components
    renderPlayerHeader(data);
    renderPrivacyBanner(data.privacy);
    renderInventories(data.inventories);
    renderSkills(data.skills);
    renderSlayers(data.slayers);
    renderDungeons(data.dungeons);
    renderMining(data.mining);
    renderPets(data.pets);
    renderRift(data.rift);
    renderGarden(data.garden);
    renderEconomy(data.economy);
    renderMisc(data.misc);

    // Refresh bazaar inventory
    renderBazaarInventoryGUI();

    // Refresh museum data if open or clear cache
    currentMuseumData = null;
    const museumView = document.getElementById('view-museum');
    if (museumView && !museumView.classList.contains('hidden')) {
      loadMuseum(true);
    }

    fetchStatus();
  } catch (err) {
    alert(`Could not load player: ${err.message}`);
  } finally {
    hideLoader();
    if (window.lucide) lucide.createIcons();
  }
}

// Update Authentic Hypixel Scoreboard & Hub Map Pins
function updateScoreboard(data) {
  if (!data) return;
  const { player, selectedProfile, misc, economy } = data;

  const sbPlayer = document.getElementById('sb-player');
  if (sbPlayer) sbPlayer.textContent = player.username;

  const sbProfile = document.getElementById('sb-profile');
  if (sbProfile) sbProfile.textContent = selectedProfile.cuteName;

  const sbPurse = document.getElementById('sb-purse');
  if (sbPurse) sbPurse.textContent = economy.formattedPurse;

  const sbBank = document.getElementById('sb-bank');
  if (sbBank) sbBank.textContent = economy.formattedBank;

  const sbLevel = document.getElementById('sb-level');
  if (sbLevel) sbLevel.textContent = misc.skyblockLevel;

  // Pin badges on map
  const pinIgn = document.getElementById('pin-stat-ign');
  if (pinIgn) pinIgn.textContent = `${player.username}'s Spawn`;

  const pinBank = document.getElementById('pin-stat-bank');
  if (pinBank) pinBank.textContent = `Bank: ${economy.formattedBank}`;
}

// Render Player Header & Profile Selector
function renderPlayerHeader(data) {
  const { player, selectedProfile, profiles, misc, skills, dungeons, economy } = data;

  const avatar = document.getElementById('player-avatar');
  if (avatar) avatar.src = player.avatarUrl;

  const ign = document.getElementById('player-ign');
  if (ign) ign.textContent = player.username;

  const rankBadge = document.getElementById('player-rank-badge');
  if (rankBadge) {
    rankBadge.textContent = `[${player.rank}]`;
    rankBadge.style.color = player.rankColor;
    rankBadge.style.borderColor = player.rankColor + '40';
  }

  const modeBadge = document.getElementById('player-mode-badge');
  if (modeBadge) {
    modeBadge.textContent = (selectedProfile.gameMode || 'standard').toUpperCase();
  }

  const uuidLabel = document.getElementById('player-uuid');
  if (uuidLabel) uuidLabel.textContent = `UUID: ${player.uuid}`;

  // Summary stats
  const sbLvl = document.getElementById('player-sb-level');
  if (sbLvl) sbLvl.textContent = misc.skyblockLevel;

  const saLvl = document.getElementById('player-sa');
  if (saLvl) saLvl.textContent = skills.skillAverage;

  const cataLvl = document.getElementById('player-cata-level');
  if (cataLvl) cataLvl.textContent = dungeons.catacombs?.level || 0;

  const purseHeader = document.getElementById('player-purse-header');
  if (purseHeader) purseHeader.textContent = economy.formattedPurse;

  const bankHeader = document.getElementById('player-bank-header');
  if (bankHeader) bankHeader.textContent = economy.formattedBank;

  // Profile Selector Buttons
  const selectorContainer = document.getElementById('profile-selector-container');
  if (selectorContainer) {
    selectorContainer.innerHTML = profiles.map(p => {
      const isSelected = p.profileId === selectedProfile.profileId;
      return `
        <button onclick="lookupPlayer('${player.uuid}', '${p.profileId}')"
          class="px-2.5 py-1 rounded text-xs font-semibold transition ${
            isSelected
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'bg-[#161b22] text-gray-400 hover:text-white hover:bg-[#21262d] border border-[#30363d]'
          }">
          ${p.cuteName}
          ${p.gameMode !== 'standard' ? `<span class="opacity-75 text-[10px]">(${p.gameMode})</span>` : ''}
        </button>
      `;
    }).join('');
  }
}

// Render Privacy Banner
function renderPrivacyBanner(privacy) {
  const banner = document.getElementById('privacy-alert-banner');
  const text = document.getElementById('privacy-alert-text');
  if (!banner || !text) return;

  const restricted = [];
  if (privacy.inventoryRestricted) restricted.push('Inventories & Gear');
  if (privacy.skillsRestricted) restricted.push('Skills');
  if (privacy.bankingRestricted) restricted.push('Co-op Banking');
  if (privacy.collectionsRestricted) restricted.push('Collections');

  if (restricted.length > 0) {
    banner.classList.remove('hidden');
    text.textContent = `This player has restricted their public API settings for: [${restricted.join(', ')}]. To view all stats, enable them in SkyBlock via /settings -> API Settings.`;
  } else {
    banner.classList.add('hidden');
  }
}

// Render Inventory Slots
function renderSlot(item, customClass = '') {
  if (!item || item.empty) {
    return `<div class="mc-slot empty ${customClass}"></div>`;
  }

  const encodedData = encodeURIComponent(JSON.stringify(item));
  const countDisplay = item.count > 1 ? `<span class="mc-slot-count">${item.count}</span>` : '';
  
  // Custom border/glow for rarity
  const rarityBorder = `border-color: ${item.rarityColor || '#ffffff'};`;

  return `
    <div class="mc-slot ${customClass}" data-item="${encodedData}" style="${rarityBorder}">
      <div class="text-xs font-bold text-center px-1 truncate pointer-events-none select-none" style="color: ${item.rarityColor || '#fff'}">
        ${item.cleanName ? item.cleanName.slice(0, 5) : 'item'}
      </div>
      ${countDisplay}
    </div>
  `;
}

function renderInventories(inventories) {
  // Armor
  const armorGrid = document.getElementById('grid-armor');
  if (armorGrid) {
    armorGrid.innerHTML = (inventories.armor || []).map(i => renderSlot(i, 'w-12 h-12')).join('') || '<span class="text-xs text-gray-500">No armor equipped</span>';
  }

  // Equipment
  const equipGrid = document.getElementById('grid-equipment');
  if (equipGrid) {
    equipGrid.innerHTML = (inventories.equipment || []).map(i => renderSlot(i, 'w-12 h-12')).join('') || '<span class="text-xs text-gray-500">No equipment equipped</span>';
  }

  // Main Inventory (rows 1-3)
  const mainInvGrid = document.getElementById('grid-inventory-main');
  const hotbarGrid = document.getElementById('grid-inventory-hotbar');
  const items = inventories.inventory || [];

  if (mainInvGrid && hotbarGrid) {
    const mainItems = items.slice(9, 36);
    const hotbarItems = items.slice(0, 9);

    mainInvGrid.innerHTML = mainItems.map(i => renderSlot(i)).join('');
    hotbarGrid.innerHTML = hotbarItems.map(i => renderSlot(i)).join('');
  }

  // Default Extended Storage Tab
  switchStorageGrid('enderChest');
}

// Switch Extended Storage Tabs
function switchStorageGrid(key) {
  document.querySelectorAll('.storage-tab-btn').forEach(b => {
    b.classList.remove('active', 'bg-[#21262d]', 'text-white');
    b.classList.add('bg-[#161b22]', 'text-gray-400');
  });

  const activeBtn = document.getElementById(`st-btn-${key}`);
  if (activeBtn) {
    activeBtn.classList.add('active', 'bg-[#21262d]', 'text-white');
    activeBtn.classList.remove('bg-[#161b22]', 'text-gray-400');
  }

  const container = document.getElementById('storage-grid-container');
  if (!container || !currentPlayerData?.inventories) return;

  const invs = currentPlayerData.inventories;
  let itemsToRender = [];

  if (key === 'enderChest') itemsToRender = invs.enderChest || [];
  else if (key === 'talismanBag') itemsToRender = invs.talismanBag || [];
  else if (key === 'potionBag') itemsToRender = invs.potionBag || [];
  else if (key === 'fishingBag') itemsToRender = invs.fishingBag || [];
  else if (key === 'personalVault') itemsToRender = invs.personalVault || [];
  else if (key === 'backpacks') {
    if (!invs.backpacks || invs.backpacks.length === 0) {
      container.innerHTML = '<span class="text-xs text-gray-400 p-4">No backpacks found in inventory storage.</span>';
      return;
    }
    // Render backpacks with headers
    container.innerHTML = `
      <div class="space-y-4 w-full">
        ${invs.backpacks.map(bp => `
          <div>
            <span class="text-xs font-bold text-amber-400 block mb-1.5">${bp.name}</span>
            <div class="grid grid-cols-9 gap-1">
              ${(bp.items || []).map(i => renderSlot(i)).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
    return;
  }

  if (itemsToRender.length === 0) {
    container.innerHTML = '<span class="text-xs text-gray-400 p-4">Storage is empty or API is disabled.</span>';
    return;
  }

  container.innerHTML = `
    <div class="grid grid-cols-9 gap-1">
      ${itemsToRender.map(i => renderSlot(i)).join('')}
    </div>
  `;
}

// Render Skills (1 - 60)
function renderSkills(skillsData) {
  const grid = document.getElementById('skills-grid');
  const saLabel = document.getElementById('sa-full');
  if (saLabel) saLabel.textContent = skillsData.skillAverage;
  if (!grid) return;

  grid.innerHTML = (skillsData.skills || []).map(skill => {
    const isMax = skill.level >= skill.maxLevel;
    return `
      <div class="glass-panel rounded-xl p-4 border border-[#30363d] space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="text-2xl">${skill.icon}</span>
            <div>
              <h4 class="font-bold text-sm text-white">${skill.name}</h4>
              <span class="text-[11px] text-gray-400 font-mono">${skill.xp.toLocaleString()} Total XP</span>
            </div>
          </div>
          <span class="px-2.5 py-1 rounded text-xs font-black font-mono ${
            isMax ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-gray-800 text-gray-200'
          }">
            ${isMax ? 'MAX ' : 'LVL '}${skill.level}
          </span>
        </div>

        <!-- Progress Bar -->
        <div class="space-y-1">
          <div class="w-full bg-[#090c10] h-2 rounded-full overflow-hidden border border-[#21262d]">
            <div class="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-300" style="width: ${skill.progressPercent}%"></div>
          </div>
          <div class="flex justify-between text-[11px] text-gray-400 font-mono">
            <span>${isMax ? 'Completed' : `${skill.currentXp.toLocaleString()} / ${skill.nextLevelXp.toLocaleString()}`}</span>
            <span>${skill.progressPercent}%</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Render Slayers
function renderSlayers(slayersData) {
  const grid = document.getElementById('slayers-grid');
  const totalLabel = document.getElementById('total-slayer-xp');
  if (totalLabel) totalLabel.textContent = (slayersData.totalXp || 0).toLocaleString();
  if (!grid) return;

  grid.innerHTML = (slayersData.slayers || []).map(boss => {
    const isMax = boss.level >= boss.maxLevel;
    return `
      <div class="glass-panel rounded-xl p-4 border border-[#30363d] space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="text-2xl">${boss.icon}</span>
            <div>
              <h4 class="font-bold text-sm text-white">${boss.name}</h4>
              <span class="text-[11px] text-gray-400 font-mono">${boss.xp.toLocaleString()} XP</span>
            </div>
          </div>
          <span class="px-2.5 py-1 rounded text-xs font-black font-mono ${
            isMax ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-gray-800 text-gray-200'
          }">
            LVL ${boss.level}
          </span>
        </div>

        <!-- Progress -->
        <div class="space-y-1">
          <div class="w-full bg-[#090c10] h-2 rounded-full overflow-hidden border border-[#21262d]">
            <div class="bg-gradient-to-r from-amber-500 to-red-500 h-full" style="width: ${boss.progressPercent}%"></div>
          </div>
          <div class="flex justify-between text-[11px] text-gray-400 font-mono">
            <span>${isMax ? 'Maxed Level' : `${boss.currentXp.toLocaleString()} / ${boss.nextLevelXp.toLocaleString()}`}</span>
            <span>${boss.progressPercent}%</span>
          </div>
        </div>

        <!-- Boss Kills per Tier Matrix -->
        <div class="pt-2 border-t border-[#21262d] grid grid-cols-5 gap-1 text-center font-mono">
          <div class="p-1 rounded bg-[#090c10] border border-[#21262d]">
            <span class="text-[10px] text-gray-400 block">T1</span>
            <span class="text-xs font-bold text-gray-200">${boss.kills.t1}</span>
          </div>
          <div class="p-1 rounded bg-[#090c10] border border-[#21262d]">
            <span class="text-[10px] text-gray-400 block">T2</span>
            <span class="text-xs font-bold text-gray-200">${boss.kills.t2}</span>
          </div>
          <div class="p-1 rounded bg-[#090c10] border border-[#21262d]">
            <span class="text-[10px] text-gray-400 block">T3</span>
            <span class="text-xs font-bold text-gray-200">${boss.kills.t3}</span>
          </div>
          <div class="p-1 rounded bg-[#090c10] border border-[#21262d]">
            <span class="text-[10px] text-gray-400 block">T4</span>
            <span class="text-xs font-bold text-amber-400">${boss.kills.t4}</span>
          </div>
          <div class="p-1 rounded bg-[#090c10] border border-[#21262d]">
            <span class="text-[10px] text-gray-400 block">T5</span>
            <span class="text-xs font-bold text-red-400">${boss.kills.t5}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Render Dungeons
function renderDungeons(dungeonsData) {
  const container = document.getElementById('dungeons-container');
  if (!container) return;

  const cata = dungeonsData.catacombs || {};
  const isCataMax = cata.level >= 50;

  container.innerHTML = `
    <!-- Catacombs Overview Card -->
    <div class="glass-panel rounded-2xl p-6 border border-[#30363d] space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span class="text-xs uppercase font-bold text-gray-400 tracking-wider">The Catacombs</span>
          <div class="flex items-center gap-3 mt-1">
            <h3 class="text-2xl font-black text-white font-mono">Level ${cata.level}</h3>
            <span class="px-2.5 py-0.5 rounded text-xs font-bold ${
              isCataMax ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-purple-500/20 text-purple-300'
            }">
              ${isCataMax ? 'CATA 50 MAX' : `${cata.progressPercent}% to next`}
            </span>
          </div>
          <p class="text-xs text-gray-400 mt-1 font-mono">${cata.xp.toLocaleString()} Total Catacombs XP</p>
        </div>
        
        <div class="flex gap-4">
          <div class="px-4 py-2 rounded-xl bg-[#090c10] border border-[#21262d]">
            <span class="text-xs text-gray-400 block">Selected Class</span>
            <span class="text-sm font-bold text-cyan-400 uppercase font-mono">${dungeonsData.selectedClass}</span>
          </div>
          <div class="px-4 py-2 rounded-xl bg-[#090c10] border border-[#21262d]">
            <span class="text-xs text-gray-400 block">Secrets Discovered</span>
            <span class="text-sm font-bold text-amber-400 font-mono">${dungeonsData.secrets.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <!-- Cata XP Bar -->
      <div class="w-full bg-[#090c10] h-2.5 rounded-full overflow-hidden border border-[#21262d]">
        <div class="bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 h-full" style="width: ${cata.progressPercent}%"></div>
      </div>
    </div>

    <!-- Class Levels Breakdown -->
    <div class="glass-panel rounded-2xl p-6 border border-[#30363d] space-y-4">
      <h4 class="text-sm font-bold text-gray-200 uppercase tracking-wider">Dungeon Classes (Healer, Mage, Berserk, Archer, Tank)</h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        ${(dungeonsData.classes || []).map(cls => `
          <div class="p-4 rounded-xl bg-[#090c10] border ${cls.selected ? 'border-amber-400/50 shadow-md shadow-amber-400/10' : 'border-[#21262d]'} space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-sm ${cls.selected ? 'text-amber-400' : 'text-gray-200'}">${cls.name}</span>
              <span class="font-mono text-xs font-black ${cls.level >= 50 ? 'text-amber-400' : 'text-gray-300'}">Lvl ${cls.level}</span>
            </div>
            <div class="w-full bg-[#161b22] h-1.5 rounded-full overflow-hidden">
              <div class="bg-purple-500 h-full" style="width: ${cls.progressPercent}%"></div>
            </div>
            <span class="text-[10px] text-gray-500 block font-mono">${cls.xp.toLocaleString()} XP</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Floor Completions (Normal & Master Mode) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <!-- Normal Floors -->
      <div class="glass-panel rounded-xl p-5 border border-[#30363d] space-y-3">
        <h4 class="text-sm font-bold text-gray-200 uppercase tracking-wider">The Catacombs Floors (F1 - F7)</h4>
        <div class="grid grid-cols-4 gap-2 text-center font-mono">
          ${Object.entries(dungeonsData.floorCompletions || {}).map(([floor, count]) => `
            <div class="p-2 rounded-lg bg-[#090c10] border border-[#21262d]">
              <span class="text-xs text-purple-400 font-bold block">${floor}</span>
              <span class="text-xs text-gray-200 font-semibold">${count.toLocaleString()}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Master Mode Floors -->
      <div class="glass-panel rounded-xl p-5 border border-[#30363d] space-y-3">
        <h4 class="text-sm font-bold text-amber-400 uppercase tracking-wider">Master Mode Catacombs (M1 - M7)</h4>
        <div class="grid grid-cols-4 gap-2 text-center font-mono">
          ${Object.entries(dungeonsData.masterCompletions || {}).map(([floor, count]) => `
            <div class="p-2 rounded-lg bg-[#090c10] border border-[#21262d]">
              <span class="text-xs text-red-400 font-bold block">${floor}</span>
              <span class="text-xs text-gray-200 font-semibold">${count.toLocaleString()}</span>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;
}

// Render Mining & HotM
function renderMining(miningData) {
  const container = document.getElementById('mining-container');
  if (!container) return;

  if (!miningData) {
    container.innerHTML = '<div class="glass-panel p-6 rounded-2xl text-xs text-gray-400">No Mining or Heart of the Mountain data found.</div>';
    return;
  }

  const p = miningData.powders || {};

  container.innerHTML = `
    <!-- HotM Level Overview -->
    <div class="glass-panel rounded-2xl p-6 border border-[#30363d] space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-xs uppercase font-bold text-gray-400 tracking-wider">Heart of the Mountain</span>
          <h3 class="text-2xl font-black text-amber-400 font-mono mt-1">Tier ${miningData.level} / ${miningData.maxLevel}</h3>
        </div>
        <span class="px-3 py-1 rounded bg-amber-500/20 text-amber-300 font-bold font-mono text-xs border border-amber-500/30">
          ${miningData.progressPercent}% Progress
        </span>
      </div>
      <div class="w-full bg-[#090c10] h-2.5 rounded-full overflow-hidden border border-[#21262d]">
        <div class="bg-gradient-to-r from-amber-500 to-emerald-400 h-full" style="width: ${miningData.progressPercent}%"></div>
      </div>
    </div>

    <!-- Powders (Mithril, Gemstone, Glacite) -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="glass-panel rounded-xl p-5 border border-[#30363d] space-y-2">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-emerald-400"></span>
          <h4 class="text-sm font-bold text-white">Mithril Powder</h4>
        </div>
        <p class="text-xl font-bold font-mono text-emerald-400">${(p.mithril?.current || 0).toLocaleString()}</p>
        <span class="text-[11px] text-gray-400 font-mono block">Total Spent: ${(p.mithril?.spent || 0).toLocaleString()}</span>
      </div>

      <div class="glass-panel rounded-xl p-5 border border-[#30363d] space-y-2">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-pink-400"></span>
          <h4 class="text-sm font-bold text-white">Gemstone Powder</h4>
        </div>
        <p class="text-xl font-bold font-mono text-pink-400">${(p.gemstone?.current || 0).toLocaleString()}</p>
        <span class="text-[11px] text-gray-400 font-mono block">Total Spent: ${(p.gemstone?.spent || 0).toLocaleString()}</span>
      </div>

      <div class="glass-panel rounded-xl p-5 border border-[#30363d] space-y-2">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-cyan-400"></span>
          <h4 class="text-sm font-bold text-white">Glacite Powder</h4>
        </div>
        <p class="text-xl font-bold font-mono text-cyan-400">${(p.glacite?.current || 0).toLocaleString()}</p>
        <span class="text-[11px] text-gray-400 font-mono block">Total Spent: ${(p.glacite?.spent || 0).toLocaleString()}</span>
      </div>
    </div>

    <!-- Gemstone Crystals Status -->
    <div class="glass-panel rounded-2xl p-6 border border-[#30363d] space-y-3">
      <h4 class="text-sm font-bold text-gray-200 uppercase tracking-wider">Crystal Hollows Crystals Status</h4>
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center font-mono">
        ${Object.entries(miningData.crystals || {}).map(([crystal, stateObj]) => `
          <div class="p-3 rounded-xl bg-[#090c10] border border-[#21262d]">
            <span class="text-xs font-bold text-amber-300 block capitalize">${crystal.replace('_crystal', '')}</span>
            <span class="text-[11px] font-semibold ${stateObj.state === 'PLACED' ? 'text-emerald-400' : 'text-gray-400'}">
              ${stateObj.state || 'LOCKED'}
            </span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// Render Pets
function renderPets(petsList) {
  const grid = document.getElementById('pets-grid');
  const countLabel = document.getElementById('pets-count');
  if (countLabel) countLabel.textContent = petsList.length;
  if (!grid) return;

  if (petsList.length === 0) {
    grid.innerHTML = '<div class="col-span-full text-xs text-gray-400 p-4">No pets found in profile.</div>';
    return;
  }

  grid.innerHTML = petsList.map(pet => `
    <div class="glass-panel rounded-xl p-4 border border-[#30363d] space-y-3 relative overflow-hidden" style="border-color: ${getRarityColor(pet.tier)}30">
      ${pet.active ? '<span class="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-black">ACTIVE</span>' : ''}
      
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-[#090c10] border flex items-center justify-center font-bold text-xs" style="border-color: ${getRarityColor(pet.tier)}">
          <span class="text-[11px] font-mono font-bold text-gray-400">PET</span>
        </div>
        <div>
          <h4 class="text-sm font-bold text-white capitalize">${pet.cleanName.toLowerCase()}</h4>
          <span class="text-[10px] uppercase font-bold tracking-wider" style="color: ${getRarityColor(pet.tier)}">${pet.tier}</span>
        </div>
      </div>

      <div class="flex items-center justify-between text-xs font-mono pt-2 border-t border-[#21262d]">
        <span class="font-bold text-amber-400">Level ${pet.level} / ${pet.maxLevel}</span>
        <span class="text-gray-400 text-[11px]">${pet.exp.toLocaleString()} XP</span>
      </div>

      ${pet.heldItem ? `
        <div class="p-1.5 rounded bg-[#090c10] text-[11px] text-gray-300 font-mono truncate">
          Held: <span class="text-cyan-400 font-semibold">${pet.heldItem}</span>
        </div>
      ` : ''}

      <div class="text-[10px] text-gray-500 flex justify-between font-mono">
        <span>Candy: ${pet.candyUsed}/10</span>
        ${pet.skin ? `<span class="text-purple-400">Skin: ${pet.skin}</span>` : ''}
      </div>
    </div>
  `).join('');
}

// Render The Rift
function renderRift(riftData) {
  const container = document.getElementById('rift-container');
  if (!container) return;

  container.innerHTML = `
    <div class="glass-panel rounded-2xl p-6 border border-[#30363d] space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-xs uppercase font-bold text-purple-400 tracking-wider">The Rift Dimension</span>
          <h3 class="text-xl font-black text-white mt-1">Rift Progression & Discoveries</h3>
        </div>
      </div>

      <!-- Enigma Souls -->
      <div class="p-4 rounded-xl bg-[#090c10] border border-[#21262d] space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-sm font-bold text-white flex items-center gap-2">
            Enigma Souls Collected: <strong class="text-purple-400 font-mono">${riftData.enigmaSouls} / ${riftData.totalEnigmaSouls}</strong>
          </span>
          <span class="text-xs font-mono text-gray-400">${Math.round((riftData.enigmaSouls / riftData.totalEnigmaSouls) * 100)}%</span>
        </div>
        <div class="w-full bg-[#161b22] h-2 rounded-full overflow-hidden">
          <div class="bg-purple-500 h-full" style="width: ${(riftData.enigmaSouls / riftData.totalEnigmaSouls) * 100}%"></div>
        </div>
      </div>

      <!-- Timecharms & Gallery Trophies -->
      <div class="space-y-3">
        <h4 class="text-xs font-bold text-gray-300 uppercase tracking-wider">Secured Timecharms (Elise Gallery)</h4>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          ${(riftData.timecharms || []).map(charm => `
            <div class="p-3 rounded-xl bg-[#090c10] border border-purple-500/30 text-center space-y-1">
              <span class="text-xs font-bold text-amber-400 block capitalize">${charm.type.replace(/_/g, ' ')}</span>
              <span class="text-[10px] text-gray-400 block">Visits: ${charm.visits}</span>
            </div>
          `).join('') || '<span class="text-xs text-gray-500">No timecharms secured yet.</span>'}
        </div>
      </div>
    </div>
  `;
}

// Render The Garden
function renderGarden(gardenData) {
  const container = document.getElementById('garden-container');
  if (!container) return;

  if (!gardenData) {
    container.innerHTML = '<div class="glass-panel p-6 rounded-2xl text-xs text-gray-400">Garden data is not available or locked.</div>';
    return;
  }

  const { level, unlockedPlotsCount, visitors, composter, copper, barnSkin } = gardenData;

  container.innerHTML = `
    <!-- Overview -->
    <div class="glass-panel rounded-2xl p-6 border border-[#30363d] space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-xs uppercase font-bold text-emerald-400 tracking-wider">The Farming Garden</span>
          <h3 class="text-2xl font-black text-white font-mono mt-1">Garden Level ${level.level}</h3>
        </div>
        <div class="flex gap-3 font-mono text-xs">
          <div class="px-3 py-1.5 rounded-lg bg-[#090c10] border border-[#21262d]">
            <span class="text-gray-400 block">Copper:</span>
            <span class="text-amber-400 font-bold">${copper.toLocaleString()}</span>
          </div>
          <div class="px-3 py-1.5 rounded-lg bg-[#090c10] border border-[#21262d]">
            <span class="text-gray-400 block">Plots Unlocked:</span>
            <span class="text-emerald-400 font-bold">${unlockedPlotsCount} / 24</span>
          </div>
          <div class="px-3 py-1.5 rounded-lg bg-[#090c10] border border-[#21262d]">
            <span class="text-gray-400 block">Barn Skin:</span>
            <span class="text-cyan-400 font-bold capitalize">${barnSkin.toLowerCase()}</span>
          </div>
        </div>
      </div>

      <!-- XP Bar -->
      <div class="w-full bg-[#090c10] h-2.5 rounded-full overflow-hidden border border-[#21262d]">
        <div class="bg-gradient-to-r from-emerald-500 to-lime-400 h-full" style="width: ${level.progressPercent}%"></div>
      </div>
    </div>

    <!-- Composter & Visitors Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <!-- Composter -->
      <div class="glass-panel rounded-xl p-5 border border-[#30363d] space-y-3 font-mono">
        <h4 class="text-sm font-bold text-white uppercase tracking-wider">Composter Station</h4>
        <div class="space-y-2 text-xs">
          <div class="flex justify-between p-2 rounded bg-[#090c10]">
            <span class="text-gray-400">Organic Matter:</span>
            <span class="text-emerald-400 font-bold">${composter.organicMatter.toLocaleString()}</span>
          </div>
          <div class="flex justify-between p-2 rounded bg-[#090c10]">
            <span class="text-gray-400">Fuel Units:</span>
            <span class="text-amber-400 font-bold">${composter.fuelUnits.toLocaleString()}</span>
          </div>
          <div class="flex justify-between p-2 rounded bg-[#090c10]">
            <span class="text-gray-400">Compost Produced:</span>
            <span class="text-lime-400 font-bold">${composter.compostItems.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <!-- Visitors -->
      <div class="glass-panel rounded-xl p-5 border border-[#30363d] space-y-3 font-mono">
        <h4 class="text-sm font-bold text-white uppercase tracking-wider">Garden Visitors</h4>
        <div class="space-y-2 text-xs">
          <div class="flex justify-between p-2 rounded bg-[#090c10]">
            <span class="text-gray-400">Unique Visitors Served:</span>
            <span class="text-cyan-400 font-bold">${visitors.unique} Unique NPCs</span>
          </div>
          <div class="flex justify-between p-2 rounded bg-[#090c10]">
            <span class="text-gray-400">Total Visits Accepted:</span>
            <span class="text-purple-400 font-bold">${visitors.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

    </div>
  `;
}

// Render Economy & Bank
function renderEconomy(economyData) {
  const container = document.getElementById('economy-container');
  if (!container) return;

  container.innerHTML = `
    <!-- Top Balances -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="glass-panel rounded-xl p-5 border border-[#30363d] space-y-1">
        <span class="text-xs uppercase font-bold text-gray-400">Profile Bank Account</span>
        <h3 class="text-2xl font-black text-blue-400 font-mono">${economyData.formattedBank} Coins</h3>
        <p class="text-[11px] text-gray-500 font-mono">${Math.floor(economyData.bankBalance).toLocaleString()} Exact</p>
      </div>

      <div class="glass-panel rounded-xl p-5 border border-[#30363d] space-y-1">
        <span class="text-xs uppercase font-bold text-gray-400">Player Coin Purse</span>
        <h3 class="text-2xl font-black text-amber-400 font-mono">${economyData.formattedPurse} Coins</h3>
        <p class="text-[11px] text-gray-500 font-mono">${Math.floor(economyData.coinPurse).toLocaleString()} Exact</p>
      </div>

      <div class="glass-panel rounded-xl p-5 border border-[#30363d] space-y-1">
        <span class="text-xs uppercase font-bold text-gray-400">The Rift Motes</span>
        <h3 class="text-2xl font-black text-purple-400 font-mono">${(economyData.motesPurse || 0).toLocaleString()} Motes</h3>
        <p class="text-[11px] text-gray-500">Rift Dimension Currency</p>
      </div>
    </div>

    <!-- Essences Breakdown -->
    <div class="glass-panel rounded-2xl p-6 border border-[#30363d] space-y-4">
      <h4 class="text-sm font-bold text-gray-200 uppercase tracking-wider">Essence Storage</h4>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono text-center">
        ${Object.entries(economyData.essences || {}).map(([type, obj]) => `
          <div class="p-3 rounded-xl bg-[#090c10] border border-[#21262d]">
            <span class="text-xs text-gray-400 block">${type}</span>
            <span class="text-sm font-bold text-amber-400">${(obj.current || 0).toLocaleString()}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Banking Transactions Ledger -->
    <div class="glass-panel rounded-2xl border border-[#30363d] overflow-hidden space-y-3 p-5">
      <h4 class="text-sm font-bold text-gray-200 uppercase tracking-wider">Recent Co-op Bank Transactions (50 Max)</h4>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs font-mono">
          <thead class="bg-[#090c10] text-gray-400 border-b border-[#21262d]">
            <tr>
              <th class="p-2.5">Action</th>
              <th class="p-2.5">Amount</th>
              <th class="p-2.5">Initiator</th>
              <th class="p-2.5">Date</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#21262d]">
            ${(economyData.transactions || []).map(tx => `
              <tr class="hover:bg-[#161b22]">
                <td class="p-2.5 font-bold ${tx.action === 'DEPOSIT' ? 'text-emerald-400' : 'text-red-400'}">${tx.action}</td>
                <td class="p-2.5 text-white font-bold">${tx.formattedAmount} (${Math.floor(tx.amount).toLocaleString()})</td>
                <td class="p-2.5 text-gray-300">${tx.initiator}</td>
                <td class="p-2.5 text-gray-500">${new Date(tx.timestamp).toLocaleString()}</td>
              </tr>
            `).join('') || '<tr><td colspan="4" class="p-4 text-center text-gray-500">No transactions recorded</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// Render Misc Stats
function renderMisc(miscData) {
  const container = document.getElementById('misc-container');
  if (!container) return;

  container.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="glass-panel rounded-xl p-5 border border-[#30363d] space-y-1">
        <span class="text-xs uppercase font-bold text-gray-400">Total Deaths</span>
        <h3 class="text-2xl font-black text-red-400 font-mono">${(miscData.deaths || 0).toLocaleString()}</h3>
      </div>
      <div class="glass-panel rounded-xl p-5 border border-[#30363d] space-y-1">
        <span class="text-xs uppercase font-bold text-gray-400">Total Mob Kills</span>
        <h3 class="text-2xl font-black text-emerald-400 font-mono">${(miscData.kills || 0).toLocaleString()}</h3>
      </div>
      <div class="glass-panel rounded-xl p-5 border border-[#30363d] space-y-1">
        <span class="text-xs uppercase font-bold text-gray-400">Fairy Souls Collected</span>
        <h3 class="text-2xl font-black text-pink-400 font-mono">${(miscData.fairySouls || 0).toLocaleString()}</h3>
      </div>
    </div>
  `;
}

// BAZAAR MARKET MODULE (AUTHENTIC MINECRAFT CHEST GUI)
let bazaarCategory = 'farming'; // Default to Farming as requested by user
let bazaarSubGroup = null; // null = category parent view, string = drilled-down sub group
let bazaarCategoryPage = 0;
let bazaarSearchQuery = '';
let bazaarSortMode = 'volume'; // 'volume' | 'spread'

const BAZAAR_CATEGORIES = {
  farming: {
    name: 'Farming',
    title: 'Bazaar ➜ Farming',
    icon: '/textures/minecraft/golden_hoe.png',
    glass: '/textures/minecraft/yellow_stained_glass_pane.png',
    slotIndex: 0,
    lore: ['View agricultural crops, food, and livestock products.', '', 'Click to switch category!']
  },
  mining: {
    name: 'Mining',
    title: 'Bazaar ➜ Mining',
    icon: '/textures/minecraft/diamond_pickaxe.png',
    glass: '/textures/minecraft/light_blue_stained_glass_pane.png',
    slotIndex: 9,
    lore: ['View ores, metals, minerals, and refined gemstones.', '', 'Click to switch category!']
  },
  combat: {
    name: 'Combat',
    title: 'Bazaar ➜ Combat',
    icon: '/textures/minecraft/iron_sword.png',
    glass: '/textures/minecraft/red_stained_glass_pane.png',
    slotIndex: 18,
    lore: ['View mob drops, slayer materials, and combat trophies.', '', 'Click to switch category!']
  },
  fishing: {
    name: 'Woods & Fishes',
    title: 'Bazaar ➜ Woods & Fishes',
    icon: '/textures/minecraft/fishing_rod.png',
    glass: '/textures/minecraft/brown_stained_glass_pane.png',
    slotIndex: 27,
    lore: ['View tree logs, wood types, fish, and ocean treasures.', '', 'Click to switch category!']
  },
  oddities: {
    name: 'Oddities',
    title: 'Bazaar ➜ Oddities',
    icon: '/textures/minecraft/enchanting_table.png',
    glass: '/textures/minecraft/magenta_stained_glass_pane.png',
    slotIndex: 36,
    lore: ['View enchanted books, booster cookies, essences, and consumables.', '', 'Click to switch category!']
  },
  search: {
    name: 'Search',
    title: 'Bazaar ➜ Search Results',
    icon: '/textures/minecraft/oak_sign.png',
    glass: '/textures/minecraft/gray_stained_glass_pane.png',
    slotIndex: 45,
    lore: ['Search through all 2,100+ Bazaar commodities.', '', 'Click to search!']
  }
};

const BAZAAR_PARENT_GROUPS = {
  farming: {
    wheat_seeds: {
      name: 'Wheat & Seeds',
      icon: '/textures/minecraft/wheat.png',
      slot: 11,
      productIds: ['WHEAT', 'ENCHANTED_BREAD', 'HAY_BLOCK', 'ENCHANTED_HAY_BLOCK', 'TIGHTLY_TIED_HAY_BALE', 'SEEDS', 'ENCHANTED_SEEDS', 'BOX_OF_SEEDS']
    },
    carrot: {
      name: 'Carrot',
      icon: '/textures/minecraft/carrot.png',
      slot: 12,
      productIds: ['CARROT_ITEM', 'ENCHANTED_CARROT', 'ENCHANTED_GOLDEN_CARROT']
    },
    potato: {
      name: 'Potato',
      icon: '/textures/minecraft/potato.png',
      slot: 13,
      productIds: ['POTATO_ITEM', 'ENCHANTED_POTATO', 'ENCHANTED_BAKED_POTATO']
    },
    pumpkin: {
      name: 'Pumpkin',
      icon: '/textures/minecraft/pumpkin.png',
      slot: 14,
      productIds: ['PUMPKIN', 'ENCHANTED_PUMPKIN', 'POLISHED_PUMPKIN']
    },
    melon: {
      name: 'Melon',
      icon: '/textures/minecraft/melon.png',
      slot: 15,
      productIds: ['MELON', 'ENCHANTED_MELON', 'ENCHANTED_GLISTERING_MELON', 'ENCHANTED_MELON_BLOCK']
    },
    mushrooms: {
      name: 'Mushrooms',
      icon: '/textures/minecraft/red_mushroom.png',
      slot: 16,
      productIds: ['RED_MUSHROOM', 'BROWN_MUSHROOM', 'ENCHANTED_RED_MUSHROOM', 'ENCHANTED_BROWN_MUSHROOM', 'ENCHANTED_HUGE_MUSHROOM_1', 'ENCHANTED_HUGE_MUSHROOM_2']
    },
    cocoa_beans: {
      name: 'Cocoa Beans',
      icon: '/textures/minecraft/cocoa_beans.png',
      slot: 20,
      productIds: ['INK_SACK:3', 'COCOA', 'ENCHANTED_COCOA']
    },
    cactus: {
      name: 'Cactus',
      icon: '/textures/minecraft/cactus.png',
      slot: 21,
      productIds: ['CACTUS', 'ENCHANTED_CACTUS_GREEN', 'ENCHANTED_CACTUS']
    },
    sugar_cane: {
      name: 'Sugar Cane',
      icon: '/textures/minecraft/sugar_cane.png',
      slot: 22,
      productIds: ['SUGAR_CANE', 'ENCHANTED_SUGAR', 'ENCHANTED_PAPER', 'ENCHANTED_SUGAR_CANE']
    },
    sunflower: {
      name: 'Sunflower',
      icon: '/textures/minecraft/sunflower.png',
      slot: 23,
      productIds: ['SUNFLOWER', 'ENCHANTED_SUNFLOWER']
    },
    moonflower: {
      name: 'Moonflower',
      icon: '/textures/minecraft/cornflower.png',
      slot: 24,
      productIds: ['MOONFLOWER', 'ENCHANTED_MOONFLOWER']
    },
    wild_rose: {
      name: 'Wild Rose',
      icon: '/textures/minecraft/poppy.png',
      slot: 25,
      productIds: ['WILD_ROSE', 'ENCHANTED_WILD_ROSE', 'ROSE_BUSH']
    },
    leather_beef: {
      name: 'Leather & Beef',
      icon: '/textures/minecraft/leather.png',
      slot: 29,
      productIds: ['RAW_BEEF', 'ENCHANTED_RAW_BEEF', 'LEATHER', 'ENCHANTED_LEATHER']
    },
    pork: {
      name: 'Pork',
      icon: '/textures/minecraft/porkchop.png',
      slot: 30,
      productIds: ['PORK', 'ENCHANTED_PORK', 'ENCHANTED_GRILLED_PORK']
    },
    chicken_feather: {
      name: 'Chicken & Feather',
      icon: '/textures/minecraft/chicken.png',
      slot: 31,
      productIds: ['RAW_CHICKEN', 'ENCHANTED_RAW_CHICKEN', 'FEATHER', 'ENCHANTED_FEATHER', 'EGG', 'SUPER_EGG']
    },
    mutton_wool: {
      name: 'Mutton & Wool',
      icon: '/textures/minecraft/mutton.png',
      slot: 32,
      productIds: ['MUTTON', 'ENCHANTED_MUTTON', 'ENCHANTED_COOKED_MUTTON', 'WOOL', 'WHITE_WOOL']
    },
    rabbit: {
      name: 'Rabbit',
      icon: '/textures/minecraft/rabbit.png',
      slot: 33,
      productIds: ['RABBIT', 'ENCHANTED_RABBIT', 'RABBIT_FOOT', 'ENCHANTED_RABBIT_FOOT', 'RABBIT_HIDE', 'ENCHANTED_RABBIT_HIDE']
    },
    nether_warts: {
      name: 'Nether Warts',
      icon: '/textures/minecraft/nether_wart.png',
      slot: 34,
      productIds: ['NETHER_STALK', 'ENCHANTED_NETHER_STALK', 'MUTANT_NETHER_STALK']
    },
    garden: {
      name: 'Garden',
      icon: '/textures/minecraft/bread.png',
      slot: 38,
      productIds: ['COMPOST', 'ORGANIC_MATTER', 'HEAVY_DUTY_PELLET', 'COPPER']
    }
  },
  mining: {
    cobblestone: {
      name: 'Cobblestone',
      icon: '/textures/minecraft/cobblestone.png',
      slot: 11,
      productIds: ['COBBLESTONE', 'ENCHANTED_COBBLESTONE']
    },
    coal: {
      name: 'Coal',
      icon: '/textures/minecraft/coal.png',
      slot: 12,
      productIds: ['COAL', 'ENCHANTED_COAL', 'ENCHANTED_COAL_BLOCK']
    },
    iron: {
      name: 'Iron',
      icon: '/textures/minecraft/iron_ingot.png',
      slot: 13,
      productIds: ['IRON_INGOT', 'ENCHANTED_IRON', 'ENCHANTED_IRON_BLOCK']
    },
    gold: {
      name: 'Gold',
      icon: '/textures/minecraft/gold_ingot.png',
      slot: 14,
      productIds: ['GOLD_INGOT', 'ENCHANTED_GOLD', 'ENCHANTED_GOLD_BLOCK']
    },
    diamond: {
      name: 'Diamond',
      icon: '/textures/minecraft/diamond.png',
      slot: 15,
      productIds: ['DIAMOND', 'ENCHANTED_DIAMOND', 'ENCHANTED_DIAMOND_BLOCK']
    },
    lapis_lazuli: {
      name: 'Lapis Lazuli',
      icon: '/textures/minecraft/lapis_lazuli.png',
      slot: 16,
      productIds: ['INK_SACK:4', 'LAPIS_LAZULI', 'ENCHANTED_LAPIS_LAZULI', 'ENCHANTED_LAPIS_LAZULI_BLOCK']
    },
    emerald: {
      name: 'Emerald',
      icon: '/textures/minecraft/emerald.png',
      slot: 20,
      productIds: ['EMERALD', 'ENCHANTED_EMERALD', 'ENCHANTED_EMERALD_BLOCK']
    },
    redstone: {
      name: 'Redstone',
      icon: '/textures/minecraft/redstone.png',
      slot: 21,
      productIds: ['REDSTONE', 'ENCHANTED_REDSTONE', 'ENCHANTED_REDSTONE_BLOCK']
    },
    obsidian: {
      name: 'Obsidian',
      icon: '/textures/minecraft/obsidian.png',
      slot: 22,
      productIds: ['OBSIDIAN', 'ENCHANTED_OBSIDIAN']
    },
    end_stone: {
      name: 'End Stone',
      icon: '/textures/minecraft/end_stone.png',
      slot: 23,
      productIds: ['ENDSTONE', 'END_STONE', 'ENCHANTED_ENDSTONE']
    },
    gravel_flint: {
      name: 'Gravel & Flint',
      icon: '/textures/minecraft/gravel.png',
      slot: 24,
      productIds: ['GRAVEL', 'FLINT', 'ENCHANTED_FLINT']
    },
    sand: {
      name: 'Sand',
      icon: '/textures/minecraft/sand.png',
      slot: 25,
      productIds: ['SAND', 'ENCHANTED_SAND']
    },
    ice: {
      name: 'Ice',
      icon: '/textures/minecraft/ice.png',
      slot: 29,
      productIds: ['ICE', 'PACKED_ICE', 'ENCHANTED_ICE', 'ENCHANTED_PACKED_ICE']
    },
    quartz: {
      name: 'Nether Quartz',
      icon: '/textures/minecraft/quartz.png',
      slot: 30,
      productIds: ['QUARTZ', 'ENCHANTED_QUARTZ', 'ENCHANTED_QUARTZ_BLOCK']
    },
    hard_stone: {
      name: 'Hard Stone',
      icon: '/textures/minecraft/stone.png',
      slot: 31,
      productIds: ['HARD_STONE', 'CONCENTRATED_STONE']
    },
    gemstones: {
      name: 'Gemstones',
      icon: '/textures/minecraft/diamond.png',
      slot: 32,
      productIds: [
        'ROUGH_RUBY_GEM', 'FLAWED_RUBY_GEM', 'FINE_RUBY_GEM', 'FLAWLESS_RUBY_GEM', 'PERFECT_RUBY_GEM',
        'ROUGH_JASPER_GEM', 'FLAWED_JASPER_GEM', 'FINE_JASPER_GEM',
        'ROUGH_OPAL_GEM', 'FLAWED_OPAL_GEM', 'FINE_OPAL_GEM',
        'ROUGH_AMBER_GEM', 'FLAWED_AMBER_GEM', 'FINE_AMBER_GEM',
        'ROUGH_SAPPHIRE_GEM', 'FLAWED_SAPPHIRE_GEM', 'FINE_SAPPHIRE_GEM',
        'ROUGH_AMETHYST_GEM', 'FLAWED_AMETHYST_GEM', 'FINE_AMETHYST_GEM',
        'ROUGH_JADE_GEM', 'FLAWED_JADE_GEM', 'FINE_JADE_GEM',
        'ROUGH_TOPAZ_GEM', 'FLAWED_TOPAZ_GEM', 'FINE_TOPAZ_GEM'
      ]
    },
    mithril: {
      name: 'Mithril',
      icon: '/textures/minecraft/prismarine_shard.png',
      slot: 33,
      productIds: ['MITHRIL_ORE', 'ENCHANTED_MITHRIL', 'REFINED_MITHRIL']
    },
    titanium: {
      name: 'Titanium',
      icon: '/textures/minecraft/iron_ingot.png',
      slot: 34,
      productIds: ['TITANIUM_ORE', 'ENCHANTED_TITANIUM', 'REFINED_TITANIUM']
    },
    glacite_deep: {
      name: 'Glacite & Ores',
      icon: '/textures/minecraft/furnace.png',
      slot: 38,
      productIds: ['GLACITE', 'UMBER', 'TUNGSTEN', 'GLACITE_JEWEL']
    }
  },
  combat: {
    rotten_flesh: {
      name: 'Rotten Flesh',
      icon: '/textures/minecraft/rotten_flesh.png',
      slot: 11,
      productIds: ['ROTTEN_FLESH', 'ENCHANTED_ROTTEN_FLESH']
    },
    bone: {
      name: 'Bone',
      icon: '/textures/minecraft/bone.png',
      slot: 12,
      productIds: ['BONE', 'ENCHANTED_BONE', 'ENCHANTED_BONE_MEAL', 'ENCHANTED_BONE_BLOCK']
    },
    string: {
      name: 'String',
      icon: '/textures/minecraft/string.png',
      slot: 13,
      productIds: ['STRING', 'ENCHANTED_STRING', 'TARANTULA_WEB', 'ENCHANTED_TARANTULA_WEB']
    },
    gunpowder: {
      name: 'Gunpowder',
      icon: '/textures/minecraft/gunpowder.png',
      slot: 14,
      productIds: ['SULPHUR', 'GUNPOWDER', 'ENCHANTED_GUNPOWDER', 'ENCHANTED_SULPHUR']
    },
    ender_pearl: {
      name: 'Ender Pearl',
      icon: '/textures/minecraft/ender_pearl.png',
      slot: 15,
      productIds: ['ENDER_PEARL', 'ENCHANTED_ENDER_PEARL', 'EYE_OF_ENDER', 'ENCHANTED_EYE_OF_ENDER']
    },
    ghast_tear: {
      name: 'Ghast Tear',
      icon: '/textures/minecraft/ghast_tear.png',
      slot: 16,
      productIds: ['GHAST_TEAR', 'ENCHANTED_GHAST_TEAR']
    },
    slimeball: {
      name: 'Slimeball',
      icon: '/textures/minecraft/slimeball.png',
      slot: 20,
      productIds: ['SLIME_BALL', 'ENCHANTED_SLIME_BALL', 'ENCHANTED_SLIME_BLOCK']
    },
    magma_cream: {
      name: 'Magma Cream',
      icon: '/textures/minecraft/magma_cream.png',
      slot: 21,
      productIds: ['MAGMA_CREAM', 'ENCHANTED_MAGMA_CREAM']
    },
    blaze_rod: {
      name: 'Blaze Rod',
      icon: '/textures/minecraft/blaze_rod.png',
      slot: 22,
      productIds: ['BLAZE_ROD', 'ENCHANTED_BLAZE_ROD', 'BLAZE_POWDER', 'ENCHANTED_BLAZE_POWDER']
    },
    obsidian: {
      name: 'Obsidian',
      icon: '/textures/minecraft/obsidian.png',
      slot: 23,
      productIds: ['OBSIDIAN', 'ENCHANTED_OBSIDIAN']
    },
    slayer: {
      name: 'Slayer Drops',
      icon: '/textures/minecraft/magma_cream.png',
      slot: 24,
      productIds: ['MAGMA_URCHIN', 'REVENANT_FLESH', 'REVENANT_VISCERA', 'TARANTULA_SILK', 'WOLF_TOOTH', 'GOLDEN_TOOTH']
    },
    spider_eye: {
      name: 'Spider Eye',
      icon: '/textures/minecraft/spider_eye.png',
      slot: 25,
      productIds: ['SPIDER_EYE', 'ENCHANTED_SPIDER_EYE', 'FERMENTED_SPIDER_EYE', 'ENCHANTED_FERMENTED_SPIDER_EYE']
    },
    wither: {
      name: 'Wither Skull & Void',
      icon: '/textures/minecraft/wither_skeleton_skull.png',
      slot: 29,
      productIds: ['WITHER_SKELETON_SKULL', 'NULL_SPHERE', 'NULL_OVOID', 'SOULFLOW']
    }
  },
  fishing: {
    wood: {
      name: 'Wood Logs',
      icon: '/textures/minecraft/oak_log.png',
      slot: 11,
      productIds: [
        'OAK_LOG', 'ENCHANTED_OAK_LOG',
        'SPRUCE_LOG', 'ENCHANTED_SPRUCE_LOG',
        'BIRCH_LOG', 'ENCHANTED_BIRCH_LOG',
        'JUNGLE_LOG', 'ENCHANTED_JUNGLE_LOG',
        'ACACIA_LOG', 'ENCHANTED_ACACIA_LOG',
        'DARK_OAK_LOG', 'ENCHANTED_DARK_OAK_LOG'
      ]
    },
    cod: {
      name: 'Raw Fish',
      icon: '/textures/minecraft/cod.png',
      slot: 12,
      productIds: ['RAW_FISH', 'ENCHANTED_RAW_FISH', 'COOKED_FISH', 'ENCHANTED_COOKED_FISH']
    },
    flowers: {
      name: 'Flowers',
      icon: '/textures/minecraft/poppy.png',
      slot: 13,
      productIds: ['POPPY', 'DANDELION', 'ENCHANTED_DANDELION', 'ENCHANTED_POPPY']
    },
    prismarine: {
      name: 'Prismarine',
      icon: '/textures/minecraft/prismarine_shard.png',
      slot: 14,
      productIds: ['PRISMARINE_SHARD', 'ENCHANTED_PRISMARINE_SHARD', 'PRISMARINE_CRYSTALS', 'ENCHANTED_PRISMARINE_CRYSTALS']
    },
    clay: {
      name: 'Clay',
      icon: '/textures/minecraft/clay_ball.png',
      slot: 15,
      productIds: ['CLAY_BALL', 'ENCHANTED_CLAY_BALL']
    },
    sponge: {
      name: 'Sponge',
      icon: '/textures/minecraft/sponge.png',
      slot: 16,
      productIds: ['SPONGE', 'ENCHANTED_SPONGE', 'ENCHANTED_WET_SPONGE']
    },
    water_lily: {
      name: 'Water Lily',
      icon: '/textures/minecraft/lily_pad.png',
      slot: 20,
      productIds: ['WATER_LILY', 'ENCHANTED_WATER_LILY']
    },
    ink_sac: {
      name: 'Ink Sac',
      icon: '/textures/minecraft/ink_sac.png',
      slot: 21,
      productIds: ['INK_SACK', 'ENCHANTED_INK_SACK']
    },
    baits: {
      name: 'Baits',
      icon: '/textures/minecraft/carrot.png',
      slot: 22,
      productIds: ['SPIKED_BAIT', 'SPOOKY_BAIT', 'WHALE_BAIT', 'BLESSED_BAIT', 'FISH_BAIT', 'LIGHT_BAIT', 'DARK_BAIT']
    },
    shark: {
      name: 'Shark Drops',
      icon: '/textures/minecraft/flint.png',
      slot: 23,
      productIds: ['NURSE_SHARK_TOOTH', 'BLUE_SHARK_TOOTH', 'TIGER_SHARK_TOOTH', 'GREAT_WHITE_SHARK_TOOTH', 'SHARK_FIN', 'ENCHANTED_SHARK_FIN']
    },
    magma_fish: {
      name: 'Magma Fish',
      icon: '/textures/minecraft/magma_cream.png',
      slot: 24,
      productIds: ['MAGMA_FISH', 'SILVER_MAGMA_FISH', 'GOLD_MAGMA_FISH', 'DIAMOND_MAGMA_FISH']
    },
    salmon: {
      name: 'Salmon',
      icon: '/textures/minecraft/salmon.png',
      slot: 25,
      productIds: ['RAW_FISH:1', 'ENCHANTED_RAW_SALMON', 'COOKED_FISH:1', 'ENCHANTED_COOKED_SALMON']
    },
    tropical_puffer: {
      name: 'Clownfish & Pufferfish',
      icon: '/textures/minecraft/tropical_fish.png',
      slot: 29,
      productIds: ['RAW_FISH:2', 'RAW_FISH:3', 'ENCHANTED_CLOWNFISH', 'ENCHANTED_PUFFERFISH']
    }
  },
  oddities: {
    booster_cookie: {
      name: 'Booster Cookie',
      icon: '/textures/minecraft/cookie.png',
      slot: 11,
      productIds: ['BOOSTER_COOKIE']
    },
    gifts: {
      name: 'Gifts & Boxes',
      icon: '/textures/minecraft/barrel.png',
      slot: 12,
      productIds: ['WHITE_GIFT', 'GREEN_GIFT', 'RED_GIFT', 'JERRY_BOX_GREEN', 'JERRY_BOX_BLUE', 'JERRY_BOX_PURPLE', 'JERRY_BOX_GOLDEN']
    },
    enchanted_books: {
      name: 'Enchanted Books',
      icon: '/textures/minecraft/enchanting_table.png',
      slot: 13,
      isFilter: p => p.id.startsWith('ENCHANTMENT_')
    },
    exp_bottles: {
      name: 'Exp Bottles',
      icon: '/textures/minecraft/experience_bottle.png',
      slot: 14,
      productIds: ['EXP_BOTTLE', 'GRAND_EXP_BOTTLE', 'TITANIC_EXP_BOTTLE', 'COLOSSAL_EXP_BOTTLE']
    },
    null_spheres: {
      name: 'Null Spheres & Ender',
      icon: '/textures/minecraft/ender_pearl.png',
      slot: 15,
      productIds: ['NULL_SPHERE', 'NULL_OVOID', 'NULL_EDGE', 'SOULFLOW']
    },
    stock_of_stonks: {
      name: 'Stock of Stonks',
      icon: '/textures/minecraft/gold_ingot.png',
      slot: 16,
      productIds: ['STOCK_OF_STONKS']
    },
    recombobulator: {
      name: 'Recombobulator 3000',
      icon: '/textures/minecraft/obsidian.png',
      slot: 20,
      productIds: ['RECOMBOBULATOR_3000']
    },
    essence: {
      name: 'Essences',
      icon: '/textures/minecraft/paper.png',
      slot: 21,
      isFilter: p => p.id.startsWith('ESSENCE_')
    },
    compactors: {
      name: 'Compactors',
      icon: '/textures/minecraft/furnace.png',
      slot: 22,
      productIds: ['SUPER_COMPACTOR_3000', 'DWARVEN_COMPACTOR']
    },
    potato_books: {
      name: 'Hot Potato Books',
      icon: '/textures/minecraft/book.png',
      slot: 23,
      productIds: ['HOT_POTATO_BOOK', 'FUMING_POTATO_BOOK']
    },
    candies: {
      name: 'Spooky Candies',
      icon: '/textures/minecraft/pumpkin.png',
      slot: 24,
      productIds: ['GREEN_CANDY', 'PURPLE_CANDY', 'SPOOKY_SHARD']
    },
    dyes: {
      name: 'Dyes & Silex',
      icon: '/textures/minecraft/name_tag.png',
      slot: 25,
      productIds: ['SILEX', 'DYE_WILD_STRAWBERRY', 'DYE_BONES', 'DYE_CARMELITA', 'DYE_AQUAMARINE', 'DYE_EMERALD']
    }
  }
};

function getGroupProducts(group) {
  if (!group || !currentBazaarProducts) return [];
  if (group.isFilter) {
    return currentBazaarProducts.filter(group.isFilter);
  }
  if (!group.productIds) return [];

  const matched = [];
  const matchedIds = new Set();

  // 1. Direct / exact matches first
  for (const targetId of group.productIds) {
    const p = currentBazaarProducts.find(item => item.id.toUpperCase() === targetId.toUpperCase());
    if (p && !matchedIds.has(p.id)) {
      matched.push(p);
      matchedIds.add(p.id);
    }
  }

  // 2. Inclusion matches (avoiding enchanted books/essences)
  for (const p of currentBazaarProducts) {
    if (matchedIds.has(p.id)) continue;
    if (p.id.startsWith('ENCHANTMENT_') || p.id.startsWith('ESSENCE_')) continue;
    for (const targetId of group.productIds) {
      if (p.id.toUpperCase().includes(targetId.toUpperCase())) {
        matched.push(p);
        matchedIds.add(p.id);
        break;
      }
    }
  }

  return matched;
}

function getBazaarProductCategory(product) {
  const id = product.id.toUpperCase();
  if (id.startsWith('ENCHANTMENT_') || id.startsWith('ESSENCE_')) return 'oddities';
  if (/WHEAT|CARROT|POTATO|PUMPKIN|MELON|MUSHROOM|CACTUS|SUGAR|NETHER_STALK|BEEF|PORK|CHICKEN|MUTTON|RABBIT|FEATHER|LEATHER|EGG|PELLET|COMPOST|CROP|HAY|COCOA|BREAD/i.test(id)) return 'farming';
  if (/COBBLE|COAL|IRON|GOLD_INGOT|DIAMOND|EMERALD|LAPIS|REDSTONE|QUARTZ|OBSIDIAN|GLOWSTONE|GRAVEL|FLINT|ICE|NETHERRACK|SAND|ENDSTONE|END_STONE|MITHRIL|TITANIUM|HARD_STONE|CONCENTRATED_STONE|RUBY|SAPPHIRE|AMETHYST|AMBER|TOPAZ|JADE|JASPER|OPAL|GLACITE|TUNGSTEN|UMBER|STARFALL|TREASURITE/i.test(id)) return 'mining';
  if (/ROTTEN|BONE|STRING|GUNPOWDER|SULPHUR|ENDER_PEARL|EYE_OF_ENDER|GHAST_TEAR|SLIME|MAGMA_CREAM|BLAZE|SPIDER|WITHER|REVENANT|TARANTULA|WOLF_TOOTH|NULL_SPHERE|NULL_OVOID|SOULFLOW|DERELICT|VERTEX|APEX|INFERNO|HEMOGLASS|FANG|TENTACLE|ECTOPLASM/i.test(id)) return 'combat';
  if (/WOOD|LOG|OAK|SPRUCE|BIRCH|JUNGLE|ACACIA|DARK_OAK|FISH|SALMON|CLOWN|PUFFER|PRISMARINE|CLAY|WATER_LILY|LILY_PAD|SPONGE|SHARK|BAIT/i.test(id)) return 'fishing';
  return 'oddities';
}

function getBazaarItemTexture(product) {
  const id = product.id.toUpperCase();

  // Mob drops & combat
  if (id.includes('ROTTEN_FLESH')) return '/textures/minecraft/rotten_flesh.png';
  if (id.includes('BONE')) return '/textures/minecraft/bone.png';
  if (id.includes('STRING') || id.includes('WEB')) return '/textures/minecraft/string.png';
  if (id.includes('GUNPOWDER') || id.includes('SULPHUR')) return '/textures/minecraft/gunpowder.png';
  if (id.includes('ENDER_PEARL') || id.includes('EYE_OF_ENDER')) return '/textures/minecraft/ender_pearl.png';
  if (id.includes('GHAST_TEAR')) return '/textures/minecraft/ghast_tear.png';
  if (id.includes('SLIME')) return '/textures/minecraft/slimeball.png';
  if (id.includes('MAGMA_CREAM') || id.includes('MAGMA_FISH')) return '/textures/minecraft/magma_cream.png';
  if (id.includes('BLAZE_ROD')) return '/textures/minecraft/blaze_rod.png';
  if (id.includes('BLAZE_POWDER')) return '/textures/minecraft/blaze_powder.png';
  if (id.includes('OBSIDIAN') || id.includes('RECOMBOBULATOR')) return '/textures/minecraft/obsidian.png';
  if (id.includes('SPIDER_EYE') || id.includes('FERMENTED')) return '/textures/minecraft/spider_eye.png';
  if (id.includes('WITHER_SKELETON_SKULL') || id.includes('WITHER')) return '/textures/minecraft/wither_skeleton_skull.png';
  if (id.includes('GLOWSTONE')) return '/textures/minecraft/glowstone_dust.png';

  // Farming crops & animals
  if (id.includes('HAY') || id.includes('BALE')) return '/textures/minecraft/hay_block.png';
  if (id.includes('SEED')) return '/textures/minecraft/wheat_seeds.png';
  if (id.includes('BREAD')) return '/textures/minecraft/bread.png';
  if (id.includes('WHEAT')) return '/textures/minecraft/wheat.png';
  if (id.includes('CARROT')) return '/textures/minecraft/carrot.png';
  if (id.includes('POTATO')) return '/textures/minecraft/potato.png';
  if (id.includes('PUMPKIN')) return '/textures/minecraft/pumpkin.png';
  if (id.includes('MELON')) return '/textures/minecraft/melon.png';
  if (id.includes('RED_MUSHROOM')) return '/textures/minecraft/red_mushroom.png';
  if (id.includes('BROWN_MUSHROOM')) return '/textures/minecraft/brown_mushroom.png';
  if (id.includes('MUSHROOM')) return '/textures/minecraft/red_mushroom.png';
  if (id.includes('COCOA') || id === 'INK_SACK:3') return '/textures/minecraft/cocoa_beans.png';
  if (id.includes('CACTUS')) return '/textures/minecraft/cactus.png';
  if (id.includes('SUGAR')) return '/textures/minecraft/sugar_cane.png';
  if (id.includes('NETHER_STALK') || id.includes('NETHER_WART')) return '/textures/minecraft/nether_wart.png';
  if (id.includes('SUNFLOWER')) return '/textures/minecraft/sunflower.png';
  if (id.includes('MOONFLOWER') || id.includes('CORNFLOWER')) return '/textures/minecraft/cornflower.png';
  if (id.includes('WILD_ROSE') || id.includes('POPPY') || id.includes('ROSE')) return '/textures/minecraft/poppy.png';
  if (id.includes('BEEF')) return '/textures/minecraft/beef.png';
  if (id.includes('PORK')) return '/textures/minecraft/porkchop.png';
  if (id.includes('CHICKEN')) return '/textures/minecraft/chicken.png';
  if (id.includes('MUTTON')) return '/textures/minecraft/mutton.png';
  if (id.includes('RABBIT')) return '/textures/minecraft/rabbit.png';
  if (id.includes('FEATHER')) return '/textures/minecraft/feather.png';
  if (id.includes('EGG')) return '/textures/minecraft/egg.png';
  if (id.includes('LEATHER')) return '/textures/minecraft/leather.png';

  // Mining
  if (id.includes('COBBLESTONE')) return '/textures/minecraft/cobblestone.png';
  if (id.includes('COAL')) return '/textures/minecraft/coal.png';
  if (id.includes('IRON')) return '/textures/minecraft/iron_ingot.png';
  if (id.includes('GOLD')) return '/textures/minecraft/gold_ingot.png';
  if (id.includes('DIAMOND')) return '/textures/minecraft/diamond.png';
  if (id.includes('EMERALD')) return '/textures/minecraft/emerald.png';
  if (id.includes('LAPIS') || id === 'INK_SACK:4') return '/textures/minecraft/lapis_lazuli.png';
  if (id.includes('REDSTONE')) return '/textures/minecraft/redstone.png';
  if (id.includes('QUARTZ')) return '/textures/minecraft/quartz.png';
  if (id.includes('GRAVEL')) return '/textures/minecraft/gravel.png';
  if (id.includes('FLINT')) return '/textures/minecraft/flint.png';
  if (id.includes('ICE')) return '/textures/minecraft/ice.png';
  if (id.includes('NETHERRACK')) return '/textures/minecraft/netherrack.png';
  if (id.includes('SAND')) return '/textures/minecraft/sand.png';
  if (id.includes('END_STONE') || id.includes('ENDSTONE')) return '/textures/minecraft/end_stone.png';
  if (id.includes('STONE')) return '/textures/minecraft/stone.png';
  if (id.includes('FURNACE') || id.includes('COMPACTOR') || id.includes('GLACITE')) return '/textures/minecraft/furnace.png';
  if (id.includes('GEM') || id.includes('RUBY') || id.includes('SAPPHIRE') || id.includes('AMBER') || id.includes('TOPAZ') || id.includes('JASPER') || id.includes('OPAL') || id.includes('JADE') || id.includes('AMETHYST')) return '/textures/minecraft/diamond.png';

  // Woods & Fishes
  if (id.includes('OAK') && id.includes('LOG')) return '/textures/minecraft/oak_log.png';
  if (id.includes('SPRUCE')) return '/textures/minecraft/spruce_log.png';
  if (id.includes('BIRCH')) return '/textures/minecraft/birch_log.png';
  if (id.includes('JUNGLE')) return '/textures/minecraft/jungle_log.png';
  if (id.includes('ACACIA')) return '/textures/minecraft/acacia_log.png';
  if (id.includes('DARK_OAK')) return '/textures/minecraft/dark_oak_log.png';
  if (id.includes('SALMON') || id === 'RAW_FISH:1') return '/textures/minecraft/salmon.png';
  if (id.includes('CLOWN') || id.includes('TROPICAL') || id === 'RAW_FISH:2') return '/textures/minecraft/tropical_fish.png';
  if (id.includes('PUFFER') || id === 'RAW_FISH:3') return '/textures/minecraft/pufferfish.png';
  if (id.includes('FISH') || id === 'RAW_FISH') return '/textures/minecraft/cod.png';
  if (id.includes('PRISMARINE_SHARD')) return '/textures/minecraft/prismarine_shard.png';
  if (id.includes('PRISMARINE_CRYSTALS')) return '/textures/minecraft/prismarine_crystals.png';
  if (id.includes('CLAY')) return '/textures/minecraft/clay_ball.png';
  if (id.includes('LILY') || id.includes('WATER_LILY')) return '/textures/minecraft/lily_pad.png';
  if (id.includes('SPONGE')) return '/textures/minecraft/sponge.png';
  if (id.includes('INK_SACK') || id.includes('INK_SAC')) return '/textures/minecraft/ink_sac.png';

  // Oddities & Misc
  if (id.includes('COOKIE')) return '/textures/minecraft/cookie.png';
  if (id.includes('EXP_BOTTLE') || id.includes('EXPERIENCE')) return '/textures/minecraft/experience_bottle.png';
  if (id.includes('ENCHANTMENT_') || id.includes('BOOK')) return '/textures/minecraft/book.png';
  if (id.includes('ESSENCE') || id.includes('PAPER')) return '/textures/minecraft/paper.png';
  if (id.includes('SILEX') || id.includes('TAG')) return '/textures/minecraft/name_tag.png';

  // Fallback
  const cat = getBazaarProductCategory(product);
  if (cat === 'farming') return '/textures/minecraft/wheat.png';
  if (cat === 'mining') return '/textures/minecraft/iron_ingot.png';
  if (cat === 'combat') return '/textures/minecraft/iron_sword.png';
  if (cat === 'fishing') return '/textures/minecraft/cod.png';
  return '/textures/minecraft/enchanting_table.png';
}

function createProductSlotData(product) {
  const isEnchanted = product.id.startsWith('ENCHANTED_') || product.id.includes('ENCHANTMENT_');
  const rarityColor = isEnchanted ? '#FFAA00' : '#FFFFFF';
  const catName = BAZAAR_CATEGORIES[getBazaarProductCategory(product)]?.name || 'Commodity';

  return {
    type: 'product',
    product,
    icon: getBazaarItemTexture(product),
    tooltip: {
      cleanName: product.name,
      formattedName: `<span style="color: ${rarityColor}; font-weight: bold;">${product.name}</span>`,
      loreHtml: [
        `<span style="color: #AAAAAA;">Commodity (${catName})</span>`,
        ``,
        `<span style="color: #AAAAAA;">Buy Price: </span><span style="color: #FFAA00; font-weight: bold;">${formatNum(product.buyPrice)} coins </span><span style="color: #AAAAAA;">each</span>`,
        `<span style="color: #AAAAAA;">Sell Price: </span><span style="color: #55FF55; font-weight: bold;">${formatNum(product.sellPrice)} coins </span><span style="color: #AAAAAA;">each</span>`,
        `<span style="color: #AAAAAA;">Spread: </span><span style="color: #55FFFF; font-weight: bold;">+${formatNum(product.spread)} </span><span style="color: #FFFF55;">(${product.marginPercent}% margin)</span>`,
        ``,
        `<span style="color: #AAAAAA;">7d Buy Volume: </span><span style="color: #55FFFF;">${formatNum(product.buyVolume || (product.weeklyVolume / 2))}</span>`,
        `<span style="color: #AAAAAA;">7d Sell Volume: </span><span style="color: #55FFFF;">${formatNum(product.sellVolume || (product.weeklyVolume / 2))}</span>`,
        `<span style="color: #AAAAAA;">Active Orders: </span><span style="color: #FFFF55;">${product.buyOrders || 0} buy / ${product.sellOrders || 0} sell</span>`,
        ``,
        `<span style="color: #FFFF55; font-style: italic;">▶ Click to view Order Book & Trading Depth</span>`
      ]
    }
  };
}

async function loadBazaar() {
  showLoader('Loading Bazaar market depth & prices...');
  try {
    const res = await fetch('/api/bazaar');
    const data = await res.json();
    currentBazaarProducts = data.products || [];
    renderBazaarChestGUI();
    renderBazaarInventoryGUI();
    renderBazaarTopFlips();
  } catch (err) {
    console.error('Failed to load bazaar:', err);
  } finally {
    hideLoader();
  }
}

function renderBazaarChestGUI() {
  const grid = document.getElementById('bazaar-chest-grid');
  const titleEl = document.getElementById('bazaar-gui-title');
  const pageEl = document.getElementById('bazaar-page-indicator');
  if (!grid) return;

  const currentMeta = BAZAAR_CATEGORIES[bazaarCategory] || BAZAAR_CATEGORIES.farming;
  const glassTexture = currentMeta.glass;

  // Title handling
  if (titleEl) {
    if (bazaarCategory === 'search') {
      titleEl.textContent = 'Bazaar ➜ Search Results';
    } else if (bazaarSubGroup) {
      const groupData = BAZAAR_PARENT_GROUPS[bazaarCategory]?.[bazaarSubGroup];
      titleEl.textContent = groupData ? `Bazaar ➜ ${groupData.name}` : currentMeta.title;
    } else {
      titleEl.textContent = currentMeta.title;
    }
  }

  // 54 slots array (6 rows x 9 columns)
  const slots = new Array(54).fill(null);

  // 1. Column 0: 6 Navigation Items on the left side
  slots[0] = {
    type: 'nav',
    category: 'farming',
    name: 'Farming',
    icon: '/textures/minecraft/golden_hoe.png',
    active: bazaarCategory === 'farming',
    tooltip: {
      cleanName: 'Farming',
      formattedName: '<span style="color: #FFFF55; font-weight: bold;">Farming</span>',
      loreHtml: ['<span style="color: #AAAAAA;">View agricultural crops, food, and livestock products.</span>', '', '<span style="color: #FFFF55;">Click to switch category!</span>']
    }
  };
  slots[9] = {
    type: 'nav',
    category: 'mining',
    name: 'Mining',
    icon: '/textures/minecraft/diamond_pickaxe.png',
    active: bazaarCategory === 'mining',
    tooltip: {
      cleanName: 'Mining',
      formattedName: '<span style="color: #55FFFF; font-weight: bold;">Mining</span>',
      loreHtml: ['<span style="color: #AAAAAA;">View ores, metals, minerals, and refined gemstones.</span>', '', '<span style="color: #FFFF55;">Click to switch category!</span>']
    }
  };
  slots[18] = {
    type: 'nav',
    category: 'combat',
    name: 'Combat',
    icon: '/textures/minecraft/iron_sword.png',
    active: bazaarCategory === 'combat',
    tooltip: {
      cleanName: 'Combat',
      formattedName: '<span style="color: #FF5555; font-weight: bold;">Combat</span>',
      loreHtml: ['<span style="color: #AAAAAA;">View mob drops, slayer materials, and combat trophies.</span>', '', '<span style="color: #FFFF55;">Click to switch category!</span>']
    }
  };
  slots[27] = {
    type: 'nav',
    category: 'fishing',
    name: 'Woods & Fishes',
    icon: '/textures/minecraft/fishing_rod.png',
    active: bazaarCategory === 'fishing',
    tooltip: {
      cleanName: 'Woods & Fishes',
      formattedName: '<span style="color: #FFAA00; font-weight: bold;">Woods & Fishes</span>',
      loreHtml: ['<span style="color: #AAAAAA;">View tree logs, wood types, fish, and ocean treasures.</span>', '', '<span style="color: #FFFF55;">Click to switch category!</span>']
    }
  };
  slots[36] = {
    type: 'nav',
    category: 'oddities',
    name: 'Oddities',
    icon: '/textures/minecraft/enchanting_table.png',
    active: bazaarCategory === 'oddities',
    tooltip: {
      cleanName: 'Oddities',
      formattedName: '<span style="color: #FF55FF; font-weight: bold;">Oddities</span>',
      loreHtml: ['<span style="color: #AAAAAA;">View enchanted books, booster cookies, essences, and consumables.</span>', '', '<span style="color: #FFFF55;">Click to switch category!</span>']
    }
  };
  slots[45] = {
    type: 'nav',
    category: 'search',
    name: 'Search Commodities',
    icon: '/textures/minecraft/oak_sign.png',
    active: bazaarCategory === 'search',
    tooltip: {
      cleanName: 'Search Commodities',
      formattedName: '<span style="color: #FFFFFF; font-weight: bold;">Search Commodities</span>',
      loreHtml: ['<span style="color: #AAAAAA;">Search through all 2,100+ Bazaar commodities.</span>', '', '<span style="color: #FFFF55;">Click to search!</span>']
    }
  };

  // 2. Category Stained Glass Borders
  // Col 1 (divider): 1, 10, 19, 28, 37, 46
  // Col 8 (right divider): 8, 17, 26, 35, 44, 53
  // Row 0 (top divider): 2, 3, 4, 5, 6, 7
  const glassBorderIndices = [
    1, 10, 19, 28, 37, 46,
    8, 17, 26, 35, 44, 53,
    2, 3, 4, 5, 6, 7
  ];
  for (const idx of glassBorderIndices) {
    slots[idx] = {
      type: 'glass',
      icon: glassTexture
    };
  }

  // 3. Row 5 Bottom Utility Slots
  slots[46] = { type: 'glass', icon: glassTexture };

  slots[47] = {
    type: 'orders',
    icon: '/textures/minecraft/barrel.png',
    tooltip: {
      cleanName: 'Order Management',
      formattedName: '<span style="color: #FFAA00; font-weight: bold;">Order Management</span>',
      loreHtml: ['<span style="color: #AAAAAA;">View active buy orders and sell offers.</span>']
    }
  };

  slots[49] = {
    type: 'close',
    icon: '/textures/minecraft/barrier.png',
    tooltip: {
      cleanName: 'Close',
      formattedName: '<span style="color: #FF5555; font-weight: bold;">Close</span>',
      loreHtml: ['<span style="color: #AAAAAA;">Close the Bazaar menu.</span>']
    }
  };

  slots[50] = {
    type: 'book',
    icon: '/textures/minecraft/book.png',
    tooltip: {
      cleanName: 'Bazaar Information',
      formattedName: '<span style="color: #55FF55; font-weight: bold;">Bazaar Market Guide</span>',
      loreHtml: ['<span style="color: #AAAAAA;">Instant Buy fills lowest sell offer.</span>', '<span style="color: #AAAAAA;">Instant Sell fills highest buy order.</span>']
    }
  };

  slots[51] = {
    type: 'flips',
    icon: '/textures/minecraft/map.png',
    tooltip: {
      cleanName: 'Arbitrage Flips',
      formattedName: '<span style="color: #55FFFF; font-weight: bold;">Top Margin Opportunities</span>',
      loreHtml: ['<span style="color: #AAAAAA;">Click to toggle high-margin flip list!</span>']
    }
  };

  slots[52] = {
    type: 'sort',
    icon: '/textures/minecraft/redstone_torch.png',
    tooltip: {
      cleanName: 'Sort Options',
      formattedName: '<span style="color: #FF5555; font-weight: bold;">Sort Options</span>',
      loreHtml: [`<span style="color: #AAAAAA;">Current Sort: </span><span style="color: #FFFF55;">${bazaarSortMode === 'volume' ? '7D Volume' : 'Profit Spread'}</span>`, '', '<span style="color: #FFFF55;">Click to toggle Volume / Spread sort!</span>']
    }
  };

  slots[53] = { type: 'glass', icon: glassTexture };

  if (pageEl) pageEl.textContent = '';

  // 4. Fill Center Grid Content
  if (bazaarCategory === 'search') {
    let searchProducts = currentBazaarProducts;
    if (bazaarSearchQuery) {
      searchProducts = currentBazaarProducts.filter(p =>
        p.name.toLowerCase().includes(bazaarSearchQuery) || p.id.toLowerCase().includes(bazaarSearchQuery)
      );
    }
    const COMMODITY_SLOTS_COUNT = 24;
    const totalPages = Math.max(1, Math.ceil(searchProducts.length / COMMODITY_SLOTS_COUNT));
    bazaarCategoryPage = Math.min(bazaarCategoryPage, totalPages - 1);
    if (pageEl && totalPages > 1) {
      pageEl.textContent = `Page ${bazaarCategoryPage + 1}/${totalPages}`;
    }

    const availableSlots = [
      11, 12, 13, 14, 15, 16,
      20, 21, 22, 23, 24, 25,
      29, 30, 31, 32, 33, 34,
      38, 39, 40, 41, 42, 43
    ];
    const startIdx = bazaarCategoryPage * COMMODITY_SLOTS_COUNT;
    const pageItems = searchProducts.slice(startIdx, startIdx + COMMODITY_SLOTS_COUNT);

    for (let i = 0; i < availableSlots.length; i++) {
      const slotIdx = availableSlots[i];
      const prod = pageItems[i];
      if (prod) {
        slots[slotIdx] = createProductSlotData(prod);
      }
    }

    // Pagination in row 5
    if (bazaarCategoryPage > 0) {
      slots[48] = {
        type: 'prev_page',
        icon: '/textures/minecraft/arrow.png',
        tooltip: { cleanName: 'Previous Page', formattedName: '<span style="color: #FFFF55; font-weight: bold;">Previous Page</span>', loreHtml: [`<span style="color: #AAAAAA;">Click for page ${bazaarCategoryPage}.</span>`] }
      };
    } else {
      slots[48] = { type: 'glass', icon: glassTexture };
    }

    if (bazaarCategoryPage < totalPages - 1) {
      slots[50] = {
        type: 'next_page',
        icon: '/textures/minecraft/arrow.png',
        tooltip: { cleanName: 'Next Page', formattedName: '<span style="color: #FFFF55; font-weight: bold;">Next Page</span>', loreHtml: [`<span style="color: #AAAAAA;">Click for page ${bazaarCategoryPage + 2}.</span>`] }
      };
    }

  } else if (bazaarSubGroup) {
    // Drilled-down into Sub-Group!
    const groupData = BAZAAR_PARENT_GROUPS[bazaarCategory]?.[bazaarSubGroup];
    const groupItems = groupData ? getGroupProducts(groupData) : [];

    // Sort group items: raw first, then enchanted, then by volume
    groupItems.sort((a, b) => {
      const aIsEnch = a.id.startsWith('ENCHANTED_') || a.id.includes('ENCHANTMENT_');
      const bIsEnch = b.id.startsWith('ENCHANTED_') || b.id.includes('ENCHANTMENT_');
      if (aIsEnch !== bIsEnch) return aIsEnch ? 1 : -1;
      return (b.weeklyVolume || 0) - (a.weeklyVolume || 0);
    });

    const availableSlots = [
      11, 12, 13, 14, 15, 16,
      20, 21, 22, 23, 24, 25,
      29, 30, 31, 32, 33, 34,
      38, 39, 40, 41, 42, 43
    ];

    for (let i = 0; i < groupItems.length && i < availableSlots.length; i++) {
      const slotIdx = availableSlots[i];
      slots[slotIdx] = createProductSlotData(groupItems[i]);
    }

    // Back arrow at slot 48
    slots[48] = {
      type: 'back',
      icon: '/textures/minecraft/arrow.png',
      tooltip: {
        cleanName: 'Go Back',
        formattedName: '<span style="color: #FFFF55; font-weight: bold;">◀ Go Back</span>',
        loreHtml: [`<span style="color: #AAAAAA;">To Bazaar ➜ ${currentMeta.name}</span>`]
      }
    };

  } else {
    // Top-level Parent Category View (Farming, Mining, Combat, Woods & Fishes, Oddities)
    slots[48] = { type: 'glass', icon: glassTexture };
    const parentGroups = BAZAAR_PARENT_GROUPS[bazaarCategory] || {};

    for (const [key, group] of Object.entries(parentGroups)) {
      const prods = getGroupProducts(group);
      const sampleNames = prods.slice(0, 4).map(p => `<span style="color: #888888;">• ${p.name}</span>`);
      if (prods.length > 4) {
        sampleNames.push(`<span style="color: #666666; font-style: italic;">+${prods.length - 4} more...</span>`);
      }

      slots[group.slot] = {
        type: 'subgroup',
        groupKey: key,
        name: group.name,
        icon: group.icon,
        tooltip: {
          cleanName: group.name,
          formattedName: `<span style="color: #55FF55; font-weight: bold;">${group.name}</span>`,
          loreHtml: [
            `<span style="color: #AAAAAA;">Commodity Group (${currentMeta.name})</span>`,
            ``,
            `<span style="color: #AAAAAA;">Includes </span><span style="color: #FFFF55; font-weight: bold;">${prods.length}</span><span style="color: #AAAAAA;"> commodities:</span>`,
            ...sampleNames,
            ``,
            `<span style="color: #FFFF55; font-style: italic;">▶ Click to view commodities!</span>`
          ]
        }
      };
    }
  }

  // Render 54 slots to DOM
  grid.innerHTML = slots.map((s, idx) => renderSlotCell(s, idx)).join('');
}

function renderSlotCell(slotData, index) {
  if (!slotData) {
    return `<div class="mc-slot-cell" data-idx="${index}"></div>`;
  }

  if (slotData.type === 'glass') {
    return `
      <div class="mc-slot-cell glass-border">
        <img src="${slotData.icon}" alt="" />
      </div>
    `;
  }

  const encodedTooltip = slotData.tooltip ? encodeURIComponent(JSON.stringify(slotData.tooltip)) : '';
  const tooltipAttr = encodedTooltip ? `data-item="${encodedTooltip}"` : '';

  if (slotData.type === 'nav') {
    const activeCls = slotData.active ? 'nav-active' : '';
    return `
      <div class="mc-slot-cell ${activeCls} mc-slot" ${tooltipAttr} onclick="switchBazaarCategory('${slotData.category}')">
        <img src="${slotData.icon}" alt="${slotData.name}" />
      </div>
    `;
  }

  if (slotData.type === 'subgroup') {
    return `
      <div class="mc-slot-cell mc-slot" ${tooltipAttr} onclick="openBazaarSubGroup('${slotData.groupKey}')">
        <img src="${slotData.icon}" alt="${slotData.name}" />
      </div>
    `;
  }

  if (slotData.type === 'back') {
    return `
      <div class="mc-slot-cell mc-slot" ${tooltipAttr} onclick="returnFromBazaarSubGroup()">
        <img src="${slotData.icon}" alt="Go Back" style="transform: rotate(180deg);" />
      </div>
    `;
  }

  if (slotData.type === 'prev_page') {
    return `
      <div class="mc-slot-cell mc-slot" ${tooltipAttr} onclick="bazaarPrevPage()">
        <img src="${slotData.icon}" alt="Previous Page" style="transform: rotate(180deg);" />
      </div>
    `;
  }

  if (slotData.type === 'next_page') {
    return `
      <div class="mc-slot-cell mc-slot" ${tooltipAttr} onclick="bazaarNextPage()">
        <img src="${slotData.icon}" alt="Next Page" />
      </div>
    `;
  }

  if (slotData.type === 'close') {
    return `
      <div class="mc-slot-cell mc-slot" ${tooltipAttr} onclick="closeHubWindow()">
        <img src="${slotData.icon}" alt="Close" />
      </div>
    `;
  }

  if (slotData.type === 'flips') {
    return `
      <div class="mc-slot-cell mc-slot" ${tooltipAttr} onclick="toggleFlipsPanel()">
        <img src="${slotData.icon}" alt="Flips" />
      </div>
    `;
  }

  if (slotData.type === 'sort') {
    return `
      <div class="mc-slot-cell mc-slot" ${tooltipAttr} onclick="toggleBazaarSort()">
        <img src="${slotData.icon}" alt="Sort" />
      </div>
    `;
  }

  if (slotData.type === 'orders' || slotData.type === 'book') {
    return `
      <div class="mc-slot-cell mc-slot" ${tooltipAttr}>
        <img src="${slotData.icon}" alt="" />
      </div>
    `;
  }

  if (slotData.type === 'product') {
    const p = slotData.product;
    const isEnchanted = p.id.startsWith('ENCHANTED_') || p.id.includes('ENCHANTMENT_');
    const enchCls = isEnchanted ? 'mc-enchanted' : '';
    return `
      <div class="mc-slot-cell mc-slot ${enchCls}" ${tooltipAttr} onclick="openBazaarModal('${p.id}')">
        <img src="${slotData.icon}" alt="${p.name}" />
      </div>
    `;
  }

  return `<div class="mc-slot-cell" data-idx="${index}"></div>`;
}

function renderBazaarInventoryGUI() {
  const invGrid = document.getElementById('bazaar-inventory-grid');
  const hotbarGrid = document.getElementById('bazaar-hotbar-grid');
  const ignEl = document.getElementById('bazaar-player-ign');
  if (!invGrid || !hotbarGrid) return;

  if (ignEl) {
    ignEl.textContent = currentPlayerData?.player?.username || '(No Player Profile Selected)';
  }

  const items = currentPlayerData?.inventories?.inventory || [];
  const mainItems = items.slice(9, 36);
  const hotbarItems = items.slice(0, 9);

  invGrid.innerHTML = Array.from({ length: 27 }, (_, i) => {
    return renderBazaarInvSlot(mainItems[i]);
  }).join('');

  hotbarGrid.innerHTML = Array.from({ length: 9 }, (_, i) => {
    return renderBazaarInvSlot(hotbarItems[i]);
  }).join('');
}

function renderBazaarInvSlot(item) {
  if (!item || item.empty) {
    return '<div class="mc-slot-cell"></div>';
  }

  const encoded = encodeURIComponent(JSON.stringify(item));
  const countDisplay = item.count > 1 ? `<span class="mc-slot-count">${item.count}</span>` : '';
  const rarityBorder = item.rarityColor ? `border-color: ${item.rarityColor};` : '';

  let textureUrl = null;
  if (item.headTexture) {
    textureUrl = `https://textures.minecraft.net/texture/${item.headTexture}`;
  } else if (item.skullTexture) {
    try {
      const parsed = JSON.parse(atob(item.skullTexture));
      textureUrl = parsed?.textures?.SKIN?.url?.replace('http://', 'https://');
    } catch {}
  }

  return `
    <div class="mc-slot-cell mc-slot" data-item="${encoded}" style="${rarityBorder}">
      ${textureUrl ? `
        <img src="${textureUrl}" alt="" />
      ` : `
        <span class="minecraft-font text-base font-bold select-none pointer-events-none" style="color: ${item.rarityColor || '#fff'}">
          ${(item.cleanName || '?').charAt(0)}
        </span>
      `}
      ${countDisplay}
    </div>
  `;
}

function openBazaarSubGroup(groupKey) {
  bazaarSubGroup = groupKey;
  renderBazaarChestGUI();
}

function returnFromBazaarSubGroup() {
  bazaarSubGroup = null;
  renderBazaarChestGUI();
}

function switchBazaarCategory(cat) {
  bazaarCategory = cat;
  bazaarSubGroup = null;
  bazaarCategoryPage = 0;
  const searchContainer = document.getElementById('bazaar-search-container');
  if (searchContainer) {
    if (cat === 'search') {
      searchContainer.classList.remove('hidden');
      const input = document.getElementById('bazaar-search-input');
      if (input) {
        input.focus();
      }
    } else {
      searchContainer.classList.add('hidden');
    }
  }
  renderBazaarChestGUI();
}

function toggleBazaarSearch() {
  if (bazaarCategory === 'search') {
    switchBazaarCategory('farming');
  } else {
    switchBazaarCategory('search');
  }
}

function handleBazaarSearchInput() {
  bazaarCategoryPage = 0;
  bazaarSearchQuery = (document.getElementById('bazaar-search-input')?.value || '').trim().toLowerCase();
  renderBazaarChestGUI();
}

function toggleFlipsPanel() {
  const panel = document.getElementById('bazaar-flips-panel');
  if (panel) {
    panel.classList.toggle('hidden');
  }
}

function toggleBazaarSort() {
  bazaarSortMode = bazaarSortMode === 'volume' ? 'spread' : 'volume';
  renderBazaarChestGUI();
}

function bazaarNextPage() {
  bazaarCategoryPage++;
  renderBazaarChestGUI();
}

function bazaarPrevPage() {
  if (bazaarCategoryPage > 0) {
    bazaarCategoryPage--;
    renderBazaarChestGUI();
  }
}

function renderBazaarTopFlips() {
  const container = document.getElementById('bazaar-top-flips');
  if (!container || !currentBazaarProducts) return;

  const flips = [...currentBazaarProducts]
    .filter(p => p.buyPrice > 50 && p.weeklyVolume > 50000 && p.spread > 0)
    .sort((a, b) => b.spread - a.spread)
    .slice(0, 4);

  container.innerHTML = flips.map(f => `
    <div onclick="openBazaarModal('${f.id}')" class="p-2.5 rounded-xl bg-[#090c10] border border-[#21262d] hover:border-amber-400/50 cursor-pointer transition space-y-1">
      <div class="flex justify-between items-center">
        <h5 class="font-bold text-xs text-white truncate max-w-[120px]">${f.name}</h5>
        <span class="text-[10px] font-bold text-emerald-400">+${f.marginPercent}%</span>
      </div>
      <div class="flex justify-between text-[11px] font-mono">
        <span class="text-gray-400">Spread:</span>
        <span class="text-amber-400 font-bold">${formatNum(f.spread)}</span>
      </div>
    </div>
  `).join('');
}

// Bazaar Order Book Modal
async function openBazaarModal(productId) {
  const modal = document.getElementById('bazaar-modal');
  const content = document.getElementById('bazaar-modal-content');
  if (!modal || !content) return;

  modal.classList.remove('hidden');
  content.innerHTML = '<div class="text-center p-8 text-sm text-gray-400">Loading Order Book...</div>';

  try {
    const res = await fetch(`/api/bazaar/${encodeURIComponent(productId)}`);
    const data = await res.json();
    const p = data.product;
    const q = p.quick_status || {};

    content.innerHTML = `
      <div class="space-y-4 font-mono">
        <div class="flex items-center justify-between border-b border-[#30363d] pb-3">
          <div>
            <h3 class="text-lg font-black text-white">${p.product_id.replace(/_/g, ' ')}</h3>
            <span class="text-xs text-gray-400">Product ID: ${p.product_id}</span>
          </div>
        </div>

        <!-- Quick Status -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div class="p-2.5 rounded-lg bg-[#090c10] border border-[#21262d]">
            <span class="text-gray-400 block text-[10px]">Instant Buy</span>
            <span class="text-amber-400 font-bold text-sm">${formatNum(q.buyPrice)}</span>
          </div>
          <div class="p-2.5 rounded-lg bg-[#090c10] border border-[#21262d]">
            <span class="text-gray-400 block text-[10px]">Instant Sell</span>
            <span class="text-emerald-400 font-bold text-sm">${formatNum(q.sellPrice)}</span>
          </div>
          <div class="p-2.5 rounded-lg bg-[#090c10] border border-[#21262d]">
            <span class="text-gray-400 block text-[10px]">Buy Orders</span>
            <span class="text-white font-bold text-sm">${(q.buyOrders || 0).toLocaleString()}</span>
          </div>
          <div class="p-2.5 rounded-lg bg-[#090c10] border border-[#21262d]">
            <span class="text-gray-400 block text-[10px]">Sell Offers</span>
            <span class="text-white font-bold text-sm">${(q.sellOrders || 0).toLocaleString()}</span>
          </div>
        </div>

        <!-- Order Books: Buy Orders vs Sell Offers -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <!-- Buy Orders (Offers to buy) -->
          <div class="p-4 rounded-xl bg-[#090c10] border border-[#21262d] space-y-2">
            <h5 class="text-emerald-400 font-bold uppercase text-[11px]">Top Buy Orders (Bids)</h5>
            <div class="space-y-1">
              ${(p.buy_summary || []).slice(0, 10).map(o => `
                <div class="flex justify-between py-1 border-b border-[#161b22]">
                  <span class="text-gray-400">${o.amount.toLocaleString()}x</span>
                  <span class="text-white font-bold">${formatNum(o.pricePerUnit)}</span>
                  <span class="text-gray-500">${o.orders} orders</span>
                </div>
              `).join('') || '<span class="text-gray-500">No active buy orders</span>'}
            </div>
          </div>

          <!-- Sell Offers -->
          <div class="p-4 rounded-xl bg-[#090c10] border border-[#21262d] space-y-2">
            <h5 class="text-amber-400 font-bold uppercase text-[11px]">Top Sell Offers (Asks)</h5>
            <div class="space-y-1">
              ${(p.sell_summary || []).slice(0, 10).map(o => `
                <div class="flex justify-between py-1 border-b border-[#161b22]">
                  <span class="text-gray-400">${o.amount.toLocaleString()}x</span>
                  <span class="text-white font-bold">${formatNum(o.pricePerUnit)}</span>
                  <span class="text-gray-500">${o.orders} offers</span>
                </div>
              `).join('') || '<span class="text-gray-500">No active sell offers</span>'}
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    content.innerHTML = `<div class="text-red-400 text-sm">Failed to load order book: ${err.message}</div>`;
  }
}

function closeBazaarModal() {
  const modal = document.getElementById('bazaar-modal');
  if (modal) modal.classList.add('hidden');
}

// ACTIVE AUCTIONS MODULE
async function loadAuctions(page = 0) {
  showLoader('Fetching Active Auctions Feed...');
  auctionCurrentPage = page;
  try {
    const bin = document.getElementById('auction-bin-toggle')?.checked ? 'true' : '';
    const category = document.getElementById('auction-category-select')?.value || 'all';
    const tier = document.getElementById('auction-tier-select')?.value || 'all';
    const sort = document.getElementById('auction-sort-select')?.value || 'ending_soon';
    const query = document.getElementById('auction-search-input')?.value || '';

    const url = `/api/auctions?page=${page}&bin=${bin}&category=${category}&tier=${tier}&sort=${sort}&query=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const data = await res.json();

    const pageInfo = document.getElementById('auction-page-info');
    if (pageInfo) pageInfo.textContent = `Page ${data.page + 1} of ${data.totalPages} (${data.totalAuctions.toLocaleString()} total listings)`;

    const grid = document.getElementById('auctions-grid');
    if (!grid) return;

    if (!data.auctions || data.auctions.length === 0) {
      grid.innerHTML = '<div class="col-span-full text-center p-8 text-gray-400">No active auctions match your filters.</div>';
      return;
    }

    grid.innerHTML = data.auctions.map(a => {
      const timeLeft = Math.max(0, a.end - Date.now());
      const minsLeft = Math.floor(timeLeft / 60000);
      const hoursLeft = Math.floor(minsLeft / 60);

      let timeStr = `${minsLeft}m`;
      if (hoursLeft > 0) timeStr = `${hoursLeft}h ${minsLeft % 60}m`;

      return `
        <div class="glass-panel rounded-xl p-4 border border-[#30363d] space-y-3 relative flex flex-col justify-between" style="border-color: ${getRarityColor(a.tier)}40">
          <div>
            <div class="flex items-start justify-between gap-2">
              <h4 class="font-bold text-sm text-white line-clamp-1">${a.formattedName || a.itemName}</h4>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${a.bin ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300'}">
                ${a.bin ? 'BIN' : 'AUCTION'}
              </span>
            </div>
            <span class="text-[10px] uppercase font-bold tracking-wider" style="color: ${getRarityColor(a.tier)}">${a.tier}</span>
          </div>

          <!-- Price & Timer -->
          <div class="pt-2 border-t border-[#21262d] flex items-center justify-between font-mono text-xs">
            <div>
              <span class="text-gray-400 text-[10px] block">${a.bin ? 'Buy Price' : 'Current Bid'}</span>
              <span class="text-amber-400 font-bold">${a.formattedPrice}</span>
            </div>
            <div class="text-right">
              <span class="text-gray-400 text-[10px] block">Ends in</span>
              <span class="text-white font-bold">${timeStr}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Failed to load auctions:', err);
  } finally {
    hideLoader();
  }
}

function changeAuctionPage(delta) {
  const next = Math.max(0, auctionCurrentPage + delta);
  loadAuctions(next);
}

// ENDED AUCTIONS (60s Stream)
async function loadEndedAuctions() {
  showLoader('Fetching completed auctions stream...');
  try {
    const res = await fetch('/api/auctions/ended');
    const data = await res.json();
    const grid = document.getElementById('ended-auctions-grid');
    if (!grid) return;

    if (!data.auctions || data.auctions.length === 0) {
      grid.innerHTML = '<div class="col-span-full text-center p-8 text-gray-400">No auctions ended in the last 60 seconds.</div>';
      return;
    }

    grid.innerHTML = data.auctions.map(a => {
      const item = a.item;
      const itemName = item?.formattedName || 'Unknown Item';
      const rarity = item?.rarity || 'COMMON';

      return `
        <div class="glass-panel rounded-xl p-4 border border-[#30363d] space-y-2 font-mono">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-sm text-white truncate max-w-[200px]">${itemName}</h4>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${a.bin ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-300'}">
              ${a.bin ? 'BIN SOLD' : 'AUCTION WON'}
            </span>
          </div>
          <div class="flex justify-between items-center text-xs pt-1">
            <span class="text-gray-400">Sold Price:</span>
            <span class="text-amber-400 font-bold text-sm">${a.formattedPrice}</span>
          </div>
          <div class="text-[10px] text-gray-500 truncate">
            Buyer: <span class="text-gray-400">${a.buyer}</span>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Failed to load ended auctions:', err);
  } finally {
    hideLoader();
  }
}

// MAYOR & ELECTIONS MODULE
async function loadElection() {
  showLoader('Loading Mayor and Live Election stats...');
  try {
    const res = await fetch('/api/election');
    const data = await res.json();
    const content = document.getElementById('election-content');
    if (!content) return;

    const mayor = data.mayor || {};
    const election = data.currentElection || {};

    content.innerHTML = `
      <!-- Active Mayor Card -->
      <div class="glass-panel rounded-2xl p-6 border border-[#30363d] space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center font-bold text-xs font-mono text-purple-400">
              MAYOR
            </div>
            <div>
              <span class="text-xs uppercase font-bold text-purple-400 tracking-wider">Current Serving Mayor</span>
              <h2 class="text-2xl font-black text-white">${mayor.name || 'Unknown'}</h2>
              ${mayor.minister ? `<span class="text-xs text-gray-400">Minister: <strong class="text-cyan-400 font-semibold">${mayor.minister.name}</strong></span>` : ''}
            </div>
          </div>
        </div>

        <!-- Mayor Active Perks -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          ${(mayor.perks || []).map(perk => `
            <div class="p-3.5 rounded-xl bg-[#090c10] border border-[#21262d] space-y-1">
              <h5 class="text-xs font-bold text-amber-400">${perk.name}</h5>
              <p class="text-[11px] text-gray-400">${perk.description}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Live Election Voting Booth -->
      ${data.electionActive ? `
        <div class="glass-panel rounded-2xl p-6 border border-[#30363d] space-y-5">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-xs uppercase font-bold text-emerald-400 tracking-wider">Ongoing Mayoral Election</span>
              <h3 class="text-xl font-black text-white mt-0.5">Live Candidate Voting Polls (Year ${election.year})</h3>
            </div>
            <div class="text-right font-mono">
              <span class="text-xs text-gray-400 block">Total Votes Cast</span>
              <span class="text-lg font-bold text-emerald-400">${election.formattedTotalVotes}</span>
            </div>
          </div>

          <!-- Candidates Bars -->
          <div class="space-y-4 font-mono">
            ${(election.candidates || []).map((c, i) => `
              <div class="p-4 rounded-xl bg-[#090c10] border border-[#21262d] space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full ${i === 0 ? 'bg-amber-400 text-black' : 'bg-gray-800 text-white'} flex items-center justify-center font-bold text-[10px]">
                      #${i + 1}
                    </span>
                    <strong class="text-sm text-white">${c.name}</strong>
                  </div>
                  <div class="text-right">
                    <span class="font-bold text-amber-400">${c.formattedVotes} votes</span>
                    <span class="text-gray-400 ml-2">(${c.percentage}%)</span>
                  </div>
                </div>

                <div class="w-full bg-[#161b22] h-2.5 rounded-full overflow-hidden">
                  <div class="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-500" style="width: ${c.percentage}%"></div>
                </div>

                <!-- Proposed perks preview -->
                <div class="flex flex-wrap gap-2 pt-1">
                  ${(c.perks || []).map(p => `
                    <span class="text-[10px] px-2 py-0.5 rounded bg-[#161b22] text-gray-300 border border-[#21262d] font-sans">
                      ${p.name}
                    </span>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : '<div class="glass-panel p-6 rounded-2xl text-xs text-gray-400">No mayoral election is actively voting right now.</div>'}
    `;
  } catch (err) {
    console.error('Failed to load election:', err);
  } finally {
    hideLoader();
  }
}

// FIRE SALES MODULE
async function loadFiresales() {
  showLoader('Checking Fire Sales...');
  try {
    const res = await fetch('/api/firesales');
    const data = await res.json();
    const content = document.getElementById('firesales-content');
    if (!content) return;

    const sales = data.sales || [];
    if (sales.length === 0) {
      content.innerHTML = `
        <div class="glass-panel rounded-2xl p-8 border border-[#30363d] text-center space-y-3">
          <div class="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-xs font-mono mx-auto">
            SALES
          </div>
          <h3 class="text-lg font-black text-white">No Fire Sales Currently Active</h3>
          <p class="text-xs text-gray-400 max-w-md mx-auto">
            Hypixel schedules limited-edition cosmetic fire sales periodically. Check back soon or monitor forum announcements!
          </p>
        </div>
      `;
      return;
    }

    content.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${sales.map(s => `
          <div class="glass-panel rounded-xl p-5 border border-[#30363d] space-y-3 font-mono">
            <h4 class="font-bold text-sm text-white">${s.item_id}</h4>
            <div class="flex justify-between text-xs">
              <span class="text-gray-400">Price:</span>
              <span class="text-amber-400 font-bold">${s.price} Gems</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-gray-400">Sold:</span>
              <span class="text-white">${s.amount_sold} / ${s.total_units}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    console.error('Failed to load fire sales:', err);
  } finally {
    hideLoader();
  }
}

// BINGO HUB
async function loadBingo() {
  showLoader('Loading Bingo goals and challenges...');
  try {
    const uuid = currentPlayerData?.player?.uuid || '';
    const res = await fetch(`/api/bingo?uuid=${uuid}`);
    const data = await res.json();
    const content = document.getElementById('bingo-content');
    if (!content) return;

    const ev = data.event || {};
    const goals = ev.goals || [];

    content.innerHTML = `
      <div class="glass-panel rounded-2xl p-6 border border-[#30363d] space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-xs uppercase font-bold text-emerald-400 tracking-wider">Active Event</span>
            <h2 class="text-xl font-black text-white mt-1">${ev.name || 'SkyBlock Bingo'}</h2>
            <p class="text-xs text-gray-400 mt-1">${ev.modifier ? `Modifier: ${ev.modifier}` : '5x5 Bingo Board Challenges'}</p>
          </div>
        </div>

        <!-- 5x5 Bingo Board -->
        <div class="grid grid-cols-5 gap-3 pt-3">
          ${goals.map((g, idx) => `
            <div class="p-3 rounded-xl bg-[#090c10] border border-[#21262d] flex flex-col justify-between space-y-2 hover:border-emerald-500/50 transition">
              <div>
                <span class="text-[10px] text-gray-500 font-mono block">#${idx + 1}</span>
                <h5 class="text-xs font-bold text-white line-clamp-2">${g.name}</h5>
                <p class="text-[10px] text-gray-400 line-clamp-2 mt-1">${g.lore || ''}</p>
              </div>
              <div class="pt-2 border-t border-[#161b22] font-mono text-[10px]">
                <span class="text-emerald-400 font-bold">${formatNum(g.progress || 0)}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch (err) {
    console.error('Failed to load bingo:', err);
  } finally {
    hideLoader();
  }
}

// NEWS & PATCH NOTES
async function loadNews() {
  showLoader('Fetching SkyBlock patch notes...');
  try {
    const res = await fetch('/api/news');
    const data = await res.json();
    const content = document.getElementById('news-content');
    if (!content) return;

    content.innerHTML = `
      <div class="glass-panel rounded-2xl p-6 border border-[#30363d] space-y-4">
        <h2 class="text-xl font-black text-white flex items-center gap-2">
          <i data-lucide="newspaper" class="w-6 h-6 text-blue-400"></i> SkyBlock Update Threads & Patch Notes
        </h2>
        <div class="space-y-3 pt-2">
          ${(data.items || []).map(item => `
            <a href="${item.link}" target="_blank" rel="noopener noreferrer"
               class="p-4 rounded-xl bg-[#090c10] border border-[#21262d] hover:border-blue-400/50 flex items-center justify-between transition group block">
              <div>
                <h4 class="font-bold text-sm text-white group-hover:text-blue-400 transition">${item.title}</h4>
                <span class="text-xs text-gray-500 font-mono">${item.text}</span>
              </div>
              <span class="text-xs text-blue-400 flex items-center gap-1 font-semibold">
                Read Thread
              </span>
            </a>
          `).join('')}
        </div>
      </div>
    `;
  } catch (err) {
    console.error('Failed to load news:', err);
  } finally {
    hideLoader();
  }
}

// THE ROYAL MUSEUM
async function loadMuseum(force = false) {
  const coinsEl = document.getElementById('museum-val-coins');
  const countEl = document.getElementById('museum-total-items');
  const noteEl = document.getElementById('museum-appraisal-note');
  const grid = document.getElementById('museum-items-grid');
  if (!grid) return;

  if (!currentPlayerData || !currentPlayerData.selectedProfile?.profileId) {
    grid.innerHTML = `
      <div class="col-span-full text-center p-12 glass-panel rounded-xl border border-[#30363d] space-y-3">
        <h3 class="text-base font-bold text-white">No Player Profile Selected</h3>
        <p class="text-xs text-gray-400">Search for a Minecraft username or select a profile to view their Royal Museum collection.</p>
        <button onclick="showPromptCard()" class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg transition">
          Lookup Player
        </button>
      </div>
    `;
    if (coinsEl) coinsEl.textContent = '0 Coins';
    if (countEl) countEl.textContent = '0';
    return;
  }

  const profileId = currentPlayerData.selectedProfile.profileId;
  const uuid = currentPlayerData.player.uuid;

  if (currentMuseumData && currentMuseumData._profileId === profileId && !force) {
    filterMuseumGrid();
    return;
  }

  grid.innerHTML = `
    <div class="col-span-full text-center p-12 text-gray-400 space-y-2">
      <div class="inline-block w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      <p class="text-xs">Accessing Royal Museum archives for ${currentPlayerData.player.username}...</p>
    </div>
  `;

  try {
    const res = await fetch(`/api/museum?profile=${profileId}&uuid=${uuid}`);
    const data = await res.json();

    if (!data.success || !data.museum) {
      grid.innerHTML = `
        <div class="col-span-full text-center p-12 glass-panel rounded-xl border border-[#30363d] space-y-2">
          <h3 class="text-base font-bold text-white">No Museum Records Found</h3>
          <p class="text-xs text-gray-400">This profile has not donated any items to the Royal Museum yet, or museum data is private.</p>
        </div>
      `;
      if (coinsEl) coinsEl.textContent = '0 Coins';
      if (countEl) countEl.textContent = '0';
      return;
    }

    currentMuseumData = data.museum;
    currentMuseumData._profileId = profileId;

    if (coinsEl) {
      coinsEl.textContent = `${formatNum(currentMuseumData.value || 0)} Coins`;
      coinsEl.title = `${(currentMuseumData.value || 0).toLocaleString()} Coins`;
    }
    if (countEl) {
      countEl.textContent = (currentMuseumData.totalItemsCount || 0).toLocaleString();
    }
    if (noteEl) {
      if (currentMuseumData.appraisal) {
        noteEl.innerHTML = `<span class="text-emerald-400">Official appraisal by Madame Eleanor Q. Goldsworth - Valuation verified (${formatNum(currentMuseumData.value || 0)} Coins)</span>`;
      } else {
        noteEl.innerHTML = `<span class="text-amber-400">Unappraised by Madame Eleanor Q. Goldsworth - Items recorded, appraisal valuation pending</span>`;
      }
    }

    filterMuseumGrid();
  } catch (err) {
    console.error('Failed to load museum data:', err);
    grid.innerHTML = `
      <div class="col-span-full text-center p-12 glass-panel rounded-xl border border-red-500/30 space-y-2">
        <h3 class="text-base font-bold text-red-400">Museum Data Unavailable</h3>
        <p class="text-xs text-gray-400">${err.message}</p>
      </div>
    `;
  }
}

function switchMuseumCategory(cat) {
  currentMuseumCategory = cat;
  ['all', 'weaponsArmor', 'special'].forEach(c => {
    const btn = document.getElementById(c === 'all' ? 'mus-btn-all' : c === 'weaponsArmor' ? 'mus-btn-weapons' : 'mus-btn-special');
    if (!btn) return;
    if (c === cat) {
      btn.className = 'px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 transition';
    } else {
      btn.className = 'px-3 py-1.5 rounded-lg bg-[#161b22] text-gray-400 font-bold border border-[#30363d] transition hover:text-white';
    }
  });
  filterMuseumGrid();
}

function filterMuseumGrid() {
  const grid = document.getElementById('museum-items-grid');
  if (!grid || !currentMuseumData) return;

  const searchQuery = (document.getElementById('mus-search-input')?.value || '').trim().toLowerCase();
  const tierFilter = document.getElementById('mus-tier-select')?.value || 'all';

  let items = [];
  if (currentMuseumCategory === 'all') {
    items = [
      ...(currentMuseumData.weaponsArmor || []).map(x => ({ ...x, category: 'Weapons & Armor' })),
      ...(currentMuseumData.specialItems || []).map(x => ({ ...x, category: 'Special Artifacts' }))
    ];
  } else if (currentMuseumCategory === 'weaponsArmor') {
    items = (currentMuseumData.weaponsArmor || []).map(x => ({ ...x, category: 'Weapons & Armor' }));
  } else if (currentMuseumCategory === 'special') {
    items = (currentMuseumData.specialItems || []).map(x => ({ ...x, category: 'Special Artifacts' }));
  }

  // Filter items
  const filtered = items.filter(entry => {
    const item = entry.item;
    if (!item) return false;

    // Rarity filter
    if (tierFilter !== 'all') {
      const itemTier = (item.rarity || '').toUpperCase();
      if (itemTier !== tierFilter) return false;
    }

    // Search query filter
    if (searchQuery) {
      const name = (item.cleanName || '').toLowerCase();
      const id = (entry.id || item.id || '').toLowerCase();
      const lore = (item.loreHtml || []).join(' ').toLowerCase();
      if (!name.includes(searchQuery) && !id.includes(searchQuery) && !lore.includes(searchQuery)) {
        return false;
      }
    }

    return true;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center p-12 glass-panel rounded-xl border border-[#30363d] space-y-2">
        <h4 class="text-sm font-bold text-white">No Matching Donated Items</h4>
        <p class="text-xs text-gray-400">Try adjusting your search query or rarity filter.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(entry => {
    const item = entry.item;
    const rarityColor = item.rarityColor || getRarityColor(item.rarity);
    const serialized = encodeURIComponent(JSON.stringify(item));
    const donatedDate = entry.donatedTime ? new Date(entry.donatedTime).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : null;
    let textureUrl = null;
    if (item.headTexture) {
      textureUrl = `https://textures.minecraft.net/texture/${item.headTexture}`;
    } else if (item.skullTexture) {
      try {
        const parsed = JSON.parse(atob(item.skullTexture));
        const u = parsed?.textures?.SKIN?.url;
        if (u) textureUrl = u.replace('http://', 'https://');
      } catch {}
    }

    return `
      <div class="glass-panel rounded-xl p-4 border border-[#30363d] hover:border-amber-400/50 transition flex flex-col justify-between space-y-3" style="border-left: 3px solid ${rarityColor};">
        <div class="flex items-start gap-3">
          <div class="mc-slot w-10 h-10 shrink-0 bg-[#090c10] border border-[#30363d] rounded-lg flex items-center justify-center cursor-pointer relative" data-item="${serialized}">
            ${textureUrl ? `
              <img src="${textureUrl}" class="w-8 h-8 object-contain pointer-events-none" alt="" />
            ` : `
              <span class="text-xs font-black font-mono" style="color: ${rarityColor}">${(item.cleanName || '?').charAt(0)}</span>
            `}
            ${item.count && item.count > 1 ? `<span class="absolute bottom-0.5 right-1 text-[10px] font-mono font-bold text-white pointer-events-none">${item.count}</span>` : ''}
          </div>

          <div class="flex-1 min-w-0">
            <h4 class="font-bold text-sm truncate" style="color: ${rarityColor}">${item.formattedName || item.cleanName}</h4>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/40" style="color: ${rarityColor}">${item.rarity || 'COMMON'}</span>
              ${item.starsDisplay ? `<span class="text-[11px] font-bold text-amber-400">${item.starsDisplay}</span>` : ''}
            </div>
          </div>
        </div>

        <div class="pt-2 border-t border-[#21262d] flex items-center justify-between text-[11px] text-gray-400 font-mono">
          <span class="truncate text-gray-500">${entry.category}</span>
          ${entry.borrowing ? `<span class="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">Borrowing</span>` : ''}
          ${donatedDate ? `<span class="text-gray-500 text-[10px]">${donatedDate}</span>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// MINECRAFT TOOLTIP INTERACTION
function setupTooltipListener() {
  const tooltip = document.getElementById('mc-tooltip');
  if (!tooltip) return;

  document.addEventListener('mouseover', e => {
    const slot = e.target.closest('.mc-slot[data-item]');
    if (slot) {
      try {
        const raw = slot.getAttribute('data-item');
        if (!raw) return;
        const item = JSON.parse(decodeURIComponent(raw));
        if (item.empty) return;

        let content = `<div class="font-bold text-base mb-1">${item.formattedName || item.cleanName}</div>`;

        if (item.starsDisplay) {
          content += `<div class="text-amber-400 text-xs mb-1 font-bold">${item.starsDisplay}</div>`;
        }

        if (item.loreHtml && item.loreHtml.length > 0) {
          content += `<div class="text-xs space-y-0.5">${item.loreHtml.join('<br>')}</div>`;
        }

        tooltip.innerHTML = content;
        tooltip.style.display = 'block';
        positionTooltip(e, tooltip);
      } catch (err) {
        console.error(err);
      }
    }
  });

  document.addEventListener('mousemove', e => {
    if (tooltip.style.display === 'block') {
      positionTooltip(e, tooltip);
    }
  });

  document.addEventListener('mouseout', e => {
    const slot = e.target.closest('.mc-slot[data-item]');
    if (slot) {
      tooltip.style.display = 'none';
    }
  });
}

function positionTooltip(e, tooltip) {
  const offset = 16;
  let x = e.clientX + offset;
  let y = e.clientY + offset;

  const tooltipWidth = tooltip.offsetWidth;
  const tooltipHeight = tooltip.offsetHeight;

  if (x + tooltipWidth > window.innerWidth - 10) {
    x = e.clientX - tooltipWidth - offset;
  }
  if (y + tooltipHeight > window.innerHeight - 10) {
    y = e.clientY - tooltipHeight - offset;
  }

  tooltip.style.left = `${Math.max(10, x)}px`;
  tooltip.style.top = `${Math.max(10, y)}px`;
}

// Helpers
function formatNum(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  const abs = Math.abs(num);
  if (abs >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (abs >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (abs >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toLocaleString('en-US', { maximumFractionDigits: 1 });
}

function getRarityColor(tier) {
  const map = {
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
  return map[tier] || '#AAAAAA';
}
