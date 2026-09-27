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

  // Build the authentic 54-slot SkyBlock Menu matching the exact in-game screenshot:
  // 18 interactive buttons + 36 gray stained glass panes
  const menuSlots = useMemo(() => {
    const slots = new Array(54).fill(null);

    // Decorative gray stained glass pane default for all 54 slots
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

    const statSpeed = misc.speed || 351;
    const statStrength = misc.strength || 372.75;
    const statDefense = misc.defense || 823.43;
    const statCritDamage = misc.critDamage || 146;
    const statCritChance = misc.critChance || 81;
    const statHealth = misc.health || '3,577.32';
    const statIntel = misc.intelligence || '3,822.77';
    const skillAvg = skills.skillAverage || '38.2';

    // 1. Slot 13 (Row 1, Col 4): Stats & Equipment (Player Head)
    const avatar = player.avatarUrl || '/textures/minecraft/stats_and_equipment.png';
    slots[13] = {
      id: 'profile',
      name: 'Stats & Equipment',
      icon: avatar,
      targetScreen: 'profile',
      rawItem: {
        cleanName: 'Stats & Equipment',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Stats & Equipment</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View your equipment, stats,</span>',
          '<span style="color: #AAAAAA">achievements, and more!</span>',
          '',
          `<span style="color: #FFFFFF">✦ Speed ${statSpeed}</span>`,
          `<span style="color: #FF5555">❁ Strength ${statStrength}</span>`,
          `<span style="color: #55FF55">❈ Defense ${statDefense}</span>`,
          `<span style="color: #5555FF">☠ Crit Damage ${statCritDamage}%</span>`,
          `<span style="color: #5555FF">⚡ Crit Chance ${statCritChance}%</span>`,
          `<span style="color: #FF5555">❤ Health ${statHealth}</span>`,
          `<span style="color: #55FFFF">✎ Intelligence ${statIntel}</span>`,
          '<span style="color: #AAAAAA">and more...</span>',
          '',
          '<span style="color: #555555">Also accessible via /stats</span>',
          '',
          '<span style="color: #FFFF55">Click to view!</span>',
        ],
      },
    };

    // 2. Slot 19 (Row 2, Col 1): Your Skills (Diamond Sword)
    slots[19] = {
      id: 'skills',
      name: 'Your Skills',
      icon: '/textures/minecraft/skills.png',
      targetScreen: 'skills',
      rawItem: {
        cleanName: 'Your Skills',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Your Skills</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View your Skill progression and</span>',
          '<span style="color: #AAAAAA">rewards.</span>',
          '',
          `<span style="color: #FFAA00; font-weight: bold">${skillAvg} Skill Avg.</span><span style="color: #AAAAAA"> (non-cosmetic)</span>`,
          '',
          '<span style="color: #555555">Also accessible via /skills.</span>',
          '',
          '<span style="color: #FFFF55">Click to view!</span>',
        ],
      },
    };

    // 3. Slot 20 (Row 2, Col 2): Collections (Painting)
    slots[20] = {
      id: 'collections',
      name: 'Collections',
      icon: '/textures/minecraft/collections.png',
      targetScreen: 'collection',
      rawItem: {
        cleanName: 'Collections',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Collections</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View all of the items available in</span>',
          '<span style="color: #AAAAAA">SkyBlock. Collect more of an item to</span>',
          '<span style="color: #AAAAAA">unlock rewards on your way to</span>',
          '<span style="color: #AAAAAA">becoming a master of SkyBlock!</span>',
          '',
          '<span style="color: #AAAAAA">Collections Unlocked: </span><span style="color: #FFAA00; font-weight: bold">87.8%</span>',
          '<span style="color: #55FF55">▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬</span><span style="color: #FFFFFF">─────</span><span style="color: #FFAA00; font-weight: bold"> 79/90</span>',
          '',
          '<span style="color: #555555">Also accessible via /collection.</span>',
          '',
          '<span style="color: #FFFF55">Click to view!</span>',
        ],
      },
    };

    // 4. Slot 21 (Row 2, Col 3): Recipe Book (Book)
    slots[21] = {
      id: 'recipe_book',
      name: 'Recipe Book',
      icon: '/textures/minecraft/recipe_book.png',
      targetScreen: 'recipes',
      rawItem: {
        cleanName: 'Recipe Book',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Recipe Book</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Through your adventure, you will</span>',
          '<span style="color: #AAAAAA">unlock recipes for all kinds of</span>',
          '<span style="color: #AAAAAA">special items! You can view how to</span>',
          '<span style="color: #AAAAAA">craft these items here.</span>',
          '',
          '<span style="color: #AAAAAA">Recipes Unlocked: </span><span style="color: #FFAA00; font-weight: bold">73.3%</span>',
          '<span style="color: #55FF55">▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬</span><span style="color: #FFFFFF">───────</span><span style="color: #FFAA00; font-weight: bold"> 745/1k</span>',
          '',
          '<span style="color: #555555">Also accessible via /recipes.</span>',
          '',
          '<span style="color: #FFFF55">Click to view!</span>',
        ],
      },
    };

    // 5. Slot 22 (Row 2, Col 4): SkyBlock Leveling (Green Head)
    const sbLevel = misc.skyblockLevel || 205;
    slots[22] = {
      id: 'levels',
      name: 'SkyBlock Leveling',
      icon: '/textures/minecraft/skyblock_leveling.png',
      targetScreen: 'levels',
      rawItem: {
        cleanName: 'SkyBlock Leveling',
        formattedName: '<span style="color: #55FF55; font-weight: bold">SkyBlock Leveling</span>',
        loreHtml: [
          `<span style="color: #FFFFFF">Your SkyBlock Level: </span><span style="color: #55FFFF">[${sbLevel}]</span>`,
          '',
          '<span style="color: #AAAAAA">Determine how far you\'ve</span>',
          '<span style="color: #AAAAAA">progressed in SkyBlock and earn</span>',
          '<span style="color: #AAAAAA">rewards from completing unique</span>',
          '<span style="color: #AAAAAA">tasks.</span>',
          '',
          `<span style="color: #FFFFFF">Progress to Level ${sbLevel + 1}:</span>`,
          '<span style="color: #55FFFF">▬▬▬▬</span><span style="color: #FFFFFF">▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬</span><span style="color: #55FFFF"> 9/100 XP</span>',
          '',
          '<span style="color: #555555">Also accessible via /levels</span>',
          '',
          '<span style="color: #FFFF55">Click to view!</span>',
        ],
      },
    };

    // 6. Slot 23 (Row 2, Col 5): Quests & Chapters (Book and Quill)
    slots[23] = {
      id: 'quests',
      name: 'Quests & Chapters',
      icon: '/textures/minecraft/quests_and_chapters.png',
      targetScreen: 'quests',
      rawItem: {
        cleanName: 'Quests & Chapters',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Quests & Chapters</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Each island has its own series of</span>',
          '<span style="color: #55FFFF">Chapters</span><span style="color: #AAAAAA"> for you to complete!</span>',
          '',
          '<span style="color: #AAAAAA">Complete tasks within a Chapter to</span>',
          '<span style="color: #AAAAAA">earn small </span><span style="color: #FFAA00">rewards</span><span style="color: #AAAAAA">, or complete</span>',
          '<span style="color: #AAAAAA">entire Chapters to earn big ones!</span>',
          '',
          '<span style="color: #AAAAAA">Some islands also have </span><span style="color: #55FF55">Quests</span><span style="color: #AAAAAA"> for</span>',
          '<span style="color: #AAAAAA">you to complete! Some items can only</span>',
          '<span style="color: #AAAAAA">be obtained through Quests.</span>',
          '',
          '<span style="color: #FFFF55">Click to view!</span>',
        ],
      },
    };

    // 7. Slot 24 (Row 2, Col 6): Calendar and Events (Clock)
    slots[24] = {
      id: 'calendar',
      name: 'Calendar and Events',
      icon: '/textures/minecraft/calendar.png',
      targetScreen: 'calendar',
      rawItem: {
        cleanName: 'Calendar and Events',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Calendar and Events</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View the SkyBlock Calendar, upcoming</span>',
          '<span style="color: #AAAAAA">events, and event rewards!</span>',
          '',
          '<span style="color: #AAAAAA">Date: </span><span style="color: #55FF55">17th Early Winter 516</span>',
          '',
          '<span style="color: #AAAAAA">Active Event: </span><span style="color: #FFAA00">Jacob\'s Farming Contest</span>',
          '<span style="color: #FFFF55">o Mushroom</span>',
          '<span style="color: #FFFF55">o Moonflower</span>',
          '<span style="color: #FFFF55">o Cactus</span>',
          '<span style="color: #AAAAAA">Ends in: </span><span style="color: #FFFF55">18m 7s</span>',
          '',
          '<span style="color: #AAAAAA">Next Event: </span><span style="color: #FF5555">484th Season of Jerry</span>',
          '<span style="color: #AAAAAA">Starting in: </span><span style="color: #FFFF55">22h 58m 8s</span>',
          '',
          '<span style="color: #AAAAAA">You have </span><span style="color: #55FF55">1</span><span style="color: #AAAAAA"> unclaimed event reward!</span>',
          '',
          '<span style="color: #555555">Also accessible via /calendar</span>',
          '',
          '<span style="color: #FFFF55">Click to view!</span>',
        ],
      },
    };

    // 8. Slot 25 (Row 2, Col 7): Storage (Chest)
    slots[25] = {
      id: 'storage',
      name: 'Storage',
      icon: '/textures/minecraft/storage.png',
      targetScreen: 'storage',
      rawItem: {
        cleanName: 'Storage',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Storage</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Store global items that you want to</span>',
          '<span style="color: #AAAAAA">access at any time from anywhere</span>',
          '<span style="color: #AAAAAA">here.</span>',
          '',
          '<span style="color: #555555">Also accessible via /storage</span>',
          '',
          '<span style="color: #FFFF55">Click to view!</span>',
        ],
      },
    };

    // 9. Slot 29 (Row 3, Col 2): Your Bags (Sack Head with Red Button)
    slots[29] = {
      id: 'sacks',
      name: 'Your Bags',
      icon: '/textures/minecraft/your_bags.png',
      targetScreen: 'storage',
      storageTab: 'backpacks',
      rawItem: {
        cleanName: 'Your Bags',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Your Bags</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Different bags allow you to store</span>',
          '<span style="color: #AAAAAA">many different items inside!</span>',
          '',
          '<span style="color: #555555">Also accessible via /bags</span>',
          '',
          '<span style="color: #FFFF55">Click to open!</span>',
        ],
      },
    };

    // 10. Slot 30 (Row 3, Col 3): Pets (Bone)
    slots[30] = {
      id: 'pets',
      name: 'Pets',
      icon: '/textures/minecraft/pets.png',
      targetScreen: 'pets',
      rawItem: {
        cleanName: 'Pets',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Pets</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View and manage all of your Pets.</span>',
          '',
          '<span style="color: #AAAAAA">Level up your pets faster by gaining</span>',
          '<span style="color: #AAAAAA">XP in their favorite skill!</span>',
          '',
          `<span style="color: #AAAAAA">Selected pet: </span><span style="color: #FFAA00">${activePet ? activePet.cleanName : 'Sheep'}</span>`,
          '',
          `<span style="color: #AAAAAA">Progress to Level ${activePet ? (activePet.level || 92) + 1 : 93}: </span><span style="color: #FFAA00">24.1%</span>`,
          '<span style="color: #55FF55">▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬</span><span style="color: #FFFFFF">──────────────────</span><span style="color: #FFAA00"> 265,788.6/1.1M</span>',
          '',
          '<span style="color: #555555">Also accessible via /pets.</span>',
          '',
          '<span style="color: #FFFF55">Click to view!</span>',
        ],
      },
    };

    // 11. Slot 31 (Row 3, Col 4): Crafting Table (Crafting Table)
    slots[31] = {
      id: 'crafting',
      name: 'Crafting Table',
      icon: '/textures/minecraft/crafting.png',
      targetScreen: 'crafting',
      rawItem: {
        cleanName: 'Crafting Table',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Crafting Table</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Opens the crafting grid.</span>',
          '',
          '<span style="color: #555555">Also accessible via /craft</span>',
          '',
          '<span style="color: #FFFF55">Click to open!</span>',
        ],
      },
    };

    // 12. Slot 32 (Row 3, Col 5): Loadouts (Barrel)
    slots[32] = {
      id: 'wardrobe',
      name: 'Loadouts',
      icon: '/textures/minecraft/loadouts.png',
      targetScreen: 'wardrobe',
      rawItem: {
        cleanName: 'Loadouts',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Loadouts</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View and edit preset armor and</span>',
          '<span style="color: #AAAAAA">equipment sets with other settings to</span>',
          '<span style="color: #AAAAAA">make switching activities easy.</span>',
          '',
          '<span style="color: #555555">Also accessible via /loadouts</span>',
          '',
          '<span style="color: #FFFF55">Click to view!</span>',
        ],
      },
    };

    // 13. Slot 33 (Row 3, Col 6): Personal Bank (Coin Sack)
    slots[33] = {
      id: 'bank',
      name: 'Personal Bank',
      icon: '/textures/minecraft/personal_bank.png',
      targetScreen: 'bank',
      rawItem: {
        cleanName: 'Personal Bank',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Personal Bank</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Contact your Banker from anywhere.</span>',
          '<span style="color: #AAAAAA">Cooldown: </span><span style="color: #FFAA00">5 minutes</span>',
          '',
          '<span style="color: #AAAAAA">Banker Status:</span>',
          '<span style="color: #55FF55">Available</span>',
          '',
          '<span style="color: #AAAAAA">Interest in: </span><span style="color: #55FFFF">25 Hours</span>',
          '<span style="color: #AAAAAA">Projection: </span><span style="color: #FFAA00">41,791.6 coins </span><span style="color: #55FFFF">(2.08%)</span>',
          '<span style="color: #AAAAAA">Last Interest: </span><span style="color: #FFAA00">44,886 coins</span>',
          '',
          '<span style="color: #555555">Also accessible via /bank</span>',
          '',
          '<span style="color: #FFFF55">Click to open!</span>',
        ],
      },
    };

    // 14. Slot 47 (Row 5, Col 2): Fast Travel (Globe Head)
    slots[47] = {
      id: 'fast_travel',
      name: 'Fast Travel',
      icon: '/textures/minecraft/fast_travel.png',
      targetScreen: 'fast_travel',
      rawItem: {
        cleanName: 'Fast Travel',
        formattedName: '<span style="color: #55FFFF; font-weight: bold">Fast Travel</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Teleport to islands you\'ve already</span>',
          '<span style="color: #AAAAAA">visited.</span>',
          '',
          '<span style="color: #555555">Also accessible via /warp</span>',
          '',
          '<span style="color: #FFFF55">Click to pick location!</span>',
        ],
      },
    };

    // 15. Slot 48 (Row 5, Col 3): Profile Management (Name Tag)
    const profileCount = (profiles && profiles.length) || 2;
    slots[48] = {
      id: 'profile_management',
      name: 'Profile Management',
      icon: '/textures/minecraft/profile_management.png',
      targetScreen: 'profiles',
      rawItem: {
        cleanName: 'Profile Management',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Profile Management</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">You can have multiple SkyBlock</span>',
          '<span style="color: #AAAAAA">profiles at the same time.</span>',
          '',
          '<span style="color: #AAAAAA">Each profile has its own island,</span>',
          '<span style="color: #AAAAAA">inventory, quest log...</span>',
          '',
          `<span style="color: #AAAAAA">Profiles: </span><span style="color: #FFAA00">${profileCount}/3</span>`,
          `<span style="color: #AAAAAA">Playing on: </span><span style="color: #55FF55">${selectedProfile.cuteName || 'Banana'}</span>`,
          '',
          '<span style="color: #55FFFF">Play with friends using /coopadd &lt;name&gt;!</span>',
          '',
          '<span style="color: #555555">Also accessible via /profiles</span>',
          '',
          '<span style="color: #FFFF55">Click to view!</span>',
        ],
      },
    };

    // 16. Slot 49 (Row 5, Col 4): Close (Red Barrier)
    slots[49] = {
      id: 'close',
      name: 'Close',
      icon: '/textures/minecraft/close.png',
      action: 'close',
      rawItem: {
        cleanName: 'Close',
        formattedName: '<span style="color: #FF5555; font-weight: bold">Close</span>',
        loreHtml: [
          '<span style="color: #FFFF55">Click to close!</span>',
        ],
      },
    };

    // 17. Slot 50 (Row 5, Col 5): Settings (Redstone Torch)
    slots[50] = {
      id: 'settings',
      name: 'Settings',
      icon: '/textures/minecraft/settings.png',
      targetScreen: 'settings',
      rawItem: {
        cleanName: 'Settings',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Settings</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View and edit your SkyBlock settings.</span>',
          '',
          '<span style="color: #555555">Also accessible via /viewsettings.</span>',
          '',
          '<span style="color: #FFFF55">Click to view!</span>',
        ],
      },
    };

    // 18. Slot 51 (Row 5, Col 6): Booster Cookie (Enchanted Cookie)
    slots[51] = {
      id: 'cookie',
      name: 'Booster Cookie',
      icon: '/textures/minecraft/cookie.png',
      targetScreen: 'cookie',
      rawItem: {
        cleanName: 'Booster Cookie',
        formattedName: '<span style="color: #FFAA00; font-weight: bold">Booster Cookie</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Obtain the </span><span style="color: #FF55FF">Cookie Buff</span><span style="color: #AAAAAA"> from Booster</span>',
          '<span style="color: #AAAAAA">Cookies in the hub\'s Community Shop.</span>',
          '',
          '<span style="color: #AAAAAA">Status: </span><span style="color: #FF5555">Not active!</span>',
          '<span style="color: #AAAAAA">Bits Available: </span><span style="color: #55FFFF">0</span>',
          '',
          '<span style="color: #555555">Also accessible via /boostercookie</span>',
          '',
          '<span style="color: #FFFF55">Click to view!</span>',
        ],
      },
    };

    return slots;
  }, [player, selectedProfile, misc, skills, economy, activePet, pets]);

  const handleSlotClick = (slot) => {
    if (!slot || slot.type === 'glass') return;
    if (slot.action === 'close') {
      if (onClose) onClose();
      return;
    }
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
              // Slot 8 (the 9th slot): Permanent SkyBlock Menu Nether Star
              let item = hotbarItems[idx];
              if (idx === 8 || !item || item.empty) {
                if (idx === 8) {
                  item = {
                    cleanName: 'SkyBlock Menu',
                    formattedName: '<span style="color: #55FF55; font-weight: bold">SkyBlock Menu (Right Click)</span>',
                    icon: '/textures/minecraft/nether_star.png',
                    loreHtml: [
                      '<span style="color: #AAAAAA">Click to view your SkyBlock Menu!</span>'
                    ]
                  };
                }
              }

              const dataAttr = item && !item.empty ? encodeURIComponent(JSON.stringify(item)) : null;
              const tex = item && !item.empty ? (item.icon || getItemTexture(item)) : null;
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
        {/* SUB-SCREEN: STATS & EQUIPMENT */}
        {screen === 'profile' && (
          <div className="space-y-4">
            {renderScreenHeader('Stats & Equipment')}

            {/* Profile Info Header */}
            <div className="mc-inset-box rounded p-3 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={player.avatarUrl || '/textures/minecraft/stats_and_equipment.png'}
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
                    <span className="text-gray-300">Skill Avg: <strong className="text-emerald-400 font-mono">{skills.skillAverage || '38.2'}</strong></span>
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
                  <div className="p-2 rounded bg-[#1f242c]"><span className="text-red-400 block font-bold">❤ Health</span> {misc.health || '3,577.32'} HP</div>
                  <div className="p-2 rounded bg-[#1f242c]"><span className="text-emerald-400 block font-bold">❈ Defense</span> {misc.defense || '823.43'}</div>
                  <div className="p-2 rounded bg-[#1f242c]"><span className="text-red-500 block font-bold">❁ Strength</span> {misc.strength || '372.75'}</div>
                  <div className="p-2 rounded bg-[#1f242c]"><span className="text-white block font-bold">✦ Speed</span> {misc.speed || '351'}</div>
                  <div className="p-2 rounded bg-[#1f242c]"><span className="text-blue-400 block font-bold">☣ Crit Chance</span> {misc.critChance || '81%'}</div>
                  <div className="p-2 rounded bg-[#1f242c]"><span className="text-blue-500 block font-bold">☠ Crit Damage</span> {misc.critDamage || '146%'}</div>
                  <div className="p-2 rounded bg-[#1f242c]"><span className="text-cyan-400 block font-bold">✎ Intelligence</span> {misc.intelligence || '3,822.77'}</div>
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

        {/* SUB-SCREEN: SKYBLOCK LEVELING */}
        {screen === 'levels' && (
          <div className="space-y-4">
            {renderScreenHeader('SkyBlock Leveling')}
            <div className="mc-inset-box rounded p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 block uppercase font-bold">Current SkyBlock Level</span>
                  <h3 className="text-3xl font-black text-cyan-400 font-mono">[{misc.skyblockLevel || 205}]</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 block uppercase font-bold">Total SkyBlock XP</span>
                  <span className="text-base text-amber-400 font-mono font-bold">
                    {((misc.skyblockLevel || 205) * 100 + 9).toLocaleString()} XP
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-gray-300">
                  <span>Progress to Level {(misc.skyblockLevel || 205) + 1}</span>
                  <span className="text-cyan-400 font-bold">9 / 100 XP (9.0%)</span>
                </div>
                <div className="w-full bg-[#090c10] h-3 rounded-full overflow-hidden border border-[#21262d]">
                  <div className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full" style={{ width: '9%' }} />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-[#1a1f26] border border-[#2d333b]">
                  <span className="text-emerald-400 block font-bold text-sm">Skills</span>
                  <span className="text-gray-300">+4,250 XP</span>
                </div>
                <div className="p-2.5 rounded bg-[#1a1f26] border border-[#2d333b]">
                  <span className="text-amber-400 block font-bold text-sm">Collections</span>
                  <span className="text-gray-300">+2,820 XP</span>
                </div>
                <div className="p-2.5 rounded bg-[#1a1f26] border border-[#2d333b]">
                  <span className="text-purple-400 block font-bold text-sm">Slayers</span>
                  <span className="text-gray-300">+1,650 XP</span>
                </div>
                <div className="p-2.5 rounded bg-[#1a1f26] border border-[#2d333b]">
                  <span className="text-red-400 block font-bold text-sm">Dungeons</span>
                  <span className="text-gray-300">+3,100 XP</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB-SCREEN: SKILLS */}
        {screen === 'skills' && (
          <div className="space-y-4">
            {renderScreenHeader('Your Skills')}
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-bold text-gray-200">Non-Cosmetic Skill Average</span>
              <span className="text-base text-emerald-400 font-mono font-bold">{skills.skillAverage || '38.2'}</span>
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
                { name: 'Dirt (x16)', cost: '16 Coins', icon: '/textures/minecraft/stone.png' },
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
            {renderScreenHeader('Quests & Chapters')}
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
      </div>
    </div>
  );
}
