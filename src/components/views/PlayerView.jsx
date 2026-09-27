'use client';

import { useState, useMemo, useEffect } from 'react';
import ItemSlot from '@/components/ItemSlot';
import { getItemTexture, getSkullHash } from '@/lib/itemTextures';
import { formatCoins } from '@/lib/skyblockUtils';

function renderSlot(item, customClass = '') {
  return <ItemSlot item={item} customClass={customClass} />;
}

function toRoman(num) {
  if (!num || num <= 0) return '0';
  const lookup = [
    ['C', 100], ['XC', 90], ['L', 50], ['XL', 40],
    ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]
  ];
  let res = '';
  let n = Math.floor(num);
  for (const [letter, value] of lookup) {
    while (n >= value) {
      res += letter;
      n -= value;
    }
  }
  return res;
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

  // Build the authentic 54-slot Stats & Equipment container GUI matching in-game screenshot:
  const statsAndEquipmentSlots = useMemo(() => {
    const slots = Array.from({ length: 54 }, () => ({
      type: 'glass',
      name: ' ',
      icon: '/textures/minecraft/gray_stained_glass_pane.png',
      rawItem: { cleanName: ' ', rawName: ' ', loreHtml: [] },
    }));

    // Helpers for stat numbers
    const statHealth = misc.health || '3,577.32';
    const statDefense = misc.defense || '823.43';
    const statStrength = misc.strength || '372.75';
    const statSpeed = misc.speed || '351';
    const statCritChance = misc.critChance || '81%';
    const statCritDamage = misc.critDamage || '146%';
    const statIntel = misc.intelligence || '3,822.77';

    // 1. Slot 3 (Row 0, Col 3): Nether Star - Your Stats
    slots[3] = {
      id: 'your_stats',
      name: 'Your Stats',
      icon: '/textures/minecraft/nether_star.png',
      rawItem: {
        cleanName: 'Your Stats',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Your Stats</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View your overall SkyBlock profile</span>',
          '<span style="color: #AAAAAA">stats and combat prowess.</span>',
          '',
          `<span style="color: #FF5555">❤ Health: ${statHealth} HP</span>`,
          `<span style="color: #55FF55">❈ Defense: ${statDefense}</span>`,
          `<span style="color: #FF5555">❁ Strength: ${statStrength}</span>`,
          `<span style="color: #FFFFFF">✦ Speed: ${statSpeed}</span>`,
          `<span style="color: #5555FF">☣ Crit Chance: ${statCritChance}</span>`,
          `<span style="color: #5555FF">☠ Crit Damage: ${statCritDamage}</span>`,
          `<span style="color: #55FFFF">✎ Intelligence: ${statIntel}</span>`,
          '<span style="color: #FFAA00">⚔ Bonus Attack Speed: 45%</span>',
          '<span style="color: #FF55FF">๑ Ability Damage: 28%</span>',
          '<span style="color: #FFAA00">✯ Magic Find: 124</span>',
          '<span style="color: #55FF55">♣ Pet Luck: 68</span>',
          '<span style="color: #555555">🪓 True Defense: 15</span>',
          '<span style="color: #5555FF">☣ Sea Creature Chance: 32%</span>',
          '<span style="color: #FFAA00">☘ Ferocity: 12</span>',
        ],
      },
    };

    // Equipment Pieces (Col 1: slots 10, 19, 28, 37)
    // 0: Necklace, 1: Cloak, 2: Belt, 3: Gloves
    const eqList = inventories.equipment || [];
    const eqSlots = [10, 19, 28, 37];
    const eqPlaceholders = [
      { name: 'Necklace Slot', icon: '/textures/minecraft/equipment/molten_necklace.png' },
      { name: 'Cloak Slot', icon: '/textures/minecraft/equipment/molten_cloak.png' },
      { name: 'Belt Slot', icon: '/textures/minecraft/safari_belt.png' },
      { name: 'Gloves Slot', icon: '/textures/minecraft/equipment/gauntlet_of_contagion.png' },
    ];

    eqSlots.forEach((slotIdx, i) => {
      const eqItem = eqList[i];
      if (eqItem && !eqItem.empty) {
        slots[slotIdx] = {
          id: `equipment_${i}`,
          name: eqItem.cleanName,
          realItem: eqItem,
          icon: getItemTexture(eqItem),
          rawItem: eqItem,
        };
      } else {
        slots[slotIdx] = {
          id: `equipment_empty_${i}`,
          name: eqPlaceholders[i].name,
          icon: eqPlaceholders[i].icon,
          rawItem: {
            cleanName: eqPlaceholders[i].name,
            formattedName: `<span style="color: #FF5555; font-weight: bold">${eqPlaceholders[i].name}</span>`,
            loreHtml: ['<span style="color: #AAAAAA">Equip an item from your inventory.</span>'],
          },
        };
      }
    });

    // Armor Pieces (Col 2: slots 11, 20, 29, 38)
    // 0: Helmet, 1: Chestplate, 2: Leggings, 3: Boots
    const armorList = inventories.armor || [];
    const armorSlots = [11, 20, 29, 38];
    const armorPlaceholders = [
      { name: 'Helmet Slot', icon: '/textures/minecraft/diamond_helmet.png' },
      { name: 'Chestplate Slot', icon: '/textures/minecraft/leather_chestplate.png' },
      { name: 'Leggings Slot', icon: '/textures/minecraft/diamond_leggings.png' },
      { name: 'Boots Slot', icon: '/textures/minecraft/diamond_boots.png' },
    ];

    armorSlots.forEach((slotIdx, i) => {
      const armItem = armorList[i];
      if (armItem && !armItem.empty) {
        slots[slotIdx] = {
          id: `armor_${i}`,
          name: armItem.cleanName,
          realItem: armItem,
          icon: getItemTexture(armItem),
          rawItem: armItem,
        };
      } else {
        slots[slotIdx] = {
          id: `armor_empty_${i}`,
          name: armorPlaceholders[i].name,
          icon: armorPlaceholders[i].icon,
          rawItem: {
            cleanName: armorPlaceholders[i].name,
            formattedName: `<span style="color: #FF5555; font-weight: bold">${armorPlaceholders[i].name}</span>`,
            loreHtml: ['<span style="color: #AAAAAA">Equip armor from your inventory.</span>'],
          },
        };
      }
    });

    // Stat Category Icons (Right side)
    // Slot 14 (Row 1, Col 5): Combat Stats (Iron Sword)
    slots[14] = {
      id: 'combat_stats',
      name: 'Combat Stats',
      icon: '/textures/minecraft/iron_sword.png',
      rawItem: {
        cleanName: 'Combat Stats',
        formattedName: '<span style="color: #FF5555; font-weight: bold">Combat Stats</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Stats that increase your damage output</span>',
          '<span style="color: #AAAAAA">and effectiveness against mobs.</span>',
          '',
          `<span style="color: #FF5555">❁ Strength: ${statStrength}</span>`,
          `<span style="color: #5555FF">☣ Crit Chance: ${statCritChance}</span>`,
          `<span style="color: #5555FF">☠ Crit Damage: ${statCritDamage}</span>`,
          '<span style="color: #FFAA00">⚔ Bonus Attack Speed: 45%</span>',
          '<span style="color: #FF55FF">๑ Ability Damage: 28%</span>',
          '<span style="color: #FFAA00">☘ Ferocity: 12</span>',
        ],
      },
    };

    // Slot 15 (Row 1, Col 6): Mining Stats (Iron Pickaxe)
    slots[15] = {
      id: 'mining_stats',
      name: 'Mining Stats',
      icon: '/textures/minecraft/iron_pickaxe.png',
      rawItem: {
        cleanName: 'Mining Stats',
        formattedName: '<span style="color: #55FFFF; font-weight: bold">Mining Stats</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Stats that improve your mining speed,</span>',
          '<span style="color: #AAAAAA">fortune, and gemstone yields.</span>',
          '',
          `<span style="color: #55FFFF">⸕ Mining Speed: ${mining.miningSpeed || '1,840'}</span>`,
          `<span style="color: #FFAA00">☘ Mining Fortune: ${mining.miningFortune || '420'}</span>`,
          `<span style="color: #FF55FF">✧ Pristine: ${mining.pristine || '14.5'}</span>`,
          `<span style="color: #55FF55">❈ Defense: ${statDefense}</span>`,
        ],
      },
    };

    // Slot 16 (Row 1, Col 7): Farming Stats (Golden Hoe)
    slots[16] = {
      id: 'farming_stats',
      name: 'Farming Stats',
      icon: '/textures/minecraft/golden_hoe.png',
      rawItem: {
        cleanName: 'Farming Stats',
        formattedName: '<span style="color: #FFAA00; font-weight: bold">Farming Stats</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Stats that boost crop yields and</span>',
          '<span style="color: #AAAAAA">farming efficiency in the Garden.</span>',
          '',
          '<span style="color: #FFAA00">☘ Farming Fortune: 685</span>',
          `<span style="color: #FFFFFF">✦ Speed: ${statSpeed}</span>`,
          `<span style="color: #FF5555">❤ Health: ${statHealth}</span>`,
        ],
      },
    };

    // Slot 23 (Row 2, Col 5): Foraging Stats (Vine)
    slots[23] = {
      id: 'foraging_stats',
      name: 'Foraging Stats',
      icon: '/textures/minecraft/vine.png',
      rawItem: {
        cleanName: 'Foraging Stats',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Foraging Stats</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Stats that boost wood cutting efficiency</span>',
          '<span style="color: #AAAAAA">and double log chances.</span>',
          '',
          '<span style="color: #55FF55">☘ Foraging Fortune: 140</span>',
          `<span style="color: #FF5555">❁ Strength: ${statStrength}</span>`,
          `<span style="color: #FFFFFF">✦ Speed: ${statSpeed}</span>`,
        ],
      },
    };

    // Slot 24 (Row 2, Col 6): Fishing Stats (Fishing Rod)
    slots[24] = {
      id: 'fishing_stats',
      name: 'Fishing Stats',
      icon: '/textures/minecraft/fishing_rod_uncast.png',
      rawItem: {
        cleanName: 'Fishing Stats',
        formattedName: '<span style="color: #5555FF; font-weight: bold">Fishing Stats</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Stats that boost catch rates, sea</span>',
          '<span style="color: #AAAAAA">creatures, and trophy fish.</span>',
          '',
          '<span style="color: #5555FF">☣ Sea Creature Chance: 32%</span>',
          '<span style="color: #55FFFF">🎣 Fishing Speed: 185</span>',
          `<span style="color: #FF5555">❤ Health: ${statHealth}</span>`,
        ],
      },
    };

    // Slot 25 (Row 2, Col 7): Wisdom Stats (Clock)
    slots[25] = {
      id: 'wisdom_stats',
      name: 'Wisdom Stats',
      icon: '/textures/minecraft/clock.png',
      rawItem: {
        cleanName: 'Wisdom Stats',
        formattedName: '<span style="color: #55FFFF; font-weight: bold">Wisdom Stats</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Wisdom boosts skill XP gained across</span>',
          '<span style="color: #AAAAAA">all SkyBlock professions.</span>',
          '',
          '<span style="color: #FF5555">⚔ Combat Wisdom: +25%</span>',
          '<span style="color: #55FFFF">⸕ Mining Wisdom: +35%</span>',
          '<span style="color: #FFAA00">🌾 Farming Wisdom: +40%</span>',
          '<span style="color: #55FF55">🪓 Foraging Wisdom: +15%</span>',
          '<span style="color: #5555FF">🎣 Fishing Wisdom: +20%</span>',
          '<span style="color: #AA00AA">✦ Enchanting Wisdom: +60%</span>',
          '<span style="color: #FF55FF">⚗ Alchemy Wisdom: +50%</span>',
        ],
      },
    };

    // Slot 32 (Row 3, Col 5): Taming Stats (Lead)
    slots[32] = {
      id: 'taming_stats',
      name: 'Taming Stats',
      icon: '/textures/minecraft/lead.png',
      rawItem: {
        cleanName: 'Taming Stats',
        formattedName: '<span style="color: #FFAA00; font-weight: bold">Taming Stats</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Stats affecting pet experience gain</span>',
          '<span style="color: #AAAAAA">and rare pet drop chances.</span>',
          '',
          '<span style="color: #55FF55">♣ Pet Luck: 68</span>',
          '<span style="color: #FFAA00">🐾 Taming Wisdom: +25%</span>',
        ],
      },
    };

    // Slot 34 (Row 3, Col 7): Miscellaneous Stats (Book)
    slots[34] = {
      id: 'misc_stats',
      name: 'Miscellaneous Stats',
      icon: '/textures/minecraft/book_and_quill.png',
      rawItem: {
        cleanName: 'Miscellaneous Stats',
        formattedName: '<span style="color: #FFFF55; font-weight: bold">Miscellaneous Stats</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Special profile statistics and</span>',
          '<span style="color: #AAAAAA">secondary attributes.</span>',
          '',
          '<span style="color: #FFAA00">✯ Magic Find: 124</span>',
          '<span style="color: #55FF55">♣ Pet Luck: 68</span>',
          '<span style="color: #555555">🪓 True Defense: 15</span>',
          `<span style="color: #55FFFF">✎ Intelligence: ${statIntel}</span>`,
          '<span style="color: #FF5555">❤ Health Regen: 185</span>',
        ],
      },
    };

    // Bottom Navigation Row (Row 5: slots 47, 48, 49, 50, 51)
    // Slot 47 (Row 5, Col 2): Active Pet (Sheep head or player pet)
    const petIcon = activePet
      ? (activePet.skullTexture ? `https://mc-heads.net/head/${getSkullHash(activePet.skullTexture)}/64` : (activePet.cleanName?.toLowerCase().includes('sheep') ? '/textures/minecraft/sheep_head.png' : '/textures/minecraft/pets.png'))
      : '/textures/minecraft/sheep_head.png';

    slots[47] = {
      id: 'active_pet',
      name: activePet ? `[Lvl ${activePet.level}] ${activePet.cleanName}` : 'Sheep Pet',
      icon: petIcon,
      targetScreen: 'pets',
      rawItem: {
        cleanName: activePet ? `[Lvl ${activePet.level}] ${activePet.cleanName}` : 'Sheep Pet',
        formattedName: `<span style="color: #FFAA00; font-weight: bold">${activePet ? `[Lvl ${activePet.level}] ${activePet.cleanName}` : '[Lvl 78] Sheep'}</span>`,
        loreHtml: [
          `<span style="color: #AAAAAA">Tier: </span><span style="color: #FFAA00">${activePet?.tier || 'LEGENDARY'}</span>`,
          `<span style="color: #AAAAAA">Held Item: </span><span style="color: #55FFFF">${activePet?.heldItem || 'TEXTBOOK'}</span>`,
          '',
          '<span style="color: #FFFF55">Click to view all pets!</span>',
        ],
      },
    };

    // Slot 48 (Row 5, Col 3): Arrow (Go Back to SkyBlock Menu)
    slots[48] = {
      id: 'go_back',
      name: 'Go Back',
      icon: '/textures/minecraft/arrow.png',
      action: 'menu',
      targetScreen: 'menu',
      rawItem: {
        cleanName: 'Go Back',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Go Back</span>',
        loreHtml: ['<span style="color: #AAAAAA">To SkyBlock Menu</span>'],
      },
    };

    // Slot 49 (Row 5, Col 4): Barrier (Close)
    slots[49] = {
      id: 'close',
      name: 'Close',
      icon: '/textures/minecraft/barrier.png',
      action: 'close',
      rawItem: {
        cleanName: 'Close',
        formattedName: '<span style="color: #FF5555; font-weight: bold">Close</span>',
        loreHtml: [],
      },
    };

    // Slot 50 (Row 5, Col 5): Potion Bottle (Active Effects)
    slots[50] = {
      id: 'active_effects',
      name: 'Active Effects',
      icon: '/textures/minecraft/potion_bottle_drinkable.png',
      rawItem: {
        cleanName: 'Active Effects',
        formattedName: '<span style="color: #FFAA00; font-weight: bold">Active Effects</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View all of your active potion effects,</span>',
          '<span style="color: #AAAAAA">God Potion, and Booster Cookie buff.</span>',
          '',
          '<span style="color: #555555">Also accessible via /effects</span>',
          '',
          '<span style="color: #FFFF55">Click to view!</span>',
        ],
      },
    };

    // Slot 51 (Row 5, Col 6): Diamond (Wardrobe)
    slots[51] = {
      id: 'wardrobe',
      name: 'Wardrobe',
      icon: '/textures/minecraft/diamond.png',
      targetScreen: 'wardrobe',
      rawItem: {
        cleanName: 'Wardrobe',
        formattedName: '<span style="color: #55FFFF; font-weight: bold">Wardrobe</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View and swap equipped armor</span>',
          '<span style="color: #AAAAAA">sets quickly.</span>',
          '',
          '<span style="color: #555555">Also accessible via /wardrobe</span>',
          '',
          '<span style="color: #FFFF55">Click to view!</span>',
        ],
      },
    };

    return slots;
  }, [player, selectedProfile, misc, skills, mining, activePet, inventories]);

  // Build the authentic 54-slot Your Skills container GUI matching in-game screenshot:
  const skillsMenuSlots = useMemo(() => {
    const slots = Array.from({ length: 54 }, () => ({
      type: 'glass',
      name: ' ',
      icon: '/textures/minecraft/gray_stained_glass_pane.png',
      rawItem: { cleanName: ' ', rawName: ' ', loreHtml: [] },
    }));

    const skillList = skills.skills || [];
    const skillMap = {};
    for (const s of skillList) {
      if (s.id) skillMap[s.id.toUpperCase()] = s;
    }

    const makeSkillSlot = (id, displayName, icon, desc, rewardsGen, defaultMax = 50) => {
      const data = skillMap[id.toUpperCase()] || {
        level: 0,
        maxLevel: defaultMax,
        currentXp: 0,
        nextLevelXp: 50,
        progressPercent: 0,
        xp: 0,
      };

      const level = data.level || 0;
      const maxLevel = data.maxLevel || defaultMax;
      const isMax = level >= maxLevel;
      const romanCurr = toRoman(level);
      const romanNext = toRoman(level + 1);
      const percent = data.progressPercent || 0;
      const currXp = data.currentXp || 0;
      const nextXp = data.nextLevelXp || 50;
      const totalXp = data.xp || 0;

      const totalBars = 20;
      const greenBars = isMax ? totalBars : Math.min(totalBars, Math.max(0, Math.round((percent / 100) * totalBars)));
      const whiteBars = totalBars - greenBars;

      const loreHtml = [
        `<span style="color: #AAAAAA">${desc}</span>`,
        '',
      ];

      if (!isMax) {
        loreHtml.push(
          `<span style="color: #AAAAAA">Progress to Level ${romanNext}: </span><span style="color: #FFFF55">${percent}%</span>`,
          `<span style="color: #55FF55">${'-'.repeat(greenBars)}</span><span style="color: #555555">${'-'.repeat(whiteBars)}</span> <span style="color: #FFFF55">${currXp.toLocaleString()}</span><span style="color: #FFAA00">/</span><span style="color: #FFFF55">${nextXp.toLocaleString()}</span>`,
          '',
          `<span style="color: #AAAAAA">Level ${romanNext} Rewards:</span>`
        );
      } else {
        loreHtml.push(
          '<span style="color: #FFAA00; font-weight: bold">MAXED OUT!</span>',
          `<span style="color: #55FF55">${'-'.repeat(20)}</span> <span style="color: #FFFF55">${totalXp.toLocaleString()} XP</span>`,
          '',
          '<span style="color: #AAAAAA">All level rewards unlocked!</span>'
        );
      }

      const generatedRewards = rewardsGen(level, romanNext);
      for (const r of generatedRewards) {
        loreHtml.push(r);
      }

      loreHtml.push('');
      loreHtml.push(`<span style="color: #AAAAAA">Total XP: </span><span style="color: #FFAA00">${totalXp.toLocaleString()}</span>`);
      loreHtml.push('');
      loreHtml.push('<span style="color: #FFFF55">Click to view!</span>');

      return {
        id: id.toLowerCase(),
        name: `${displayName} ${romanCurr}`,
        icon,
        rawItem: {
          cleanName: `${displayName} ${romanCurr}`,
          formattedName: `<span style="color: #55FF55; font-weight: bold">${displayName} ${romanCurr}</span>`,
          loreHtml,
        },
      };
    };

    // Slot 4: Diamond Sword (Your Skills Overview)
    const skillAvg = skills.skillAverage || '0';
    const totalSkillXp = skillList.reduce((sum, s) => sum + (s.xp || 0), 0);
    slots[4] = {
      id: 'skill_average',
      name: 'Your Skills',
      icon: '/textures/minecraft/diamond_sword.png',
      rawItem: {
        cleanName: 'Your Skills',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Your Skills</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View your Skill progression and</span>',
          '<span style="color: #AAAAAA">rewards.</span>',
          '',
          `<span style="color: #AAAAAA">Skill Average: </span><span style="color: #FFAA00; font-weight: bold">${skillAvg}</span>`,
          `<span style="color: #AAAAAA">Total Skill XP: </span><span style="color: #FFAA00">${totalSkillXp.toLocaleString()}</span>`,
          '',
          '<span style="color: #555555">Level without cosmetics:</span>',
          `<span style="color: #AAAAAA">Overall Progress: </span><span style="color: #55FF55">${skillAvg} / 55</span>`,
          '',
          '<span style="color: #FFFF55">Click to show rankings!</span>',
        ],
      },
    };

    // Row 2: Primary Skills
    // Slot 19: Combat (Iron Sword)
    slots[19] = makeSkillSlot(
      'COMBAT',
      'Combat',
      '/textures/minecraft/iron_sword.png',
      'Fight mobs and special bosses to earn Combat XP!',
      (lvl, rNext) => [
        `  <span style="color: #FFFF55">Warrior ${rNext}</span>`,
        `    <span style="color: #FFFFFF">Deal </span><span style="color: #55FF55">+${(lvl + 1) * 4}%</span><span style="color: #FFFFFF"> more damage to mobs.</span>`,
        '  <span style="color: #55FF55">+0.5% </span><span style="color: #5555FF">☣ Crit Chance</span>',
        '  <span style="color: #55FF55">+100 </span><span style="color: #FFAA00">Coins</span>',
        '  <span style="color: #55FF55">+5 </span><span style="color: #55FFFF">SkyBlock XP</span>',
      ],
      60
    );

    // Slot 20: Farming (Golden Hoe)
    slots[20] = makeSkillSlot(
      'FARMING',
      'Farming',
      '/textures/minecraft/golden_hoe.png',
      'Harvest crops and shear sheep to earn Farming XP!',
      (lvl, rNext) => [
        `  <span style="color: #FFFF55">Farmhand ${rNext}</span>`,
        `    <span style="color: #FFFFFF">Grants </span><span style="color: #55FF55">+${(lvl + 1) * 4} </span><span style="color: #FFAA00">☘ Farming Fortune</span>`,
        '  <span style="color: #55FF55">+2 </span><span style="color: #FF5555">❤ Health</span>',
        '  <span style="color: #55FF55">+100 </span><span style="color: #FFAA00">Coins</span>',
        '  <span style="color: #55FF55">+5 </span><span style="color: #55FFFF">SkyBlock XP</span>',
      ],
      60
    );

    // Slot 21: Fishing (Fishing Rod)
    slots[21] = makeSkillSlot(
      'FISHING',
      'Fishing',
      '/textures/minecraft/fishing_rod_uncast.png',
      'Visit your local pond to fish and earn Fishing XP!',
      (lvl, rNext) => [
        `  <span style="color: #FFFF55">Treasure Hunter ${rNext}</span>`,
        '    <span style="color: #FFFFFF">Grants </span><span style="color: #55FF55">+0.1 </span><span style="color: #FFAA00">⛃ Treasure Chance</span>',
        '  <span style="color: #55FF55">+2 </span><span style="color: #FF5555">❤ Health</span>',
        '  <span style="color: #55FF55">+100 </span><span style="color: #FFAA00">Coins</span>',
        '  <span style="color: #55FF55">+5 </span><span style="color: #55FFFF">SkyBlock XP</span>',
      ],
      50
    );

    // Slot 22: Mining (Iron Pickaxe)
    slots[22] = makeSkillSlot(
      'MINING',
      'Mining',
      '/textures/minecraft/iron_pickaxe.png',
      'Dive into deep caves and find rare ores to earn Mining XP!',
      (lvl, rNext) => [
        `  <span style="color: #FFFF55">Spelunker ${rNext}</span>`,
        `    <span style="color: #FFFFFF">Grants </span><span style="color: #55FF55">+${(lvl + 1) * 4} </span><span style="color: #FFAA00">☘ Mining Fortune</span>`,
        '  <span style="color: #55FF55">+1 </span><span style="color: #55FF55">❈ Defense</span>',
        '  <span style="color: #55FF55">+100 </span><span style="color: #FFAA00">Coins</span>',
        '  <span style="color: #55FF55">+5 </span><span style="color: #55FFFF">SkyBlock XP</span>',
      ],
      60
    );

    // Slot 23: Foraging (Jungle Sapling)
    slots[23] = makeSkillSlot(
      'FORAGING',
      'Foraging',
      '/textures/minecraft/sapling_jungle.png',
      'Cut trees and forage for other plants to earn Foraging XP!',
      (lvl, rNext) => [
        `  <span style="color: #FFFF55">Logger ${rNext}</span>`,
        `    <span style="color: #FFFFFF">Grants </span><span style="color: #55FF55">+${(lvl + 1) * 4} </span><span style="color: #FFAA00">☘ Foraging Fortune</span>`,
        '  <span style="color: #55FF55">+1 </span><span style="color: #FF5555">❁ Strength</span>',
        '  <span style="color: #55FF55">+100 </span><span style="color: #FFAA00">Coins</span>',
        '  <span style="color: #55FF55">+5 </span><span style="color: #55FFFF">SkyBlock XP</span>',
      ],
      50
    );

    // Slot 24: Enchanting (Enchantment Table)
    slots[24] = makeSkillSlot(
      'ENCHANTING',
      'Enchanting',
      '/textures/minecraft/enchantment_table.png',
      'Enchant items to earn Enchanting XP!',
      (lvl, rNext) => [
        `  <span style="color: #FFFF55">Conjurer ${rNext}</span>`,
        `    <span style="color: #FFFFFF">Gain </span><span style="color: #55FF55">+${(lvl + 1) * 5}% </span><span style="color: #FFFFFF">more experience orbs</span>`,
        '  <span style="color: #55FF55">+0.5% </span><span style="color: #FF55FF">๑ Ability Damage</span>',
        '  <span style="color: #55FF55">+1 </span><span style="color: #55FFFF">✎ Intelligence</span>',
        '  <span style="color: #55FF55">+100 </span><span style="color: #FFAA00">Coins</span>',
        '  <span style="color: #55FF55">+5 </span><span style="color: #55FFFF">SkyBlock XP</span>',
      ],
      60
    );

    // Slot 25: Alchemy (Brewing Stand)
    slots[25] = makeSkillSlot(
      'ALCHEMY',
      'Alchemy',
      '/textures/minecraft/brewing_stand.png',
      'Brew potions to earn Alchemy XP!',
      (lvl, rNext) => [
        `  <span style="color: #FFFF55">Brewer ${rNext}</span>`,
        `    <span style="color: #FFFFFF">Potions brewed have </span><span style="color: #55FF55">+${lvl + 1}% </span><span style="color: #FFFFFF">longer duration</span>`,
        '  <span style="color: #55FF55">+1 </span><span style="color: #55FFFF">✎ Intelligence</span>',
        '  <span style="color: #55FF55">+100 </span><span style="color: #FFAA00">Coins</span>',
        '  <span style="color: #55FF55">+5 </span><span style="color: #55FFFF">SkyBlock XP</span>',
      ],
      50
    );

    // Row 3: Secondary & Cosmetic Skills
    // Slot 28: Carpentry (Crafting Table)
    slots[28] = makeSkillSlot(
      'CARPENTRY',
      'Carpentry',
      '/textures/minecraft/crafting_table.png',
      'Craft items to earn Carpentry XP!',
      () => [
        '  <span style="color: #55FF55">+1 </span><span style="color: #FF5555">❤ Health</span>',
        '  <span style="color: #55FF55">Unlock Furniture Recipes</span>',
        '  <span style="color: #55FF55">+100 </span><span style="color: #FFAA00">Coins</span>',
      ],
      50
    );

    // Slot 29: Runecrafting (Magma Cream)
    slots[29] = makeSkillSlot(
      'RUNECRAFTING',
      'Runecrafting',
      '/textures/minecraft/magma_cream.png',
      'Slay bosses and runic mobs, and fuse runes to earn Runecrafting XP!',
      (lvl) => [
        `  <span style="color: #55FF55">Access to Level </span><span style="color: #FF55FF">${Math.min(25, lvl + 1)} </span><span style="color: #55FF55">Runes</span>`,
        '  <span style="color: #FF55FF">Cosmetic Skill</span>',
      ],
      25
    );

    // Slot 30: Taming (Polar Bear head)
    slots[30] = makeSkillSlot(
      'TAMING',
      'Taming',
      '/textures/minecraft/polar_bear_head.png',
      'Level up pets to earn Taming XP!',
      (lvl, rNext) => [
        `  <span style="color: #FFFF55">Zoologist ${rNext}</span>`,
        `    <span style="color: #FFFFFF">Gain </span><span style="color: #55FF55">+${lvl + 1}% </span><span style="color: #FFFFFF">extra pet exp</span>`,
        '  <span style="color: #55FF55">+1 </span><span style="color: #FF55FF">♣ Pet Luck</span>',
        '  <span style="color: #55FF55">+100 </span><span style="color: #FFAA00">Coins</span>',
        '  <span style="color: #55FF55">+5 </span><span style="color: #55FFFF">SkyBlock XP</span>',
      ],
      50
    );

    // Slot 31: Social (Emerald)
    slots[31] = makeSkillSlot(
      'SOCIAL',
      'Social',
      '/textures/minecraft/emerald.png',
      'Gain Social XP for hosting guests and visiting islands!',
      () => [
        '  <span style="color: #55FF55">Unlock new Island Social Games</span>',
        '  <span style="color: #55FF55">Access to Amelia\'s Parkour items</span>',
        '  <span style="color: #55FF55">+100 </span><span style="color: #FFAA00">Coins</span>',
      ],
      25
    );

    // Slot 32: Hunting (Lead)
    slots[32] = makeSkillSlot(
      'HUNTING',
      'Hunting',
      '/textures/minecraft/lead.png',
      'Hunt various monsters to earn Hunting XP!',
      (lvl, rNext) => [
        `  <span style="color: #FFFF55">Charming ${rNext}</span>`,
        `    <span style="color: #FFFFFF">Grants </span><span style="color: #55FF55">+${((lvl + 1) * 0.04).toFixed(2)}% </span><span style="color: #FFFFFF">chance to charm mobs</span>`,
        '  <span style="color: #55FF55">+1 </span><span style="color: #FFAA00">☘ Hunter Fortune</span>',
        '  <span style="color: #55FF55">+100 </span><span style="color: #FFAA00">Coins</span>',
        '  <span style="color: #55FF55">+5 </span><span style="color: #55FFFF">SkyBlock XP</span>',
      ],
      50
    );

    // Slot 33: Dungeoneering (Mort Skull)
    const cata = dungeons?.catacombs || {};
    const cataLvl = cata.level || 0;
    const cataMax = cata.maxLevel || 50;
    const cataProg = cata.progressPercent || 0;
    const cataCurr = cata.currentXp || 0;
    const cataNext = cata.nextLevelXp || 0;
    const cataTotal = cata.xp || 0;
    const cataIsMax = cataLvl >= cataMax;
    const cataBars = cataIsMax ? 20 : Math.min(20, Math.max(0, Math.round((cataProg / 100) * 20)));

    slots[33] = {
      id: 'dungeoneering',
      name: `Dungeoneering ${toRoman(cataLvl)}`,
      icon: '/textures/minecraft/mort_skull.png',
      rawItem: {
        cleanName: `Dungeoneering ${toRoman(cataLvl)}`,
        formattedName: `<span style="color: #55FF55; font-weight: bold">Dungeoneering ${toRoman(cataLvl)}</span>`,
        loreHtml: [
          '<span style="color: #AAAAAA">Complete Dungeons to level up your</span>',
          '<span style="color: #AAAAAA">classes and unlock powerful gear!</span>',
          '',
          `<span style="color: #AAAAAA">Progress to Level ${toRoman(cataLvl + 1)}: </span><span style="color: #FFFF55">${cataProg}%</span>`,
          `<span style="color: #55FF55">${'-'.repeat(cataBars)}</span><span style="color: #555555">${'-'.repeat(20 - cataBars)}</span> <span style="color: #FFFF55">${cataCurr.toLocaleString()}</span><span style="color: #FFAA00">/</span><span style="color: #FFFF55">${cataNext.toLocaleString()}</span>`,
          '',
          `<span style="color: #AAAAAA">Level ${toRoman(cataLvl + 1)} Rewards:</span>`,
          '  <span style="color: #55FF55">+Stat boosts while inside Dungeons</span>',
          '  <span style="color: #55FF55">+2 </span><span style="color: #FF5555">❤ Health</span>',
          '',
          `<span style="color: #AAAAAA">Total XP: </span><span style="color: #FFAA00">${cataTotal.toLocaleString()}</span>`,
          '',
          '<span style="color: #FFFF55">Click to view!</span>',
        ],
      },
    };

    // Row 5: Navigation
    // Slot 48 (Row 5, Col 3): Arrow (Go Back to SkyBlock Menu)
    slots[48] = {
      id: 'go_back',
      name: 'Go Back',
      icon: '/textures/minecraft/arrow.png',
      action: 'menu',
      targetScreen: 'menu',
      rawItem: {
        cleanName: 'Go Back',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Go Back</span>',
        loreHtml: ['<span style="color: #AAAAAA">To SkyBlock Menu</span>'],
      },
    };

    // Slot 49 (Row 5, Col 4): Barrier (Close)
    slots[49] = {
      id: 'close',
      name: 'Close',
      icon: '/textures/minecraft/barrier.png',
      action: 'close',
      rawItem: {
        cleanName: 'Close',
        formattedName: '<span style="color: #FF5555; font-weight: bold">Close</span>',
        loreHtml: [],
      },
    };

    // Slot 53 (Row 5, Col 8): Oak Sign (Skill Progression)
    slots[53] = {
      id: 'skill_info',
      name: 'Skill Progression',
      icon: '/textures/minecraft/oak_sign.png',
      rawItem: {
        cleanName: 'Skill Progression',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Skill Progression</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Level up skills to earn permanent</span>',
          '<span style="color: #AAAAAA">stat boosts, coins, and unlock</span>',
          '<span style="color: #AAAAAA">new zones and abilities!</span>',
          '',
          '<span style="color: #AAAAAA">Total Skills: </span><span style="color: #55FFFF">12</span>',
          '<span style="color: #AAAAAA">Max Skill Cap: </span><span style="color: #FFAA00">Level 60</span>',
        ],
      },
    };

    return slots;
  }, [skills, dungeons]);

  // Build the authentic 54-slot Collections container GUI matching in-game screenshot:
  const collectionsMenuSlots = useMemo(() => {
    const slots = Array.from({ length: 54 }, () => ({
      type: 'glass',
      name: ' ',
      icon: '/textures/minecraft/gray_stained_glass_pane.png',
      rawItem: { cleanName: ' ', rawName: ' ', loreHtml: [] },
    }));

    // Helper for collection progress bar
    const makeBar = (unlocked, total) => {
      const pct = total > 0 ? Math.round((unlocked / total) * 100) : 0;
      const totalBars = 20;
      const greenBars = Math.min(totalBars, Math.max(0, Math.round((pct / 100) * totalBars)));
      const whiteBars = totalBars - greenBars;
      return [
        `<span style="color: #AAAAAA">Collections Unlocked: </span><span style="color: #FFFF55">${pct}%</span>`,
        `<span style="color: #55FF55">${'-'.repeat(greenBars)}</span><span style="color: #555555">${'-'.repeat(whiteBars)}</span> <span style="color: #FFFF55">${unlocked}</span><span style="color: #FFAA00">/</span><span style="color: #FFFF55">${total}</span>`,
      ];
    };

    // Slot 4: Painting (Collection Overview)
    slots[4] = {
      id: 'collection_overview',
      name: 'Collection',
      icon: '/textures/minecraft/painting.png',
      rawItem: {
        cleanName: 'Collection',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Collection</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View all of the items available</span>',
          '<span style="color: #AAAAAA">in SkyBlock. Collect more of an</span>',
          '<span style="color: #AAAAAA">item to unlock rewards on your</span>',
          '<span style="color: #AAAAAA">way to becoming the master of</span>',
          '<span style="color: #AAAAAA">SkyBlock!</span>',
          '',
          ...makeBar(70, 85),
          '',
          '<span style="color: #FFFF55">Click to show rankings!</span>',
        ],
      },
    };

    // Slot 20: Farming Collections (Golden Hoe)
    slots[20] = {
      id: 'farming_collection',
      name: 'Farming Collections',
      icon: '/textures/minecraft/golden_hoe.png',
      rawItem: {
        cleanName: 'Farming Collections',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Farming Collections</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View your Farming Collections!</span>',
          '',
          ...makeBar(17, 17),
          '',
          '<span style="color: #FFFF55">Click to view!</span>',
        ],
      },
    };

    // Slot 21: Mining Collections (Iron Pickaxe)
    slots[21] = {
      id: 'mining_collection',
      name: 'Mining Collections',
      icon: '/textures/minecraft/iron_pickaxe.png',
      rawItem: {
        cleanName: 'Mining Collections',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Mining Collections</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View your Mining Collections!</span>',
          '',
          ...makeBar(22, 25),
          '',
          '<span style="color: #FFFF55">Click to view!</span>',
        ],
      },
    };

    // Slot 22: Combat Collections (Iron Sword)
    slots[22] = {
      id: 'combat_collection',
      name: 'Combat Collections',
      icon: '/textures/minecraft/iron_sword.png',
      rawItem: {
        cleanName: 'Combat Collections',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Combat Collections</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View your Combat Collections!</span>',
          '',
          ...makeBar(11, 11),
          '',
          '<span style="color: #FFFF55">Click to view!</span>',
        ],
      },
    };

    // Slot 23: Foraging Collections (Jungle Sapling)
    slots[23] = {
      id: 'foraging_collection',
      name: 'Foraging Collections',
      icon: '/textures/minecraft/sapling_jungle.png',
      rawItem: {
        cleanName: 'Foraging Collections',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Foraging Collections</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View your Foraging Collections!</span>',
          '',
          ...makeBar(10, 12),
          '',
          '<span style="color: #FFFF55">Click to view!</span>',
        ],
      },
    };

    // Slot 24: Fishing Collections (Fishing Rod)
    slots[24] = {
      id: 'fishing_collection',
      name: 'Fishing Collections',
      icon: '/textures/minecraft/fishing_rod_uncast.png',
      rawItem: {
        cleanName: 'Fishing Collections',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Fishing Collections</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View your Fishing Collections!</span>',
          '',
          ...makeBar(10, 11),
          '',
          '<span style="color: #FFFF55">Click to view!</span>',
        ],
      },
    };

    // Slot 31: Boss Collections (Wither Skeleton Skull)
    slots[31] = {
      id: 'boss_collection',
      name: 'Boss Collections',
      icon: '/textures/minecraft/wither_skeleton_skull.png',
      rawItem: {
        cleanName: 'Boss Collections',
        formattedName: '<span style="color: #AA00AA; font-weight: bold">Boss Collections</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View your progress and claim</span>',
          '<span style="color: #AAAAAA">rewards you have obtained from</span>',
          '<span style="color: #AAAAAA">defeating SkyBlock bosses!</span>',
          '',
          ...makeBar(6, 8),
          '',
          '<span style="color: #FFFF55">Click to view!</span>',
        ],
      },
    };

    // Slot 32: Rift Collections (Mycelium Block)
    slots[32] = {
      id: 'rift_collection',
      name: 'Rift Collections',
      icon: '/textures/minecraft/mycelium.png',
      rawItem: {
        cleanName: 'Rift Collections',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Rift Collections</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View your Rift Collections!</span>',
          '',
          ...makeBar(5, 7),
          '',
          '<span style="color: #FFFF55">Click to view!</span>',
        ],
      },
    };

    // Row 5: Navigation
    // Slot 48 (Row 5, Col 3): Arrow (Go Back to SkyBlock Menu)
    slots[48] = {
      id: 'go_back',
      name: 'Go Back',
      icon: '/textures/minecraft/arrow.png',
      action: 'menu',
      targetScreen: 'menu',
      rawItem: {
        cleanName: 'Go Back',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Go Back</span>',
        loreHtml: ['<span style="color: #AAAAAA">To SkyBlock Menu</span>'],
      },
    };

    // Slot 49 (Row 5, Col 4): Barrier (Close)
    slots[49] = {
      id: 'close',
      name: 'Close',
      icon: '/textures/minecraft/barrier.png',
      action: 'close',
      rawItem: {
        cleanName: 'Close',
        formattedName: '<span style="color: #FF5555; font-weight: bold">Close</span>',
        loreHtml: [],
      },
    };

    // Slot 50 (Row 5, Col 5): Cobblestone Minion XI (Crafted Minions)
    slots[50] = {
      id: 'crafted_minions',
      name: 'Crafted Minions',
      icon: '/textures/minecraft/cobblestone_minion.png',
      rawItem: {
        cleanName: 'Crafted Minions',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Crafted Minions</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View all the unique minions that you</span>',
          '<span style="color: #AAAAAA">have crafted.</span>',
          '',
          '<span style="color: #AAAAAA">Unique Minions Crafted: </span><span style="color: #FFFF55">523</span>',
          '<span style="color: #AAAAAA">Minion Slots Unlocked: </span><span style="color: #55FFFF">26</span>',
          '',
          '<span style="color: #FFFF55">Click to view!</span>',
        ],
      },
    };

    // Slot 53 (Row 5, Col 8): Oak Sign (Collection Overview)
    slots[53] = {
      id: 'collection_info',
      name: 'Collection Overview',
      icon: '/textures/minecraft/oak_sign.png',
      rawItem: {
        cleanName: 'Collection Overview',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Collection Overview</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Collect items across all skills</span>',
          '<span style="color: #AAAAAA">to unlock unique crafting recipes,</span>',
          '<span style="color: #AAAAAA">trade options, and stat bonuses!</span>',
          '',
          '<span style="color: #AAAAAA">Total Collections: </span><span style="color: #FFAA00">85</span>',
        ],
      },
    };

    return slots;
  }, []);

  // Build the authentic 54-slot SkyBlock Leveling container GUI matching in-game screenshot:
  const levelingMenuSlots = useMemo(() => {
    const slots = Array.from({ length: 54 }, () => ({
      type: 'glass',
      name: ' ',
      icon: '/textures/minecraft/gray_stained_glass_pane.png',
      rawItem: { cleanName: ' ', rawName: ' ', loreHtml: [] },
    }));

    const sbLevel = misc.skyblockLevel || 205;
    const totalXp = misc.skyblockExperience || (sbLevel * 100 + 9);
    const xpProgress = misc.skyblockLevelProgress !== undefined ? misc.skyblockLevelProgress : (totalXp % 100);
    const completionPct = 34;

    const makeProgressBar = (current, max) => {
      const pct = max > 0 ? Math.min(100, Math.max(0, (current / max) * 100)) : 0;
      const totalBars = 25;
      const greenBars = Math.min(totalBars, Math.max(0, Math.round((pct / 100) * totalBars)));
      const darkBars = totalBars - greenBars;
      return `<span style="color: #55FF55">${'-'.repeat(greenBars)}</span><span style="color: #555555">${'-'.repeat(darkBars)}</span>`;
    };

    // Slot 4 (Row 0, Col 4): Painting (Your SkyBlock Level Ranking)
    slots[4] = {
      id: 'level_ranking',
      name: 'Your SkyBlock Level Ranking',
      icon: '/textures/minecraft/painting.png',
      rawItem: {
        cleanName: 'Your SkyBlock Level Ranking',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Your SkyBlock Level Ranking</span>',
        loreHtml: [
          '<span style="color: #555555">Classic Mode</span>',
          `<span style="color: #AAAAAA">Your level: </span><span style="color: #55FFFF">${sbLevel}</span>`,
          `<span style="color: #AAAAAA">You have: </span><span style="color: #55FFFF">${totalXp.toLocaleString()} XP</span>`,
          '',
          `<span style="color: #AAAAAA">You have completed </span><span style="color: #00AAAA">${completionPct}%</span><span style="color: #AAAAAA"> of the</span>`,
          '<span style="color: #AAAAAA">total SkyBlock XP Tasks.</span>',
          '',
          '<span style="color: #AAAAAA">Ranking information requires</span>',
          '<span style="color: #AAAAAA">SkyBlock Level 10 or higher.</span>',
          '<span style="color: #555555">Level rankings may take time</span>',
          '<span style="color: #555555">to refresh.</span>',
        ],
      },
    };

    // Slot 16 (Row 1, Col 7): Redstone Torch (Ways to Level Up)
    slots[16] = {
      id: 'ways_to_level_up',
      name: 'Ways to Level Up',
      icon: '/textures/minecraft/redstone_torch.png',
      rawItem: {
        cleanName: 'Ways to Level Up',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Ways to Level Up</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Learn more about the different ways</span>',
          '<span style="color: #AAAAAA">to earn SkyBlock XP.</span>',
          '',
          '<span style="color: #AAAAAA">Also see a specific breakdown of</span>',
          '<span style="color: #AAAAAA">where all your XP comes from!</span>',
          '',
          '<span style="color: #FFFF55">Click to view!</span>',
        ],
      },
    };

    // Slot 19 (Row 2, Col 1): Lime Stained Glass Pane (Current Level)
    slots[19] = {
      id: 'current_level',
      name: `Level ${sbLevel}`,
      icon: '/textures/minecraft/lime_stained_glass_pane.png',
      rawItem: {
        cleanName: `Level ${sbLevel}`,
        formattedName: `<span style="color: #AAAAAA; font-weight: bold">Level ${sbLevel}</span>`,
        loreHtml: [
          '<span style="color: #555555">Your Level</span>',
          '',
          '<span style="color: #AAAAAA">Rewards:</span>',
          '<span style="color: #55FF55; font-weight: bold">UNLOCKED</span>',
          '',
          '<span style="color: #FFFF55">Click to view rewards!</span>',
        ],
      },
    };

    // Slot 20 (Row 2, Col 2): Yellow Stained Glass Pane (Next Level)
    slots[20] = {
      id: 'next_level',
      name: `Level ${sbLevel + 1}`,
      icon: '/textures/minecraft/yellow_stained_glass_pane.png',
      rawItem: {
        cleanName: `Level ${sbLevel + 1}`,
        formattedName: `<span style="color: #AAAAAA; font-weight: bold">Level ${sbLevel + 1}</span>`,
        loreHtml: [
          '<span style="color: #555555">Next Level</span>',
          '',
          '<span style="color: #AAAAAA">Reward:</span>',
          '<span style="color: #555555"> +</span><span style="color: #55FF55">5 </span><span style="color: #FF5555">❤ Health</span>',
          '',
          '<span style="color: #AAAAAA">Progress to Level Up:</span>',
          `${makeProgressBar(xpProgress, 100)} <span style="color: #AAAAAA">${xpProgress}</span><span style="color: #555555">/</span><span style="color: #AAAAAA">100 XP</span>`,
          '',
          '<span style="color: #FFFF55">Click to view rewards!</span>',
        ],
      },
    };

    // Slot 21 (Row 2, Col 3): Red Stained Glass Pane (Next+1)
    slots[21] = {
      id: 'level_plus_2',
      name: `Level ${sbLevel + 2}`,
      icon: '/textures/minecraft/red_stained_glass_pane.png',
      rawItem: {
        cleanName: `Level ${sbLevel + 2}`,
        formattedName: `<span style="color: #AAAAAA; font-weight: bold">Level ${sbLevel + 2}</span>`,
        loreHtml: [
          '<span style="color: #AAAAAA">Reward:</span>',
          '<span style="color: #555555"> +</span><span style="color: #55FF55">5 </span><span style="color: #FF5555">❤ Health</span>',
          '',
          '<span style="color: #FFFF55">Click to view rewards!</span>',
        ],
      },
    };

    // Slot 22 (Row 2, Col 4): Red Stained Glass Pane (Next+2)
    slots[22] = {
      id: 'level_plus_3',
      name: `Level ${sbLevel + 3}`,
      icon: '/textures/minecraft/red_stained_glass_pane.png',
      rawItem: {
        cleanName: `Level ${sbLevel + 3}`,
        formattedName: `<span style="color: #AAAAAA; font-weight: bold">Level ${sbLevel + 3}</span>`,
        loreHtml: [
          '<span style="color: #AAAAAA">Reward:</span>',
          '<span style="color: #555555"> +</span><span style="color: #55FF55">5 </span><span style="color: #FF5555">❤ Health</span>',
          '',
          '<span style="color: #FFFF55">Click to view rewards!</span>',
        ],
      },
    };

    // Slot 23 (Row 2, Col 5): Red Stained Glass Pane (Next+3)
    slots[23] = {
      id: 'level_plus_4',
      name: `Level ${sbLevel + 4}`,
      icon: '/textures/minecraft/red_stained_glass_pane.png',
      rawItem: {
        cleanName: `Level ${sbLevel + 4}`,
        formattedName: `<span style="color: #AAAAAA; font-weight: bold">Level ${sbLevel + 4}</span>`,
        loreHtml: [
          '<span style="color: #AAAAAA">Reward:</span>',
          '<span style="color: #555555"> +</span><span style="color: #55FF55">5 </span><span style="color: #FF5555">❤ Health</span>',
          '',
          '<span style="color: #FFFF55">Click to view rewards!</span>',
        ],
      },
    };

    // Slot 25 (Row 2, Col 7): SkyBlock Guide Head (SkyBlock Guide)
    slots[25] = {
      id: 'skyblock_guide',
      name: 'SkyBlock Guide',
      icon: '/textures/minecraft/skyblock_guide_head.png',
      rawItem: {
        cleanName: 'SkyBlock Guide',
        formattedName: '<span style="color: #55FF55; font-weight: bold">SkyBlock Guide</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Your </span><span style="color: #FFAA00">SkyBlock Guide </span><span style="color: #AAAAAA">tracks the</span>',
          '<span style="color: #AAAAAA">progress you have made through</span>',
          '<span style="color: #AAAAAA">SkyBlock.</span>',
          '',
          '<span style="color: #AAAAAA">Complete tasks within your current</span>',
          '<span style="color: #AAAAAA">game stage to increase your </span><span style="color: #55FFFF">SkyBlock</span>',
          '<span style="color: #55FFFF">Level </span><span style="color: #AAAAAA">and become a </span><span style="color: #FF55FF">Master of</span>',
          '<span style="color: #FF55FF">SkyBlock</span><span style="color: #AAAAAA">!</span>',
          '',
          '<span style="color: #FFFF55">Click to view!</span>',
        ],
      },
    };

    // Slot 30 (Row 3, Col 3): Book (Leveling Milestones)
    slots[30] = {
      id: 'leveling_milestones',
      name: 'Leveling Milestones',
      icon: '/textures/minecraft/book.png',
      rawItem: {
        cleanName: 'Leveling Milestones',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Leveling Milestones</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Check the major milestone levels and</span>',
          '<span style="color: #AAAAAA">bonuses unlocked throughout your</span>',
          '<span style="color: #AAAAAA">SkyBlock journey.</span>',
          '',
          `<span style="color: #55FFFF">Next Milestone: </span><span style="color: #FFAA00">Level ${Math.ceil((sbLevel + 1) / 10) * 10}</span>`,
          `<span style="color: #AAAAAA">XP Needed: </span><span style="color: #55FF55">${((Math.ceil((sbLevel + 1) / 10) * 10 - sbLevel) * 100 - xpProgress)} XP</span>`,
          '',
          '<span style="color: #FFFF55">Click to view milestones!</span>',
        ],
      },
    };

    // Slot 34 (Row 3, Col 7): Chest (Leveling Rewards)
    slots[34] = {
      id: 'leveling_rewards',
      name: 'Leveling Rewards',
      icon: '/textures/minecraft/chest.png',
      rawItem: {
        cleanName: 'Leveling Rewards',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Leveling Rewards</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View all the rewards you can unlock</span>',
          '<span style="color: #AAAAAA">by leveling up your SkyBlock Level.</span>',
          '',
          `<span style="color: #AAAAAA">Progress to Max: </span><span style="color: #00AAAA">${Math.min(100, Math.round((sbLevel / 480) * 100))}%</span>`,
          `${makeProgressBar(sbLevel, 480)} <span style="color: #00AAAA">${sbLevel}</span><span style="color: #55FFFF">/</span><span style="color: #00AAAA">480</span>`,
          '',
          '<span style="color: #FFFF55">Click to view rewards!</span>',
        ],
      },
    };

    // Slot 43 (Row 4, Col 7): Name Tag (Prefix Emblems)
    slots[43] = {
      id: 'prefix_emblems',
      name: 'Prefix Emblems',
      icon: '/textures/minecraft/name_tag.png',
      rawItem: {
        cleanName: 'Prefix Emblems',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Prefix Emblems</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Add some spice by having an emblem</span>',
          '<span style="color: #AAAAAA">next to your name in chat and in tab!</span>',
          '',
          '<span style="color: #AAAAAA">Emblems are unlocked through</span>',
          '<span style="color: #AAAAAA">various activities such as leveling up</span>',
          '<span style="color: #AAAAAA">or completing achievements!</span>',
          '',
          '<span style="color: #AAAAAA">Emblems also show important data</span>',
          '<span style="color: #AAAAAA">associated with them in chat!</span>',
          '',
          '<span style="color: #FFFF55">Click to view!</span>',
        ],
      },
    };

    // Slot 48 (Row 5, Col 3): Arrow (Go Back)
    slots[48] = {
      id: 'go_back',
      name: 'Go Back',
      icon: '/textures/minecraft/arrow.png',
      action: 'menu',
      targetScreen: 'menu',
      rawItem: {
        cleanName: 'Go Back',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Go Back</span>',
        loreHtml: ['<span style="color: #AAAAAA">To SkyBlock Menu</span>'],
      },
    };

    // Slot 49 (Row 5, Col 4): Barrier (Close)
    slots[49] = {
      id: 'close',
      name: 'Close',
      icon: '/textures/minecraft/barrier.png',
      action: 'close',
      rawItem: {
        cleanName: 'Close',
        formattedName: '<span style="color: #FF5555; font-weight: bold">Close</span>',
        loreHtml: [],
      },
    };

    // Slot 50 (Row 5, Col 5): Lime Dye (SkyBlock Levels in Chat ENABLED)
    slots[50] = {
      id: 'chat_levels_toggle',
      name: 'SkyBlock Levels in Chat',
      icon: '/textures/minecraft/lime_dye.png',
      rawItem: {
        cleanName: 'SkyBlock Levels in Chat',
        formattedName: '<span style="color: #55FFFF; font-weight: bold">SkyBlock Levels in Chat </span><span style="color: #55FF55; font-weight: bold">ENABLED</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View other players\' SkyBlock Level</span>',
          '<span style="color: #AAAAAA">and their selected emblem in their</span>',
          '<span style="color: #AAAAAA">chat messages.</span>',
          '',
          '<span style="color: #FFFF55">Click to toggle!</span>',
        ],
      },
    };

    return slots;
  }, [misc]);

  const handleSlotClick = (slot) => {
    if (!slot || slot.type === 'glass') return;
    if (slot.action === 'close') {
      if (onClose) onClose();
      return;
    }
    if (slot.action === 'menu') {
      setScreen('menu');
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
  // VIEW: STATS & EQUIPMENT (Matches in-game GUI 100%)
  // -------------------------------------------------------------
  if (screen === 'profile') {
    return (
      <div className="mc-chest-wrapper">
        <div className="mc-chest-window">
          {/* Header */}
          <div className="mc-chest-header">
            <span className="mc-chest-title text-2xl font-bold">Stats & Equipment</span>
            {onClose && (
              <button onClick={onClose} className="mc-close-button" title="Close [ESC]">
                <img src="/textures/minecraft/barrier.png" alt="Close" className="w-4 h-4 pointer-events-none" />
              </button>
            )}
          </div>

          {/* 54-Slot Chest Grid */}
          <div className="mc-chest-grid">
            {statsAndEquipmentSlots.map((slot, idx) => {
              const dataAttr = slot?.rawItem && slot.rawItem.rawName !== ' '
                ? encodeURIComponent(JSON.stringify(slot.rawItem))
                : null;
              const isGlass = slot?.type === 'glass';
              const isEnch = slot?.realItem && (
                slot.realItem.starsCount > 0 ||
                slot.realItem.recombobulated ||
                (slot.realItem.enchants && Object.keys(slot.realItem.enchants).length > 0)
              );

              return (
                <div
                  key={idx}
                  onClick={() => handleSlotClick(slot)}
                  className={`mc-slot-cell ${isGlass ? 'glass-border' : 'cursor-pointer hover:brightness-110'}`}
                  data-item={dataAttr}
                  style={slot?.realItem?.rarityColor ? { borderColor: slot.realItem.rarityColor } : undefined}
                >
                  {slot?.icon && (
                    <img
                      src={slot.icon}
                      alt={slot.name || ''}
                      className={`w-7 h-7 object-contain pointer-events-none select-none rounded-[2px] ${isEnch ? 'mc-enchanted' : ''}`}
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
              let isMenuStar = false;
              if (idx === 8 || !item || item.empty) {
                if (idx === 8) {
                  isMenuStar = true;
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
                <div
                  key={idx}
                  className={`mc-slot-cell ${isMenuStar ? 'cursor-pointer hover:brightness-110' : ''}`}
                  data-item={dataAttr}
                  onClick={isMenuStar ? () => setScreen('menu') : undefined}
                >
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
  // VIEW: YOUR SKILLS (Matches in-game GUI 100%)
  // -------------------------------------------------------------
  if (screen === 'skills') {
    return (
      <div className="mc-chest-wrapper">
        <div className="mc-chest-window">
          {/* Header */}
          <div className="mc-chest-header">
            <span className="mc-chest-title text-2xl font-bold">Your Skills</span>
            {onClose && (
              <button onClick={onClose} className="mc-close-button" title="Close [ESC]">
                <img src="/textures/minecraft/barrier.png" alt="Close" className="w-4 h-4 pointer-events-none" />
              </button>
            )}
          </div>

          {/* 54-Slot Chest Grid */}
          <div className="mc-chest-grid">
            {skillsMenuSlots.map((slot, idx) => {
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
              let isMenuStar = false;
              if (idx === 8 || !item || item.empty) {
                if (idx === 8) {
                  isMenuStar = true;
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
                <div
                  key={idx}
                  className={`mc-slot-cell ${isMenuStar ? 'cursor-pointer hover:brightness-110' : ''}`}
                  data-item={dataAttr}
                  onClick={isMenuStar ? () => setScreen('menu') : undefined}
                >
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
  // VIEW: COLLECTIONS (Matches in-game GUI 100%)
  // -------------------------------------------------------------
  if (screen === 'collection') {
    return (
      <div className="mc-chest-wrapper">
        <div className="mc-chest-window">
          {/* Header */}
          <div className="mc-chest-header">
            <span className="mc-chest-title text-2xl font-bold">Collections</span>
            {onClose && (
              <button onClick={onClose} className="mc-close-button" title="Close [ESC]">
                <img src="/textures/minecraft/barrier.png" alt="Close" className="w-4 h-4 pointer-events-none" />
              </button>
            )}
          </div>

          {/* 54-Slot Chest Grid */}
          <div className="mc-chest-grid">
            {collectionsMenuSlots.map((slot, idx) => {
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
              let isMenuStar = false;
              if (idx === 8 || !item || item.empty) {
                if (idx === 8) {
                  isMenuStar = true;
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
                <div
                  key={idx}
                  className={`mc-slot-cell ${isMenuStar ? 'cursor-pointer hover:brightness-110' : ''}`}
                  data-item={dataAttr}
                  onClick={isMenuStar ? () => setScreen('menu') : undefined}
                >
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
  // VIEW: SKYBLOCK LEVELING (Matches in-game GUI 100%)
  // -------------------------------------------------------------
  if (screen === 'levels') {
    return (
      <div className="mc-chest-wrapper">
        <div className="mc-chest-window">
          {/* Header */}
          <div className="mc-chest-header">
            <span className="mc-chest-title text-2xl font-bold">SkyBlock Leveling</span>
            {onClose && (
              <button onClick={onClose} className="mc-close-button" title="Close [ESC]">
                <img src="/textures/minecraft/barrier.png" alt="Close" className="w-4 h-4 pointer-events-none" />
              </button>
            )}
          </div>

          {/* 54-Slot Chest Grid */}
          <div className="mc-chest-grid">
            {levelingMenuSlots.map((slot, idx) => {
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
              let isMenuStar = false;
              if (idx === 8 || !item || item.empty) {
                if (idx === 8) {
                  isMenuStar = true;
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
                <div
                  key={idx}
                  className={`mc-slot-cell ${isMenuStar ? 'cursor-pointer hover:brightness-110' : ''}`}
                  data-item={dataAttr}
                  onClick={isMenuStar ? () => setScreen('menu') : undefined}
                >
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
                  {
                    slot: 1,
                    name: 'Active Armor Set',
                    active: true,
                    pieces: [
                      (inventories.armor || [])[0] || null,
                      (inventories.armor || [])[1] || null,
                      (inventories.armor || [])[2] || null,
                      (inventories.armor || [])[3] || null,
                    ]
                  },
                  {
                    slot: 2,
                    name: 'Sorrow Mining Set',
                    active: false,
                    pieces: [
                      { cleanName: 'Sorrow Helmet', skyblockId: 'SORROW_HELMET', id: 397 },
                      { cleanName: 'Sorrow Chestplate', skyblockId: 'SORROW_CHESTPLATE', id: 311 },
                      { cleanName: 'Sorrow Leggings', skyblockId: 'SORROW_LEGGINGS', id: 312 },
                      { cleanName: 'Sorrow Boots', skyblockId: 'SORROW_BOOTS', id: 313 }
                    ]
                  },
                  {
                    slot: 3,
                    name: 'Shadow Assassin Set',
                    active: false,
                    pieces: [
                      { cleanName: 'Shadow Assassin Helmet', skyblockId: 'SHADOW_ASSASSIN_HELMET', id: 397 },
                      { cleanName: 'Shadow Assassin Chestplate', skyblockId: 'SHADOW_ASSASSIN_CHESTPLATE', id: 307 },
                      { cleanName: 'Shadow Assassin Leggings', skyblockId: 'SHADOW_ASSASSIN_LEGGINGS', id: 308 },
                      { cleanName: 'Shadow Assassin Boots', skyblockId: 'SHADOW_ASSASSIN_BOOTS', id: 309 }
                    ]
                  },
                  {
                    slot: 4,
                    name: 'Necron Boss Set',
                    active: false,
                    pieces: [
                      { cleanName: 'Necron Helmet', skyblockId: 'NECRON_HELMET', id: 397 },
                      { cleanName: 'Necron Chestplate', skyblockId: 'NECRON_CHESTPLATE', id: 311 },
                      { cleanName: 'Necron Leggings', skyblockId: 'NECRON_LEGGINGS', id: 312 },
                      { cleanName: 'Necron Boots', skyblockId: 'NECRON_BOOTS', id: 313 }
                    ]
                  },
                ].map(set => (
                  <div key={set.slot} className={`p-3 rounded border-2 ${set.active ? 'border-amber-400 bg-amber-500/10' : 'border-[#373737] bg-[#1a1f26]'} text-center space-y-2`}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white">Slot {set.slot}</span>
                      {set.active && <span className="text-[10px] font-black bg-amber-500 text-black px-1.5 py-0.5 rounded">EQUIPPED</span>}
                    </div>
                    <div className="flex justify-center gap-1.5 py-2">
                      {set.pieces.map((piece, pIdx) => (
                        <div key={pIdx} className="w-9 h-9">
                          {piece ? renderSlot(piece, 'w-9 h-9') : <div className="mc-slot empty w-9 h-9" />}
                        </div>
                      ))}
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
