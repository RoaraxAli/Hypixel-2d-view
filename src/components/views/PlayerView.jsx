'use client';

import { useState, useMemo, useEffect } from 'react';
import ItemSlot from '@/components/ItemSlot';
import { getItemTexture, getSkullHash } from '@/lib/itemTextures';
import { formatCoins } from '@/lib/skyblockUtils';
import { generatePetLore, calculatePetLevel, PET_TIER_COLORS } from '@/lib/petConstants';

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

const PET_TEXTURE_MAP = {
  ARMADILLO: '/textures/minecraft/pets/armadillo.png',
  BABY_YETI: '/textures/minecraft/pets/baby_yeti.png',
  BAT: '/textures/minecraft/pets/bat.png',
  BEE: '/textures/minecraft/pets/bee.png',
  BLUE_WHALE: '/textures/minecraft/pets/blue_whale.png',
  DOLPHIN: '/textures/minecraft/pets/dolphin.png',
  ELEPHANT: '/textures/minecraft/pets/elephant.png',
  ENDERMAN: '/textures/minecraft/pets/enderman.png',
  GHOUL: '/textures/minecraft/pets/ghoul.png',
  GOLEM: '/textures/minecraft/pets/golem.png',
  GRANDMA_WOLF: '/textures/minecraft/pets/grandma_wolf.png',
  GUARDIAN: '/textures/minecraft/pets/guardian.png',
  HOUND: '/textures/minecraft/pets/hound.png',
  LION: '/textures/minecraft/pets/lion.png',
  MAGMA_CUBE: '/textures/minecraft/pets/magma_cube.png',
  MEGALODON: '/textures/minecraft/pets/megalodon.png',
  MONKEY: '/textures/minecraft/pets/monkey.png',
  MOOSHROOM_COW: '/textures/minecraft/pets/mooshroom_cow.png',
  OCELOT: '/textures/minecraft/pets/ocelot.png',
  RAT: '/textures/minecraft/pets/rat.png',
  ROCK: '/textures/minecraft/pets/rock.png',
  SHEEP: '/textures/minecraft/pets/sheep.png',
  SILVERFISH: '/textures/minecraft/pets/silverfish.png',
  SKELETON: '/textures/minecraft/pets/skeleton.png',
  TARANTULA: '/textures/minecraft/pets/tarantula.png',
  TIGER: '/textures/minecraft/pets/tiger.png',
  WITHER_SKELETON: '/textures/minecraft/pets/wither_skeleton.png',
  ZOMBIE: '/textures/minecraft/pets/zombie.png',
};

const PET_MHF_MAP = {
  SPIDER: 'https://mc-heads.net/head/MHF_Spider/64',
  CHICKEN: 'https://mc-heads.net/head/MHF_Chicken/64',
  SQUID: 'https://mc-heads.net/head/MHF_Squid/64',
  ENDERMITE: 'https://mc-heads.net/head/MHF_Endermite/64',
  WOLF: 'https://mc-heads.net/head/MHF_Wolf/64',
  HORSE: 'https://mc-heads.net/head/MHF_Horse/64',
  COW: 'https://mc-heads.net/head/MHF_Cow/64',
  PIG: 'https://mc-heads.net/head/MHF_Pig/64',
  BLAZE: 'https://mc-heads.net/head/MHF_Blaze/64',
  JERRY: 'https://mc-heads.net/head/MHF_Villager/64',
  CAVE_SPIDER: 'https://mc-heads.net/head/MHF_CaveSpider/64',
  GHAST: 'https://mc-heads.net/head/MHF_Ghast/64',
  SLIME: 'https://mc-heads.net/head/MHF_Slime/64',
  PIGMAN: 'https://mc-heads.net/head/MHF_PigZombie/64',
  RABBIT: 'https://mc-heads.net/head/MHF_Rabbit/64',
  PARROT: 'https://mc-heads.net/head/MHF_Parrot/64',
  TURTLE: 'https://mc-heads.net/head/MHF_Turtle/64',
  POLAR_BEAR: '/textures/minecraft/polar_bear_head.png',
};

function getPetIcon(pet) {
  if (!pet) return '/textures/minecraft/pets.png';
  const typeKey = (pet.type || '').toUpperCase();
  if (PET_TEXTURE_MAP[typeKey]) return PET_TEXTURE_MAP[typeKey];
  const hash = getSkullHash(pet.skin || pet.skullTexture);
  if (hash) return `https://mc-heads.net/head/${hash}/64`;
  if (PET_MHF_MAP[typeKey]) return PET_MHF_MAP[typeKey];
  if (pet.cleanName?.toLowerCase().includes('sheep')) return '/textures/minecraft/pets/sheep.png';
  return '/textures/minecraft/pets.png';
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
  const [accessoryBagPage, setAccessoryBagPage] = useState(1);
  const [petsPage, setPetsPage] = useState(1);
  const [wardrobePage, setWardrobePage] = useState(1);
  const [selectedLoadout, setSelectedLoadout] = useState(1);

  useEffect(() => {
    if (activeSubtab) {
      if (['dungeons', 'mining', 'garden', 'slayers', 'gear', 'misc', 'rift'].includes(activeSubtab)) {
        setScreen('profile');
        setProfileSubtab(activeSubtab);
      } else if (activeSubtab === 'sacks' || activeSubtab === 'bags') {
        setScreen('bags');
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
      targetScreen: 'bags',
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
      rawItem: {
        cleanName: 'Crafting Table',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Crafting Table</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Opens the crafting grid.</span>',
          '',
          '<span style="color: #555555">Also accessible via /craft</span>',
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
    const petIcon = getPetIcon(activePet);
    const activePetLvl = activePet ? (activePet.level || calculatePetLevel(activePet.exp || 0, activePet.tier).level || 1) : 78;
    const activePetName = activePet ? `[Lvl ${activePetLvl}] ${activePet.cleanName}` : 'Sheep Pet';
    const activePetTierColor = activePet ? (PET_TIER_COLORS[activePet.tier] || '#FFAA00') : '#FFAA00';

    slots[47] = {
      id: 'active_pet',
      name: activePetName,
      icon: petIcon,
      targetScreen: 'pets',
      rawItem: {
        cleanName: activePetName,
        formattedName: `<span style="color: ${activePetTierColor}; font-weight: bold">${activePetName} ✦</span>`,
        loreHtml: activePet ? generatePetLore({ ...activePet, level: activePetLvl }) : [
          '<span style="color: #AAAAAA">Tier: </span><span style="color: #FFAA00">LEGENDARY</span>',
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

  // Build the authentic 54-slot Quests & Chapters container GUI matching in-game screenshot:
  const questsMenuSlots = useMemo(() => {
    const slots = Array.from({ length: 54 }, () => ({
      type: 'glass',
      name: ' ',
      icon: '/textures/minecraft/gray_stained_glass_pane.png',
      rawItem: { cleanName: ' ', rawName: ' ', loreHtml: [] },
    }));

    // Slot 4 (Row 0, Col 4): Book and Quill (Quests & Chapters Overview)
    slots[4] = {
      id: 'quests_chapters_overview',
      name: 'Quests & Chapters',
      icon: '/textures/minecraft/book_and_quill.png',
      rawItem: {
        cleanName: 'Quests & Chapters',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Quests & Chapters</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Each island has its own series of</span>',
          '<span style="color: #55FF55">Chapters</span><span style="color: #AAAAAA"> for you to complete! Finish</span>',
          '<span style="color: #AAAAAA">individual objectives for small rewards, or</span>',
          '<span style="color: #AAAAAA">entire Chapters to earn big ones!</span>',
          '',
          '<span style="color: #AAAAAA">Some islands also have </span><span style="color: #55FF55">Quests</span><span style="color: #AAAAAA"> for</span>',
          '<span style="color: #AAAAAA">you to complete! Some items can only</span>',
          '<span style="color: #AAAAAA">be obtained through Quests.</span>',
        ],
      },
    };

    // Slot 20 (Row 2, Col 2): Book (Quests)
    slots[20] = {
      id: 'quests_view',
      name: 'Quests',
      icon: '/textures/minecraft/book.png',
      rawItem: {
        cleanName: 'Quests',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Quests</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View your active and completed Quests</span>',
          '<span style="color: #AAAAAA">throughout the world of SkyBlock.</span>',
          '',
          '<span style="color: #AAAAAA">Active Quests: </span><span style="color: #55FFFF">4</span>',
          '<span style="color: #AAAAAA">Completed Quests: </span><span style="color: #55FF55">48</span>',
          '',
          '<span style="color: #FFFF55">Click to view!</span>',
        ],
      },
    };

    // Slot 24 (Row 2, Col 6): Book and Quill (Chapters)
    slots[24] = {
      id: 'chapters_view',
      name: 'Chapters',
      icon: '/textures/minecraft/book_and_quill.png',
      rawItem: {
        cleanName: 'Chapters',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Chapters</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Progress through guided Chapters across</span>',
          '<span style="color: #AAAAAA">different islands to learn mechanics</span>',
          '<span style="color: #AAAAAA">and earn rewards!</span>',
          '',
          '<span style="color: #AAAAAA">Unlocked Chapters: </span><span style="color: #55FFFF">12</span>',
          '<span style="color: #AAAAAA">Completed: </span><span style="color: #55FF55">9</span>',
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

    return slots;
  }, []);

  // Build the authentic 54-slot Calendar and Events container GUI matching in-game screenshot:
  const calendarMenuSlots = useMemo(() => {
    const slots = Array.from({ length: 54 }, () => ({
      type: 'glass',
      name: ' ',
      icon: '/textures/minecraft/gray_stained_glass_pane.png',
      rawItem: { cleanName: ' ', rawName: ' ', loreHtml: [] },
    }));

    // Row 1:
    // Slot 10 (Row 1, Col 1): Snowball (Season of Jerry)
    slots[10] = {
      id: 'season_of_jerry_1',
      name: 'Season of Jerry',
      icon: '/textures/minecraft/snowball.png',
      rawItem: {
        cleanName: 'Season of Jerry',
        formattedName: '<span style="color: #FF5555; font-weight: bold">Season of Jerry</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Starts in: </span><span style="color: #FFFF55">0d 14h 22m</span>',
          '<span style="color: #AAAAAA">Event lasts for </span><span style="color: #FFFF55">01h 00m 00s</span><span style="color: #AAAAAA">!</span>',
          '',
          '<span style="color: #AAAAAA">The Jerrys are hard at work trying</span>',
          '<span style="color: #AAAAAA">to craft enough Gifts for all of</span>',
          '<span style="color: #AAAAAA">SkyBlock, but an army of enemies are</span>',
          '<span style="color: #AAAAAA">on the attack! Help protect Jerry\'s</span>',
          '<span style="color: #AAAAAA">Workshop so that everyone can go</span>',
          '<span style="color: #AAAAAA">home with Gifts!</span>',
        ],
      },
    };

    // Slot 11 (Row 1, Col 2): New Year Cake (New Year Celebration)
    slots[11] = {
      id: 'new_year_1',
      name: 'New Year Celebration',
      icon: '/textures/minecraft/new_year_cake.png',
      rawItem: {
        cleanName: 'New Year Celebration',
        formattedName: '<span style="color: #FF55FF; font-weight: bold">New Year Celebration</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Starts in: </span><span style="color: #FFFF55">1d 02h 15m</span>',
          '<span style="color: #AAAAAA">Event lasts for </span><span style="color: #FFFF55">01h 00m 00s</span><span style="color: #AAAAAA">!</span>',
          '',
          '<span style="color: #AAAAAA">To celebrate the SkyBlock New Year,</span>',
          '<span style="color: #AAAAAA">the Baker is giving out free Cake!</span>',
        ],
      },
    };

    // Slot 12 (Row 1, Col 3): Skull (Traveling Zoo)
    slots[12] = {
      id: 'traveling_zoo_1',
      name: 'Traveling Zoo',
      icon: '/textures/minecraft/oringo_head.png',
      rawItem: {
        cleanName: 'Traveling Zoo',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Traveling Zoo</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Starts in: </span><span style="color: #FFFF55">1d 18h 40m</span>',
          '<span style="color: #AAAAAA">Event lasts for </span><span style="color: #FFFF55">01h 00m 00s</span><span style="color: #AAAAAA">!</span>',
          '',
          '<span style="color: #AAAAAA">Oringo the Traveling Zookeeper is</span>',
          '<span style="color: #AAAAAA">visiting SkyBlock with pets to trade!</span>',
        ],
      },
    };

    // Slot 13 (Row 1, Col 4): Jukebox (Election Booth Opens)
    slots[13] = {
      id: 'election_booth_1',
      name: 'Election Booth Opens',
      icon: '/textures/minecraft/jukebox.png',
      rawItem: {
        cleanName: 'Election Booth Opens',
        formattedName: '<span style="color: #55FFFF; font-weight: bold">Election Booth Opens</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Starts in: </span><span style="color: #FFFF55">2d 04h 30m</span>',
          '',
          '<span style="color: #AAAAAA">The Mayor election booth opens in</span>',
          '<span style="color: #AAAAAA">the community center!</span>',
        ],
      },
    };

    // Slot 14 (Row 1, Col 5): Farmer Head (Jacob's Farming Contest)
    slots[14] = {
      id: 'farming_contest_1',
      name: "Jacob's Farming Contest",
      icon: '/textures/minecraft/farmer_head.png',
      rawItem: {
        cleanName: "Jacob's Farming Contest",
        formattedName: "<span style=\"color: #FFAA00; font-weight: bold\">Jacob's Farming Contest</span>",
        loreHtml: [
          '<span style="color: #AAAAAA">Starts in: </span><span style="color: #FFFF55">0d 00h 42m</span>',
          '<span style="color: #AAAAAA">Event lasts for </span><span style="color: #FFFF55">20m 00s</span><span style="color: #AAAAAA">!</span>',
          '',
          '<span style="color: #AAAAAA">Compete with other farmers to collect</span>',
          '<span style="color: #AAAAAA">the most crops and win medals!</span>',
          '<span style="color: #FFFF55">Crops: Wheat, Carrot, Potato</span>',
        ],
      },
    };

    // Slot 15 (Row 1, Col 6): Jukebox (Election Over!)
    slots[15] = {
      id: 'election_over_1',
      name: 'Election Over!',
      icon: '/textures/minecraft/jukebox.png',
      rawItem: {
        cleanName: 'Election Over!',
        formattedName: '<span style="color: #55FFFF; font-weight: bold">Election Over!</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Starts in: </span><span style="color: #FFFF55">3d 08h 00m</span>',
          '',
          '<span style="color: #AAAAAA">The Mayor is selected until the next</span>',
          '<span style="color: #AAAAAA">election ends!</span>',
        ],
      },
    };

    // Slot 16 (Row 1, Col 7): Golden Hoe (Jacob's Farming Contest)
    slots[16] = {
      id: 'farming_contest_2',
      name: "Jacob's Farming Contest",
      icon: '/textures/minecraft/golden_hoe.png',
      rawItem: {
        cleanName: "Jacob's Farming Contest",
        formattedName: "<span style=\"color: #FFAA00; font-weight: bold\">Jacob's Farming Contest</span>",
        loreHtml: [
          '<span style="color: #AAAAAA">Starts in: </span><span style="color: #FFFF55">0d 01h 42m</span>',
          '<span style="color: #AAAAAA">Event lasts for </span><span style="color: #FFFF55">20m 00s</span><span style="color: #AAAAAA">!</span>',
          '',
          '<span style="color: #AAAAAA">Compete with other farmers to collect</span>',
          '<span style="color: #AAAAAA">the most crops and win medals!</span>',
          '<span style="color: #FFFF55">Crops: Sugar Cane, Nether Wart, Cocoa</span>',
        ],
      },
    };

    // Row 2:
    // Slot 19 (Row 2, Col 1): Jack o' Lantern (Spooky Festival)
    slots[19] = {
      id: 'spooky_festival',
      name: 'Spooky Festival',
      icon: '/textures/minecraft/jack_o_lantern.png',
      rawItem: {
        cleanName: 'Spooky Festival',
        formattedName: '<span style="color: #FFAA00; font-weight: bold">Spooky Festival</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Starts in: </span><span style="color: #FFFF55">3d 16h 50m</span>',
          '<span style="color: #AAAAAA">Event lasts for </span><span style="color: #FFFF55">01h 00m 00s</span><span style="color: #AAAAAA">!</span>',
          '',
          '<span style="color: #AAAAAA">Autumn is in full swing and the air is</span>',
          '<span style="color: #AAAAAA">full of fright. Mob drops have a</span>',
          '<span style="color: #AAAAAA">chance to contain Candy, which can</span>',
          '<span style="color: #AAAAAA">be traded with the Fear Mongerer</span>',
          '<span style="color: #AAAAAA">for rare items!</span>',
        ],
      },
    };

    // Slot 20 (Row 2, Col 2): Farmer Head (Jacob's Farming Contest)
    slots[20] = {
      id: 'farming_contest_3',
      name: "Jacob's Farming Contest",
      icon: '/textures/minecraft/farmer_head.png',
      rawItem: {
        cleanName: "Jacob's Farming Contest",
        formattedName: "<span style=\"color: #FFAA00; font-weight: bold\">Jacob's Farming Contest</span>",
        loreHtml: [
          '<span style="color: #AAAAAA">Starts in: </span><span style="color: #FFFF55">0d 02h 42m</span>',
          '<span style="color: #AAAAAA">Event lasts for </span><span style="color: #FFFF55">20m 00s</span><span style="color: #AAAAAA">!</span>',
          '',
          '<span style="color: #AAAAAA">Compete with other farmers to collect</span>',
          '<span style="color: #AAAAAA">the most crops and win medals!</span>',
          '<span style="color: #FFFF55">Crops: Melon, Pumpkin, Cactus</span>',
        ],
      },
    };

    // Slot 21 (Row 2, Col 3): Snowball (Season of Jerry)
    slots[21] = {
      id: 'season_of_jerry_2',
      name: 'Season of Jerry',
      icon: '/textures/minecraft/snowball.png',
      rawItem: {
        cleanName: 'Season of Jerry',
        formattedName: '<span style="color: #FF5555; font-weight: bold">Season of Jerry</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Starts in: </span><span style="color: #FFFF55">5d 14h 22m</span>',
          '<span style="color: #AAAAAA">Event lasts for </span><span style="color: #FFFF55">01h 00m 00s</span><span style="color: #AAAAAA">!</span>',
          '',
          '<span style="color: #AAAAAA">The Jerrys are hard at work trying</span>',
          '<span style="color: #AAAAAA">to craft enough Gifts for all of</span>',
          '<span style="color: #AAAAAA">SkyBlock, but an army of enemies are</span>',
          '<span style="color: #AAAAAA">on the attack! Help protect Jerry\'s</span>',
          '<span style="color: #AAAAAA">Workshop so that everyone can go</span>',
          '<span style="color: #AAAAAA">home with Gifts!</span>',
        ],
      },
    };

    // Slot 22 (Row 2, Col 4): New Year Cake (New Year Celebration)
    slots[22] = {
      id: 'new_year_2',
      name: 'New Year Celebration',
      icon: '/textures/minecraft/new_year_cake.png',
      rawItem: {
        cleanName: 'New Year Celebration',
        formattedName: '<span style="color: #FF55FF; font-weight: bold">New Year Celebration</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Starts in: </span><span style="color: #FFFF55">6d 02h 15m</span>',
          '<span style="color: #AAAAAA">Event lasts for </span><span style="color: #FFFF55">01h 00m 00s</span><span style="color: #AAAAAA">!</span>',
          '',
          '<span style="color: #AAAAAA">To celebrate the SkyBlock New Year,</span>',
          '<span style="color: #AAAAAA">the Baker is giving out free Cake!</span>',
        ],
      },
    };

    // Slot 23 (Row 2, Col 5): Skull (Traveling Zoo)
    slots[23] = {
      id: 'traveling_zoo_2',
      name: 'Traveling Zoo',
      icon: '/textures/minecraft/oringo_head.png',
      rawItem: {
        cleanName: 'Traveling Zoo',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Traveling Zoo</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Starts in: </span><span style="color: #FFFF55">6d 18h 40m</span>',
          '<span style="color: #AAAAAA">Event lasts for </span><span style="color: #FFFF55">01h 00m 00s</span><span style="color: #AAAAAA">!</span>',
          '',
          '<span style="color: #AAAAAA">Oringo the Traveling Zookeeper is</span>',
          '<span style="color: #AAAAAA">visiting SkyBlock with pets to trade!</span>',
        ],
      },
    };

    // Slot 24 (Row 2, Col 6): Jukebox (Election Booth Opens)
    slots[24] = {
      id: 'election_booth_2',
      name: 'Election Booth Opens',
      icon: '/textures/minecraft/jukebox.png',
      rawItem: {
        cleanName: 'Election Booth Opens',
        formattedName: '<span style="color: #55FFFF; font-weight: bold">Election Booth Opens</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Starts in: </span><span style="color: #FFFF55">7d 04h 30m</span>',
          '',
          '<span style="color: #AAAAAA">The Mayor election booth opens in</span>',
          '<span style="color: #AAAAAA">the community center!</span>',
        ],
      },
    };

    // Slot 25 (Row 2, Col 7): Farmer Head (Jacob's Farming Contest)
    slots[25] = {
      id: 'farming_contest_4',
      name: "Jacob's Farming Contest",
      icon: '/textures/minecraft/farmer_head.png',
      rawItem: {
        cleanName: "Jacob's Farming Contest",
        formattedName: "<span style=\"color: #FFAA00; font-weight: bold\">Jacob's Farming Contest</span>",
        loreHtml: [
          '<span style="color: #AAAAAA">Starts in: </span><span style="color: #FFFF55">0d 03h 42m</span>',
          '<span style="color: #AAAAAA">Event lasts for </span><span style="color: #FFFF55">20m 00s</span><span style="color: #AAAAAA">!</span>',
          '',
          '<span style="color: #AAAAAA">Compete with other farmers to collect</span>',
          '<span style="color: #AAAAAA">the most crops and win medals!</span>',
          '<span style="color: #FFFF55">Crops: Mushroom, Nether Wart, Wheat</span>',
        ],
      },
    };

    // Row 5:
    // Slot 45 (Row 5, Col 0): Gold Block (Event Rewards)
    slots[45] = {
      id: 'event_rewards',
      name: 'Event Rewards',
      icon: '/textures/minecraft/gold_block.png',
      rawItem: {
        cleanName: 'Event Rewards',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Event Rewards</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View and claim rewards obtained</span>',
          '<span style="color: #AAAAAA">through participating in Events!</span>',
          '',
          '<span style="color: #555555; font-style: italic">You have no rewards! Place</span>',
          '<span style="color: #555555; font-style: italic">atop Event Leaderboards to</span>',
          '<span style="color: #555555; font-style: italic">obtain cool rewards!</span>',
          '',
          '<span style="color: #FFFF55">Click to view!</span>',
        ],
      },
    };

    // Slot 46 (Row 5, Col 1): Mayor Head (Mayor Diana)
    slots[46] = {
      id: 'mayor_diana',
      name: 'Mayor Diana',
      icon: '/textures/minecraft/mayor_head.png',
      rawItem: {
        cleanName: 'Mayor Diana',
        formattedName: '<span style="color: #FFAA00; font-weight: bold">Mayor Diana</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Current elected Mayor of SkyBlock!</span>',
          '',
          '<span style="color: #FFFF55; font-weight: bold">Active Perks:</span>',
          '<span style="color: #55FF55">● Mythological Ritual</span>',
          '<span style="color: #AAAAAA">  Mayor Diana sells the Griffin Pet,</span>',
          '<span style="color: #AAAAAA">  which lets you find mythological</span>',
          '<span style="color: #AAAAAA">  creatures and burrows!</span>',
          '<span style="color: #55FF55">● Pet Exp Buff</span>',
          '<span style="color: #AAAAAA">  Gain 35% more Pet XP!</span>',
          '',
          '<span style="color: #555555">Next election begins soon.</span>',
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

    // Slot 50 (Row 5, Col 5): Clock (Calendar)
    slots[50] = {
      id: 'calendar_clock',
      name: 'Calendar',
      icon: '/textures/minecraft/clock.png',
      rawItem: {
        cleanName: 'Calendar',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Calendar</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Opens the full SkyBlock Calendar.</span>',
          '',
          '<span style="color: #FFFF55">Click to view!</span>',
        ],
      },
    };

    // Slot 51 (Row 5, Col 6): Chocolate Factory
    slots[51] = {
      id: 'chocolate_factory',
      name: 'Chocolate Factory',
      icon: '/textures/minecraft/chocolate_factory.png',
      rawItem: {
        cleanName: 'Chocolate Factory',
        formattedName: '<span style="color: #FFAA00; font-weight: bold">Chocolate Factory</span>',
        loreHtml: [
          '<span style="color: #55FF55">Hoppity the Rabbit </span><span style="color: #AAAAAA">needs help finding</span>',
          '<span style="color: #AAAAAA">all of his chocolate friends during</span>',
          '<span style="color: #AAAAAA">the </span><span style="color: #55FF55">Spring </span><span style="color: #AAAAAA">season.</span>',
          '',
          '<span style="color: #AAAAAA">Meanwhile, he has granted you</span>',
          '<span style="color: #AAAAAA">access to his </span><span style="color: #FFAA00">Chocolate Factory </span><span style="color: #AAAAAA">all</span>',
          '<span style="color: #AAAAAA">year round!</span>',
          '',
          '<span style="color: #555555; font-style: italic">In the future, everything is </span><span style="color: #FFFFFF">chrome</span>',
          '<span style="color: #555555; font-style: italic">and everything is </span><span style="color: #55FF55">automated</span><span style="color: #555555; font-style: italic">. For this</span>',
          '<span style="color: #555555; font-style: italic">little old factory, that future is </span><span style="color: #FF55FF">now</span><span style="color: #555555; font-style: italic">!</span>',
          '<span style="color: #555555; font-style: italic">This is what that guy was singing</span>',
          '<span style="color: #555555; font-style: italic">about in that </span><span style="color: #AA00AA">musical</span><span style="color: #555555; font-style: italic">.</span>',
        ],
      },
    };

    return slots;
  }, []);

  // Build the authentic 54-slot Storage container GUI matching in-game screenshot:
  const storageMenuSlots = useMemo(() => {
    const slots = Array.from({ length: 54 }, () => ({
      type: 'glass',
      name: ' ',
      icon: '/textures/minecraft/gray_stained_glass_pane.png',
      rawItem: { cleanName: ' ', rawName: ' ', loreHtml: [] },
    }));

    // Row 0:
    // Slot 4 (Row 0, Col 4): Ender Chest
    slots[4] = {
      id: 'ender_chest_overview',
      name: 'Ender Chest',
      icon: '/textures/minecraft/ender_chest.png',
      rawItem: {
        cleanName: 'Ender Chest',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Ender Chest</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Store global items that you want to</span>',
          '<span style="color: #AAAAAA">access at any time from anywhere</span>',
          '<span style="color: #AAAAAA">here.</span>',
        ],
      },
    };

    // Row 1: Ender Chest Pages
    // Slot 9 (Row 1, Col 0): Paper (Ender Chest Page 1 - Active)
    slots[9] = {
      id: 'ender_chest_page_1',
      name: 'Ender Chest Page 1',
      icon: '/textures/minecraft/paper.png',
      rawItem: {
        cleanName: 'Ender Chest Page 1',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Ender Chest Page 1</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Capacity: </span><span style="color: #55FF55">54 Slots</span>',
          '',
          '<span style="color: #55FF55">Currently viewing!</span>',
        ],
      },
    };

    // Slot 10 (Row 1, Col 1): Purple Stained Glass Pane (Ender Chest Page 2)
    slots[10] = {
      id: 'ender_chest_page_2',
      name: 'Ender Chest Page 2',
      count: 2,
      icon: '/textures/minecraft/purple_stained_glass_pane.png',
      rawItem: {
        cleanName: 'Ender Chest Page 2',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Ender Chest Page 2</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Capacity: </span><span style="color: #55FF55">54 Slots</span>',
          '',
          '<span style="color: #FFFF55">Click to open page!</span>',
        ],
      },
    };

    // Slot 11 (Row 1, Col 2): Purple Stained Glass Pane (Ender Chest Page 3)
    slots[11] = {
      id: 'ender_chest_page_3',
      name: 'Ender Chest Page 3',
      count: 3,
      icon: '/textures/minecraft/purple_stained_glass_pane.png',
      rawItem: {
        cleanName: 'Ender Chest Page 3',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Ender Chest Page 3</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Capacity: </span><span style="color: #55FF55">54 Slots</span>',
          '',
          '<span style="color: #FFFF55">Click to open page!</span>',
        ],
      },
    };

    // Slots 12 to 17 (Row 1, Cols 3-8): Red Stained Glass Pane (Locked Ender Chest Pages 4 to 9)
    for (let p = 4; p <= 9; p++) {
      const idx = 8 + p;
      slots[idx] = {
        id: `ender_chest_page_${p}`,
        name: `Ender Chest Page ${p}`,
        icon: '/textures/minecraft/red_stained_glass_pane.png',
        rawItem: {
          cleanName: `Ender Chest Page ${p}`,
          formattedName: `<span style="color: #FF5555; font-weight: bold">Ender Chest Page ${p}</span>`,
          loreHtml: [
            '<span style="color: #FF5555">Locked!</span>',
            '',
            '<span style="color: #AAAAAA">Unlock more Ender Chest pages at</span>',
            '<span style="color: #AAAAAA">the Community Shop!</span>',
          ],
        },
      };
    }

    // Row 2:
    // Slot 22 (Row 2, Col 4): Chest (Backpacks)
    slots[22] = {
      id: 'backpacks_overview',
      name: 'Backpacks',
      icon: '/textures/minecraft/storage.png',
      rawItem: {
        cleanName: 'Backpacks',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Backpacks</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Store backpacks that hold additional</span>',
          '<span style="color: #AAAAAA">items. Accessible from anywhere!</span>',
        ],
      },
    };

    // Row 3 & 4: Backpack Slots 1 to 18
    // Slots 27 to 42 (Backpack Slots 1 to 16): Brown Stained Glass Pane
    for (let b = 1; b <= 16; b++) {
      const slotIdx = 26 + b;
      slots[slotIdx] = {
        id: `backpack_slot_${b}`,
        name: `Backpack Slot ${b}`,
        count: b > 1 ? b : undefined,
        icon: '/textures/minecraft/brown_stained_glass_pane.png',
        rawItem: {
          cleanName: `Backpack Slot ${b}`,
          formattedName: `<span style="color: #55FF55; font-weight: bold">Backpack Slot ${b}</span>`,
          loreHtml: [
            '<span style="color: #AAAAAA">Place a backpack here to expand your</span>',
            '<span style="color: #AAAAAA">storage capacity!</span>',
            '',
            '<span style="color: #FFFF55">Click to open!</span>',
          ],
        },
      };
    }

    // Slot 43 (Row 4, Col 7): Locked Backpack Slot 17
    slots[43] = {
      id: 'backpack_slot_17',
      name: 'Backpack Slot 17',
      icon: '/textures/minecraft/locked_backpack.png',
      rawItem: {
        cleanName: 'Backpack Slot 17',
        formattedName: '<span style="color: #FF5555; font-weight: bold">Backpack Slot 17</span>',
        loreHtml: [
          '<span style="color: #FF5555">Locked Slot!</span>',
          '',
          '<span style="color: #AAAAAA">Unlock by finding more Fairy Souls</span>',
          '<span style="color: #AAAAAA">or progressing through SkyBlock!</span>',
        ],
      },
    };

    // Slot 44 (Row 4, Col 8): Locked Backpack Slot 18
    slots[44] = {
      id: 'backpack_slot_18',
      name: 'Backpack Slot 18',
      icon: '/textures/minecraft/locked_backpack.png',
      rawItem: {
        cleanName: 'Backpack Slot 18',
        formattedName: '<span style="color: #FF5555; font-weight: bold">Backpack Slot 18</span>',
        loreHtml: [
          '<span style="color: #FF5555">Locked Slot!</span>',
          '',
          '<span style="color: #AAAAAA">Unlock by finding more Fairy Souls</span>',
          '<span style="color: #AAAAAA">or progressing through SkyBlock!</span>',
        ],
      },
    };

    // Row 5:
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

    return slots;
  }, []);



// -------------------------------------------------------------
  // BAGS MENU SLOTS (Matches in-game screenshot media_1790527256023.png)
  // -------------------------------------------------------------
  const bagsMenuSlots = useMemo(() => {
    const slots = new Array(54).fill(null);
    for (let i = 0; i < 54; i++) {
      slots[i] = {
        type: 'glass',
        icon: '/textures/minecraft/gray_stained_glass_pane.png',
        rawItem: { rawName: ' ', formattedName: ' ', loreHtml: [] },
      };
    }

    // Slot 19 (Row 2, Col 1): Sack of Sacks
    slots[19] = {
      id: 'sack_of_sacks',
      name: 'Sack of Sacks',
      icon: '/textures/minecraft/sack_of_sacks.png',
      targetScreen: 'sack_of_sacks',
      rawItem: {
        cleanName: 'Sack of Sacks',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Sack of Sacks</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Store various sacks here to automatically</span>',
          '<span style="color: #AAAAAA">gather items when you collect them!</span>',
          '',
          '<span style="color: #555555">Also accessible via /sacks</span>',
          '',
          '<span style="color: #FFFF55">Click to open!</span>',
        ],
      },
    };

    // Slot 20 (Row 2, Col 2): Fishing Bag
    slots[20] = {
      id: 'fishing_bag',
      name: 'Fishing Bag',
      icon: '/textures/minecraft/fishing_bag_icon.png',
      targetScreen: 'fishing_bag',
      rawItem: {
        cleanName: 'Fishing Bag',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Fishing Bag</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Store your Fishing Baits here so</span>',
          '<span style="color: #AAAAAA">they can be used while fishing!</span>',
          '',
          '<span style="color: #555555">Also accessible via /fishingbag</span>',
          '',
          '<span style="color: #FFFF55">Click to open!</span>',
        ],
      },
    };

    // Slot 21 (Row 2, Col 3): Potion Bag
    slots[21] = {
      id: 'potion_bag',
      name: 'Potion Bag',
      icon: '/textures/minecraft/potion_bag_icon.png',
      targetScreen: 'potion_bag',
      rawItem: {
        cleanName: 'Potion Bag',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Potion Bag</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Store all your Potions here!</span>',
          '',
          '<span style="color: #555555">Also accessible via /potionbag</span>',
          '',
          '<span style="color: #FFFF55">Click to open!</span>',
        ],
      },
    };

    // Slot 23 (Row 2, Col 5): Quiver
    slots[23] = {
      id: 'quiver',
      name: 'Quiver',
      icon: '/textures/minecraft/quiver_icon.png',
      targetScreen: 'quiver',
      rawItem: {
        cleanName: 'Quiver',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Quiver</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Store all your Arrows here so you</span>',
          '<span style="color: #AAAAAA">never run out of ammunition!</span>',
          '',
          '<span style="color: #555555">Also accessible via /quiver</span>',
          '',
          '<span style="color: #FFFF55">Click to open!</span>',
        ],
      },
    };

    // Slot 24 (Row 2, Col 6): Accessory Bag
    slots[24] = {
      id: 'accessory_bag',
      name: 'Accessory Bag',
      icon: '/textures/minecraft/accessory_bag_icon.png',
      targetScreen: 'accessory_bag',
      rawItem: {
        cleanName: 'Accessory Bag',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Accessory Bag</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Store all your Accessories and</span>',
          '<span style="color: #AAAAAA">Talismans here to receive their</span>',
          '<span style="color: #AAAAAA">passive perks and stats!</span>',
          '',
          '<span style="color: #555555">Also accessible via /accessorybag</span>',
          '',
          '<span style="color: #FFFF55">Click to open!</span>',
        ],
      },
    };

    // Slot 25 (Row 2, Col 7): Time Pocket
    slots[25] = {
      id: 'time_pocket',
      name: 'Time Pocket',
      icon: '/textures/minecraft/time_pocket.png',
      targetScreen: 'time_pocket',
      rawItem: {
        cleanName: 'Time Pocket',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Time Pocket</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Keep track of island time and day cycles!</span>',
          '',
          '<span style="color: #FFFF55">Click to view!</span>',
        ],
      },
    };

    // Slot 48 (Row 5, Col 3): Go Back
    slots[48] = {
      id: 'back',
      name: 'Go Back',
      icon: '/textures/minecraft/arrow.png',
      targetScreen: 'menu',
      rawItem: {
        cleanName: 'Go Back',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Go Back</span>',
        loreHtml: ['<span style="color: #AAAAAA">To SkyBlock Menu</span>'],
      },
    };

    // Slot 49 (Row 5, Col 4): Close
    slots[49] = {
      id: 'close',
      name: 'Close',
      icon: '/textures/minecraft/barrier.png',
      action: 'close',
      rawItem: {
        cleanName: 'Close',
        formattedName: '<span style="color: #FF5555; font-weight: bold">Close</span>',
        loreHtml: ['<span style="color: #FFFF55">Click to close!</span>'],
      },
    };

    return slots;
  }, []);

  // -------------------------------------------------------------
  // ACCESSORY BAG SLOTS (Paginated 1/3, matches media_1790527384756.png)
  // -------------------------------------------------------------
  const accessoryBagSlots = useMemo(() => {
    const slots = new Array(54).fill(null);
    for (let i = 0; i < 54; i++) {
      slots[i] = {
        type: 'glass',
        icon: '/textures/minecraft/gray_stained_glass_pane.png',
        rawItem: { rawName: ' ', formattedName: ' ', loreHtml: [] },
      };
    }

    const talismanList = inventories.talismanBag || [];
    const totalAccessoryPages = Math.max(1, Math.min(3, Math.ceil(talismanList.length / 45)));
    const pageItems = talismanList.slice((accessoryBagPage - 1) * 45, accessoryBagPage * 45);

    // 45 item slots in rows 0-4
    for (let i = 0; i < 45; i++) {
      const item = pageItems[i];
      if (item && !item.empty) {
        slots[i] = {
          ...item,
          icon: getItemTexture(item),
          rawItem: item,
        };
      } else {
        slots[i] = {
          type: 'empty',
        };
      }
    }

    // Row 5 navigation
    slots[45] = { type: 'glass', icon: '/textures/minecraft/gray_stained_glass_pane.png', rawItem: { rawName: ' ' } };
    slots[46] = { type: 'glass', icon: '/textures/minecraft/gray_stained_glass_pane.png', rawItem: { rawName: ' ' } };
    slots[47] = { type: 'glass', icon: '/textures/minecraft/gray_stained_glass_pane.png', rawItem: { rawName: ' ' } };

    // Slot 48: Prev Page or Go Back
    if (accessoryBagPage > 1) {
      slots[48] = {
        id: 'prev_page',
        name: 'Previous Page',
        icon: '/textures/minecraft/arrow.png',
        action: 'prev_accessory_page',
        rawItem: {
          cleanName: 'Previous Page',
          formattedName: '<span style="color: #55FF55; font-weight: bold">Previous Page</span>',
          loreHtml: [`<span style="color: #AAAAAA">To Page ${accessoryBagPage - 1}</span>`],
        },
      };
    } else {
      slots[48] = {
        id: 'back',
        name: 'Go Back',
        icon: '/textures/minecraft/arrow.png',
        targetScreen: 'bags',
        rawItem: {
          cleanName: 'Go Back',
          formattedName: '<span style="color: #55FF55; font-weight: bold">Go Back</span>',
          loreHtml: ['<span style="color: #AAAAAA">To Your Bags</span>'],
        },
      };
    }

    // Slot 49: Close
    slots[49] = {
      id: 'close',
      name: 'Close',
      icon: '/textures/minecraft/barrier.png',
      action: 'close',
      rawItem: {
        cleanName: 'Close',
        formattedName: '<span style="color: #FF5555; font-weight: bold">Close</span>',
        loreHtml: ['<span style="color: #FFFF55">Click to close!</span>'],
      },
    };

    // Slot 50: Redstone Torch (Accessory Bag Tuning)
    slots[50] = {
      id: 'tuning',
      name: 'Accessory Bag Tuning',
      icon: '/textures/minecraft/redstone_torch.png',
      rawItem: {
        cleanName: 'Accessory Bag Tuning',
        formattedName: '<span style="color: #FF5555; font-weight: bold">Accessory Bag Tuning</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Configure your accessory tuning</span>',
          '<span style="color: #AAAAAA">and active stats at the Thaumaturgist!</span>',
          '',
          `<span style="color: #55FF55">Total Accessories: </span><span style="color: #FFAA00; font-weight: bold">${talismanList.length}</span>`,
        ],
      },
    };

    slots[51] = { type: 'glass', icon: '/textures/minecraft/gray_stained_glass_pane.png', rawItem: { rawName: ' ' } };
    slots[52] = { type: 'glass', icon: '/textures/minecraft/gray_stained_glass_pane.png', rawItem: { rawName: ' ' } };

    // Slot 53: Next Page
    if (accessoryBagPage < totalAccessoryPages) {
      slots[53] = {
        id: 'next_page',
        name: 'Next Page',
        icon: '/textures/minecraft/arrow.png',
        action: 'next_accessory_page',
        rawItem: {
          cleanName: 'Next Page',
          formattedName: '<span style="color: #55FF55; font-weight: bold">Next Page</span>',
          loreHtml: [`<span style="color: #AAAAAA">To Page ${accessoryBagPage + 1}</span>`],
        },
      };
    } else {
      slots[53] = { type: 'glass', icon: '/textures/minecraft/gray_stained_glass_pane.png', rawItem: { rawName: ' ' } };
    }

    return slots;
  }, [accessoryBagPage, inventories.talismanBag]);

  // -------------------------------------------------------------
  // FISHING BAG SLOTS (Matches in-game screenshot media_1790527427745.png)
  // -------------------------------------------------------------
  const fishingBagSlots = useMemo(() => {
    const slots = new Array(54).fill(null);
    for (let i = 0; i < 54; i++) {
      slots[i] = {
        type: 'glass',
        icon: '/textures/minecraft/gray_stained_glass_pane.png',
        rawItem: { rawName: ' ', formattedName: ' ', loreHtml: [] },
      };
    }

    const fishingList = inventories.fishingBag || [];
    for (let i = 0; i < 45; i++) {
      const item = fishingList[i];
      if (item && !item.empty) {
        slots[i] = {
          ...item,
          icon: getItemTexture(item),
          rawItem: item,
        };
      } else {
        slots[i] = { type: 'empty' };
      }
    }

    slots[48] = {
      id: 'back',
      name: 'Go Back',
      icon: '/textures/minecraft/arrow.png',
      targetScreen: 'bags',
      rawItem: {
        cleanName: 'Go Back',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Go Back</span>',
        loreHtml: ['<span style="color: #AAAAAA">To Your Bags</span>'],
      },
    };

    slots[49] = {
      id: 'close',
      name: 'Close',
      icon: '/textures/minecraft/barrier.png',
      action: 'close',
      rawItem: {
        cleanName: 'Close',
        formattedName: '<span style="color: #FF5555; font-weight: bold">Close</span>',
        loreHtml: ['<span style="color: #FFFF55">Click to close!</span>'],
      },
    };

    // Slot 50: Lime Dye (Auto-pickup Baits)
    slots[50] = {
      id: 'auto_baits',
      name: 'Auto-pickup Baits',
      icon: '/textures/minecraft/lime_dye.png',
      rawItem: {
        cleanName: 'Auto-pickup Baits',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Auto-pickup Baits</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Automatically sends baits to</span>',
          '<span style="color: #AAAAAA">your Fishing Bag when obtained.</span>',
          '',
          '<span style="color: #55FF55">Enabled</span>',
        ],
      },
    };

    return slots;
  }, [inventories.fishingBag]);

  // -------------------------------------------------------------
  // POTION BAG SLOTS
  // -------------------------------------------------------------
  const potionBagSlots = useMemo(() => {
    const slots = new Array(54).fill(null);
    for (let i = 0; i < 54; i++) {
      slots[i] = {
        type: 'glass',
        icon: '/textures/minecraft/gray_stained_glass_pane.png',
        rawItem: { rawName: ' ', formattedName: ' ', loreHtml: [] },
      };
    }

    const potionList = inventories.potionBag || [];
    for (let i = 0; i < 45; i++) {
      const item = potionList[i];
      if (item && !item.empty) {
        slots[i] = {
          ...item,
          icon: getItemTexture(item),
          rawItem: item,
        };
      } else {
        slots[i] = { type: 'empty' };
      }
    }

    slots[48] = {
      id: 'back',
      name: 'Go Back',
      icon: '/textures/minecraft/arrow.png',
      targetScreen: 'bags',
      rawItem: {
        cleanName: 'Go Back',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Go Back</span>',
        loreHtml: ['<span style="color: #AAAAAA">To Your Bags</span>'],
      },
    };

    slots[49] = {
      id: 'close',
      name: 'Close',
      icon: '/textures/minecraft/barrier.png',
      action: 'close',
      rawItem: {
        cleanName: 'Close',
        formattedName: '<span style="color: #FF5555; font-weight: bold">Close</span>',
        loreHtml: ['<span style="color: #FFFF55">Click to close!</span>'],
      },
    };

    slots[50] = {
      id: 'auto_potions',
      name: 'Auto-pickup Potions',
      icon: '/textures/minecraft/potion_bag_icon.png',
      rawItem: {
        cleanName: 'Auto-pickup Potions',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Auto-pickup Potions</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Automatically sends brewed or collected</span>',
          '<span style="color: #AAAAAA">potions to your Potion Bag.</span>',
          '',
          '<span style="color: #55FF55">Enabled</span>',
        ],
      },
    };

    return slots;
  }, [inventories.potionBag]);

  // -------------------------------------------------------------
  // QUIVER SLOTS
  // -------------------------------------------------------------
  const quiverSlots = useMemo(() => {
    const slots = new Array(54).fill(null);
    for (let i = 0; i < 54; i++) {
      slots[i] = {
        type: 'glass',
        icon: '/textures/minecraft/gray_stained_glass_pane.png',
        rawItem: { rawName: ' ', formattedName: ' ', loreHtml: [] },
      };
    }

    const quiverList = inventories.quiver || [];
    for (let i = 0; i < 45; i++) {
      const item = quiverList[i];
      if (item && !item.empty) {
        slots[i] = {
          ...item,
          icon: getItemTexture(item),
          rawItem: item,
        };
      } else {
        slots[i] = { type: 'empty' };
      }
    }

    // Default arrows if empty in API
    if (quiverList.length === 0 || quiverList.every(q => !q || q.empty)) {
      slots[0] = {
        id: 'arrow',
        cleanName: 'Flint Arrow',
        count: 64,
        icon: '/textures/minecraft/arrow.png',
        rawItem: {
          cleanName: 'Flint Arrow',
          count: 64,
          formattedName: '<span style="color: #FFFFFF; font-weight: bold">Flint Arrow</span>',
          loreHtml: ['<span style="color: #AAAAAA">Damage: </span><span style="color: #FF5555">+0</span>'],
        },
      };
      slots[1] = {
        id: 'toxic_arrow_poison',
        cleanName: 'Toxic Arrow Poison',
        count: 64,
        icon: '/textures/minecraft/potion_bag_icon.png',
        rawItem: {
          cleanName: 'Toxic Arrow Poison',
          count: 64,
          formattedName: '<span style="color: #55FF55; font-weight: bold">Toxic Arrow Poison</span>',
          loreHtml: ['<span style="color: #AAAAAA">Deals extra damage to poisoned targets.</span>'],
        },
      };
    }

    slots[48] = {
      id: 'back',
      name: 'Go Back',
      icon: '/textures/minecraft/arrow.png',
      targetScreen: 'bags',
      rawItem: {
        cleanName: 'Go Back',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Go Back</span>',
        loreHtml: ['<span style="color: #AAAAAA">To Your Bags</span>'],
      },
    };

    slots[49] = {
      id: 'close',
      name: 'Close',
      icon: '/textures/minecraft/barrier.png',
      action: 'close',
      rawItem: {
        cleanName: 'Close',
        formattedName: '<span style="color: #FF5555; font-weight: bold">Close</span>',
        loreHtml: ['<span style="color: #FFFF55">Click to close!</span>'],
      },
    };

    slots[50] = {
      id: 'priority',
      name: 'Quiver Arrow Priority',
      icon: '/textures/minecraft/arrow_swapper.png',
      rawItem: {
        cleanName: 'Quiver Arrow Priority',
        formattedName: '<span style="color: #FFAA00; font-weight: bold">Quiver Arrow Priority</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Select which arrows your bow uses first.</span>',
          '',
          '<span style="color: #FFAA00">Current: </span><span style="color: #FFFFFF">Flint Arrow</span>',
        ],
      },
    };

    return slots;
  }, [inventories.quiver]);

  // -------------------------------------------------------------
  // SACK OF SACKS SLOTS (Matches in-game screenshot media_1790527460955.png)
  // -------------------------------------------------------------
  const sackOfSacksSlots = useMemo(() => {
    const slots = new Array(54).fill(null);
    for (let i = 0; i < 54; i++) {
      slots[i] = { type: 'empty' };
    }

    // Locked slots matching screenshot
    const lockedSlots = [33, 34, 35, 36, 37, 38, 42, 43, 44, 45, 46, 47, 51, 52, 53];
    for (const idx of lockedSlots) {
      slots[idx] = {
        type: 'glass',
        icon: '/textures/minecraft/gray_stained_glass_pane.png',
        rawItem: { rawName: ' ', formattedName: ' ', loreHtml: [] },
      };
    }

    const playerSacks = (inventories.sacks || []).filter(s => s && !s.empty);
    if (playerSacks.length > 0) {
      let slotIdx = 0;
      for (const sack of playerSacks) {
        while (lockedSlots.includes(slotIdx) || slotIdx === 48 || slotIdx === 49 || slotIdx === 50) {
          slotIdx++;
          if (slotIdx >= 54) break;
        }
        if (slotIdx >= 54) break;
        slots[slotIdx] = {
          ...sack,
          icon: getItemTexture(sack) || '/textures/minecraft/sack_of_sacks.png',
          rawItem: sack,
        };
        slotIdx++;
      }
    } else {
      // Default authentic 12 sacks matching screenshot
      const defaultSacks = [
        { name: 'Large Agronomy Sack', icon: '/textures/minecraft/sack_agronomy.png', capacity: '20,160', items: 'Wheat, Carrot, Potato, Pumpkin, Melon, Sugar Cane, Cactus, Nether Wart, Mushroom' },
        { name: 'Large Combat Sack', icon: '/textures/minecraft/sack_combat.png', capacity: '20,160', items: 'Rotten Flesh, Bone, String, Spider Eye, Gunpowder, Ender Pearl, Slimeball, Magma Cream' },
        { name: 'Large Mining Sack', icon: '/textures/minecraft/sack_mining.png', capacity: '20,160', items: 'Cobblestone, Coal, Iron, Gold, Diamond, Emerald, Lapis Lazuli, Redstone, Obsidian' },
        { name: 'Large Foraging Sack', icon: '/textures/minecraft/sack_foraging.png', capacity: '20,160', items: 'Oak Wood, Spruce Wood, Birch Wood, Jungle Wood, Acacia Wood, Dark Oak Wood' },
        { name: 'Large Fishing Sack', icon: '/textures/minecraft/sack_fishing.png', capacity: '20,160', items: 'Raw Fish, Salmon, Clownfish, Pufferfish, Prismarine Shard, Crystals, Sponge' },
        { name: 'Large Enchanting Sack', icon: '/textures/minecraft/sack_enchanting.png', capacity: '20,160', items: 'Bottle o\' Enchanting, Grand EXP Bottle, Titanic EXP Bottle' },
        { name: 'Large Nether Sack', icon: '/textures/minecraft/sack_nether.png', capacity: '20,160', items: 'Netherrack, Soul Sand, Quartz, Glowstone, Magma Cream, Blaze Rod, Ghast Tear' },
        { name: 'Large Slayer Sack', icon: '/textures/minecraft/sack_slayer.png', capacity: '20,160', items: 'Revenant Flesh, Tarantula Web, Toxic Arrow Poison, Wolf Tooth, Golden Tooth' },
        { name: 'Large Gemstone Sack', icon: '/textures/minecraft/sack_gemstone.png', capacity: '20,160', items: 'Ruby, Amber, Sapphire, Jade, Amethyst, Topaz, Jasper, Opal Gemstones' },
        { name: 'Large Husbandry Sack', icon: '/textures/minecraft/sack_husbandry.png', capacity: '20,160', items: 'Leather, Beef, Porkchop, Chicken, Mutton, Rabbit, Feather, Egg' },
        { name: 'Large Rune Sack', icon: '/textures/minecraft/sack_rune.png', capacity: '64 runes each', items: 'Blood Rune, Rainbow Rune, Music Rune, Snake Rune, White Spiral Rune' },
        { name: 'Large Dungeon Sack', icon: '/textures/minecraft/sack_dungeon.png', capacity: '20,160', items: 'Wither Essence, Undead Essence, Dragon Essence, Ice Essence, Spider Essence' },
      ];

      defaultSacks.forEach((s, i) => {
        slots[i] = {
          id: `sack_${i}`,
          name: s.name,
          icon: s.icon,
          rawItem: {
            cleanName: s.name,
            formattedName: `<span style="color: #5555FF; font-weight: bold">${s.name}</span>`,
            loreHtml: [
              `<span style="color: #AAAAAA">Capacity: </span><span style="color: #FFAA00">${s.capacity} items each</span>`,
              `<span style="color: #AAAAAA">Items: </span><span style="color: #55FF55">${s.items}</span>`,
              '',
              '<span style="color: #5555FF; font-weight: bold">RARE SACK</span>',
            ],
          },
        };
      });
    }

    slots[48] = {
      id: 'back',
      name: 'Go Back',
      icon: '/textures/minecraft/arrow.png',
      targetScreen: 'bags',
      rawItem: {
        cleanName: 'Go Back',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Go Back</span>',
        loreHtml: ['<span style="color: #AAAAAA">To Your Bags</span>'],
      },
    };

    slots[49] = {
      id: 'close',
      name: 'Close',
      icon: '/textures/minecraft/barrier.png',
      action: 'close',
      rawItem: {
        cleanName: 'Close',
        formattedName: '<span style="color: #FF5555; font-weight: bold">Close</span>',
        loreHtml: ['<span style="color: #FFFF55">Click to close!</span>'],
      },
    };

    slots[50] = {
      id: 'sort_sacks',
      name: 'Sort Sacks',
      icon: '/textures/minecraft/storage.png',
      rawItem: {
        cleanName: 'Sort Sacks',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Sort Sacks</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Sort all sacks in your Sack of Sacks.</span>',
          '',
          '<span style="color: #FFFF55">Click to sort!</span>',
        ],
      },
    };

    return slots;
  }, [inventories.sacks]);

  // -------------------------------------------------------------
  // TIME POCKET SLOTS
  // -------------------------------------------------------------
  const timePocketSlots = useMemo(() => {
    const slots = new Array(54).fill(null);
    for (let i = 0; i < 54; i++) {
      slots[i] = {
        type: 'glass',
        icon: '/textures/minecraft/gray_stained_glass_pane.png',
        rawItem: { rawName: ' ', formattedName: ' ', loreHtml: [] },
      };
    }

    slots[22] = {
      id: 'time',
      name: 'Current Island Time',
      icon: '/textures/minecraft/calendar.png',
      rawItem: {
        cleanName: 'Current Island Time',
        formattedName: '<span style="color: #FFAA00; font-weight: bold">Current Island Time</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Time: </span><span style="color: #55FF55">11:42 am</span>',
          '<span style="color: #AAAAAA">Day: </span><span style="color: #55FFFF">17th Early Winter 516</span>',
          '<span style="color: #AAAAAA">Weather: </span><span style="color: #FFAA00">Clear Skies</span>',
        ],
      },
    };

    slots[48] = {
      id: 'back',
      name: 'Go Back',
      icon: '/textures/minecraft/arrow.png',
      targetScreen: 'bags',
      rawItem: {
        cleanName: 'Go Back',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Go Back</span>',
        loreHtml: ['<span style="color: #AAAAAA">To Your Bags</span>'],
      },
    };

    slots[49] = {
      id: 'close',
      name: 'Close',
      icon: '/textures/minecraft/barrier.png',
      action: 'close',
      rawItem: {
        cleanName: 'Close',
        formattedName: '<span style="color: #FF5555; font-weight: bold">Close</span>',
        loreHtml: ['<span style="color: #FFFF55">Click to close!</span>'],
      },
    };

    return slots;
  }, []);

  // -------------------------------------------------------------
  // PETS MENU SLOTS (Matches in-game screenshot media_1790527488275.png)
  // -------------------------------------------------------------
  const petsMenuSlots = useMemo(() => {
    const slots = new Array(54).fill(null);
    for (let i = 0; i < 54; i++) {
      slots[i] = {
        type: 'glass',
        icon: '/textures/minecraft/gray_stained_glass_pane.png',
        rawItem: { rawName: ' ', formattedName: ' ', loreHtml: [] },
      };
    }

    // Row 0
    slots[4] = {
      id: 'pets_info',
      name: 'Pets',
      icon: '/textures/minecraft/pets.png',
      rawItem: {
        cleanName: 'Pets',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Pets</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View and manage all of your Pets.</span>',
          '',
          `<span style="color: #AAAAAA">Selected pet: </span><span style="color: #FFAA00">${activePet ? activePet.cleanName : 'None'}</span>`,
        ],
      },
    };

    slots[7] = {
      id: 'pet_score',
      name: 'Pet Score',
      icon: '/textures/minecraft/pets/pet_score.png',
      rawItem: {
        cleanName: 'Pet Score',
        formattedName: '<span style="color: #FFAA00; font-weight: bold">Pet Score</span>',
        loreHtml: [
          `<span style="color: #AAAAAA">Your Pet Score: </span><span style="color: #FFAA00; font-weight: bold">${pets.length * 2}</span>`,
          '<span style="color: #AAAAAA">Earn Magic Find rewards for higher score!</span>',
        ],
      },
    };

    slots[8] = {
      id: 'convert',
      name: 'Convert Pet to Item',
      icon: '/textures/minecraft/diamond.png',
      rawItem: {
        cleanName: 'Convert Pet to Item',
        formattedName: '<span style="color: #55FFFF; font-weight: bold">Convert Pet to Item</span>',
        loreHtml: ['<span style="color: #AAAAAA">Convert a summoned pet into an inventory item.</span>'],
      },
    };

    // Interior slots: 28 pets per page (4 rows x 7 cols)
    const petSlotsIndices = [
      10, 11, 12, 13, 14, 15, 16,
      19, 20, 21, 22, 23, 24, 25,
      28, 29, 30, 31, 32, 33, 34,
      37, 38, 39, 40, 41, 42, 43
    ];

    const totalPetPages = Math.max(1, Math.ceil(pets.length / 28));
    const pagePets = pets.slice((petsPage - 1) * 28, petsPage * 28);

    petSlotsIndices.forEach((slotIdx, i) => {
      const pet = pagePets[i];
      if (pet) {
        const iconUrl = getPetIcon(pet);
        const tierColor = PET_TIER_COLORS[pet.tier] || '#FFAA00';
        const isSummoned = Boolean(pet.active);
        const xpInfo = calculatePetLevel(pet.exp || 0, pet.tier);
        const lvl = pet.level || xpInfo.level || 1;
        const displayName = `[Lvl ${lvl}] ${pet.cleanName}`;
        const petLore = generatePetLore({ ...pet, level: lvl });

        slots[slotIdx] = {
          id: `pet_${i}`,
          name: displayName,
          icon: iconUrl,
          rawItem: {
            cleanName: displayName,
            formattedName: `<span style="color: ${tierColor}; font-weight: bold">${displayName}${isSummoned ? ' ✦' : ''}</span>`,
            loreHtml: petLore,
          },
        };
      } else {
        slots[slotIdx] = { type: 'empty' };
      }
    });

    // Row 5: Exact mapping matching media_1790527488275.png
    // Slot 45 & 46: Gray Glass Pane (already set)

    // Slot 47: Diamond (col 2)
    slots[47] = {
      id: 'hide_pets',
      name: 'Hide Pets',
      icon: '/textures/minecraft/diamond.png',
      rawItem: {
        cleanName: 'Hide Pets',
        formattedName: '<span style="color: #55FFFF; font-weight: bold">Hide Pets</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Hide other players\' pets in public</span>',
          '<span style="color: #AAAAAA">islands to reduce lag and clutter.</span>',
          '',
          '<span style="color: #55FF55">Currently: Showing all pets!</span>',
          '',
          '<span style="color: #FFFF55">Click to toggle!</span>',
        ],
      },
    };

    // Slot 48: Arrow (col 3) - Go Back on Page 1 / Previous Page on Page > 1
    if (petsPage > 1) {
      slots[48] = {
        id: 'prev_pets',
        name: 'Previous Page',
        icon: '/textures/minecraft/arrow.png',
        action: 'prev_pets_page',
        rawItem: {
          cleanName: 'Previous Page',
          formattedName: '<span style="color: #55FF55; font-weight: bold">Previous Page</span>',
          loreHtml: [`<span style="color: #AAAAAA">To Page ${petsPage - 1}</span>`],
        },
      };
    } else {
      slots[48] = {
        id: 'back',
        name: 'Go Back',
        icon: '/textures/minecraft/arrow.png',
        targetScreen: 'menu',
        rawItem: {
          cleanName: 'Go Back',
          formattedName: '<span style="color: #55FF55; font-weight: bold">Go Back</span>',
          loreHtml: ['<span style="color: #AAAAAA">To SkyBlock Menu</span>'],
        },
      };
    }

    // Slot 49: Barrier (col 4) - Close
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

    // Slot 50: Oak Sign (col 5) - Sort Pets
    slots[50] = {
      id: 'sort_pets',
      name: 'Sort Pets',
      icon: '/textures/minecraft/oak_sign.png',
      rawItem: {
        cleanName: 'Sort Pets',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Sort Pets</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Change the sorting order of your pets.</span>',
          '',
          '<span style="color: #55FF55">Currently: Favorite > Rarity > Level</span>',
          '',
          '<span style="color: #FFFF55">Click to change sort!</span>',
        ],
      },
    };

    // Slot 51: Stone Button (col 6) - Filter Pets
    slots[51] = {
      id: 'filter_pets',
      name: 'Filter Pets',
      icon: '/textures/minecraft/stone_button.png',
      rawItem: {
        cleanName: 'Filter Pets',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Filter Pets</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Filter which pets are displayed.</span>',
          '',
          '<span style="color: #55FF55">Currently: Show all pets</span>',
          '',
          '<span style="color: #FFFF55">Click to filter!</span>',
        ],
      },
    };

    // Slot 52: Hopper (col 7) - Pet Settings
    slots[52] = {
      id: 'pet_settings',
      name: 'Pet Settings',
      icon: '/textures/minecraft/hopper.png',
      rawItem: {
        cleanName: 'Pet Settings',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Pet Settings</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Configure visibility and auto-equip</span>',
          '<span style="color: #AAAAAA">rules for your pets.</span>',
          '',
          '<span style="color: #FFFF55">Click to view settings!</span>',
        ],
      },
    };

    // Slot 53: Arrow (col 8) - Next Page (if more pages)
    if (petsPage < totalPetPages) {
      slots[53] = {
        id: 'next_pets',
        name: 'Next Page',
        icon: '/textures/minecraft/arrow.png',
        action: 'next_pets_page',
        rawItem: {
          cleanName: 'Next Page',
          formattedName: '<span style="color: #55FF55; font-weight: bold">Next Page</span>',
          loreHtml: [`<span style="color: #AAAAAA">To Page ${petsPage + 1}</span>`],
        },
      };
    }

    return slots;
  }, [pets, petsPage, activePet]);

  // -------------------------------------------------------------
  // WARDROBE / LOADOUTS MENU SLOTS (Matches in-game screenshot media_1790527557142.png)
  // -------------------------------------------------------------
  const wardrobeMenuSlots = useMemo(() => {
    const slots = new Array(54).fill(null);
    for (let i = 0; i < 54; i++) {
      slots[i] = {
        type: 'glass',
        icon: '/textures/minecraft/gray_stained_glass_pane.png',
        rawItem: { rawName: ' ', formattedName: ' ', loreHtml: [] },
      };
    }

    // Left Column 0: Special Loadout Features & Settings
    slots[9] = {
      id: 'equipment_bag',
      name: 'Equipment Bag',
      icon: '/textures/minecraft/loadout_icon_equipment.png',
      rawItem: {
        cleanName: 'Equipment Bag',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Equipment Bag</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View your extra equipment storage</span>',
          '<span style="color: #AAAAAA">and available sets.</span>',
          '',
          '<span style="color: #FFFF55">Click to view!</span>',
        ],
      },
    };

    slots[18] = {
      id: 'thaumaturgist_power',
      name: 'Thaumaturgist Power',
      icon: '/textures/minecraft/loadout_icon_power.png',
      rawItem: {
        cleanName: 'Thaumaturgist Power',
        formattedName: '<span style="color: #FF55FF; font-weight: bold">Accessory Bag Power</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Active Power: </span><span style="color: #FF55FF">Hurtful</span>',
          '<span style="color: #AAAAAA">Tuning Points: </span><span style="color: #55FF55">52/52</span>',
          '',
          '<span style="color: #FFFF55">Click to tune power!</span>',
        ],
      },
    };

    slots[27] = {
      id: 'combat_deployable',
      name: 'Combat Deployable',
      icon: '/textures/minecraft/loadout_icon_deployable.png',
      rawItem: {
        cleanName: 'Combat Deployable',
        formattedName: '<span style="color: #55FFFF; font-weight: bold">Combat Deployable</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Active Deployable: </span><span style="color: #55FF55">Plasmaflux Power Orb</span>',
          '',
          '<span style="color: #FFFF55">Click to swap!</span>',
        ],
      },
    };

    slots[36] = {
      id: 'auto_equip_rules',
      name: 'Auto-equip Rules',
      icon: '/textures/minecraft/loadout_icon_rules.png',
      rawItem: {
        cleanName: 'Auto-equip Rules',
        formattedName: '<span style="color: #FF5555; font-weight: bold">Auto-equip Rules</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Configure automatic loadout swaps</span>',
          '<span style="color: #AAAAAA">based on your current activity</span>',
          '<span style="color: #AAAAAA">(Dungeons, Crimson Isle, Mining).</span>',
          '',
          '<span style="color: #FFFF55">Click to configure!</span>',
        ],
      },
    };

    // Loadout preset configurations
    const presets = {
      1: {
        armor: [
          (inventories.armor || [])[0] || { name: 'Wither Goggles', cleanName: 'Wither Goggles', formattedName: '<span style="color: #FFAA00; font-weight: bold">Wither Goggles</span>', icon: '/textures/minecraft/loadout_slot_2.png' },
          (inventories.armor || [])[1] || { name: "Storm's Chestplate", cleanName: "Storm's Chestplate", formattedName: '<span style="color: #FF55FF; font-weight: bold">Storm\'s Chestplate</span>', icon: '/textures/minecraft/leather_chestplate.png' },
          (inventories.armor || [])[2] || { name: "Storm's Leggings", cleanName: "Storm's Leggings", formattedName: '<span style="color: #FF55FF; font-weight: bold">Storm\'s Leggings</span>', icon: '/textures/minecraft/diamond_leggings.png' },
          (inventories.armor || [])[3] || { name: "Storm's Boots", cleanName: "Storm's Boots", formattedName: '<span style="color: #FF55FF; font-weight: bold">Storm\'s Boots</span>', icon: '/textures/minecraft/diamond_boots.png' },
        ],
        equipment: [
          (inventories.equipment || [])[0] || { name: 'Molten Necklace', cleanName: 'Molten Necklace', formattedName: '<span style="color: #FFAA00; font-weight: bold">Molten Necklace</span>', icon: '/textures/minecraft/equipment/molten_necklace.png' },
          (inventories.equipment || [])[1] || { name: 'Molten Cloak', cleanName: 'Molten Cloak', formattedName: '<span style="color: #FFAA00; font-weight: bold">Molten Cloak</span>', icon: '/textures/minecraft/equipment/molten_cloak.png' },
          (inventories.equipment || [])[2] || { name: 'Implosion Belt', cleanName: 'Implosion Belt', formattedName: '<span style="color: #FFAA00; font-weight: bold">Implosion Belt</span>', icon: '/textures/minecraft/safari_belt.png' },
          (inventories.equipment || [])[3] || { name: 'Gauntlet of Contagion', cleanName: 'Gauntlet of Contagion', formattedName: '<span style="color: #FFAA00; font-weight: bold">Gauntlet of Contagion</span>', icon: '/textures/minecraft/equipment/gauntlet_of_contagion.png' },
        ],
        pet: activePet || {
          name: '[Lvl 100] Sheep',
          icon: '/textures/minecraft/pets/sheep.png',
          formattedName: '<span style="color: #FFAA00; font-weight: bold">[Lvl 100] Sheep</span>',
          loreHtml: ['<span style="color: #AAAAAA">Alchemy Pet</span>', '', '<span style="color: #55FF55">Currently Summoned!</span>'],
        },
      },
      2: {
        armor: [
          { name: "Necron's Helmet", cleanName: "Necron's Helmet", formattedName: '<span style="color: #FF55FF; font-weight: bold">Necron\'s Helmet</span>', icon: '/textures/minecraft/necron_helmet.png' },
          { name: "Necron's Chestplate", cleanName: "Necron's Chestplate", formattedName: '<span style="color: #FF55FF; font-weight: bold">Necron\'s Chestplate</span>', icon: '/textures/minecraft/necron_chestplate.png' },
          { name: "Necron's Leggings", cleanName: "Necron's Leggings", formattedName: '<span style="color: #FF55FF; font-weight: bold">Necron\'s Leggings</span>', icon: '/textures/minecraft/necron_leggings.png' },
          { name: "Necron's Boots", cleanName: "Necron's Boots", formattedName: '<span style="color: #FF55FF; font-weight: bold">Necron\'s Boots</span>', icon: '/textures/minecraft/necron_boots.png' },
        ],
        equipment: [
          { name: 'Bone Necklace', cleanName: 'Bone Necklace', formattedName: '<span style="color: #FFAA00; font-weight: bold">Bone Necklace</span>', icon: '/textures/minecraft/equipment/molten_necklace.png' },
          { name: 'Shadow Assassin Cloak', cleanName: 'Shadow Assassin Cloak', formattedName: '<span style="color: #FFAA00; font-weight: bold">Shadow Assassin Cloak</span>', icon: '/textures/minecraft/equipment/molten_cloak.png' },
          { name: 'Tarantula Belt', cleanName: 'Tarantula Belt', formattedName: '<span style="color: #FFAA00; font-weight: bold">Tarantula Belt</span>', icon: '/textures/minecraft/safari_belt.png' },
          { name: 'Gauntlet of Contagion', cleanName: 'Gauntlet of Contagion', formattedName: '<span style="color: #FFAA00; font-weight: bold">Gauntlet of Contagion</span>', icon: '/textures/minecraft/equipment/gauntlet_of_contagion.png' },
        ],
        pet: {
          name: '[Lvl 100] Wither Skeleton',
          icon: '/textures/minecraft/pets/wither_skeleton.png',
          formattedName: '<span style="color: #FFAA00; font-weight: bold">[Lvl 100] Wither Skeleton</span>',
          loreHtml: ['<span style="color: #AAAAAA">Mining Pet</span>', '', '<span style="color: #55FF55">Currently Summoned!</span>'],
        },
      },
      3: {
        armor: [
          { name: "Maxor's Helmet", cleanName: "Maxor's Helmet", formattedName: '<span style="color: #FF55FF; font-weight: bold">Maxor\'s Helmet</span>', icon: '/textures/minecraft/maxor_helmet.png' },
          { name: "Maxor's Chestplate", cleanName: "Maxor's Chestplate", formattedName: '<span style="color: #FF55FF; font-weight: bold">Maxor\'s Chestplate</span>', icon: '/textures/minecraft/maxor_chestplate.png' },
          { name: "Maxor's Leggings", cleanName: "Maxor's Leggings", formattedName: '<span style="color: #FF55FF; font-weight: bold">Maxor\'s Leggings</span>', icon: '/textures/minecraft/maxor_leggings.png' },
          { name: "Maxor's Boots", cleanName: "Maxor's Boots", formattedName: '<span style="color: #FF55FF; font-weight: bold">Maxor\'s Boots</span>', icon: '/textures/minecraft/maxor_boots.png' },
        ],
        equipment: [
          { name: 'Molten Necklace', cleanName: 'Molten Necklace', formattedName: '<span style="color: #FFAA00; font-weight: bold">Molten Necklace</span>', icon: '/textures/minecraft/equipment/molten_necklace.png' },
          { name: 'Molten Cloak', cleanName: 'Molten Cloak', formattedName: '<span style="color: #FFAA00; font-weight: bold">Molten Cloak</span>', icon: '/textures/minecraft/equipment/molten_cloak.png' },
          { name: 'Implosion Belt', cleanName: 'Implosion Belt', formattedName: '<span style="color: #FFAA00; font-weight: bold">Implosion Belt</span>', icon: '/textures/minecraft/safari_belt.png' },
          { name: 'Gauntlet of Contagion', cleanName: 'Gauntlet of Contagion', formattedName: '<span style="color: #FFAA00; font-weight: bold">Gauntlet of Contagion</span>', icon: '/textures/minecraft/equipment/gauntlet_of_contagion.png' },
        ],
        pet: {
          name: '[Lvl 100] Black Cat',
          icon: '/textures/minecraft/pets/enderman.png',
          formattedName: '<span style="color: #FFAA00; font-weight: bold">[Lvl 100] Black Cat</span>',
          loreHtml: ['<span style="color: #AAAAAA">Combat Pet</span>', '', '<span style="color: #55FF55">Currently Summoned!</span>'],
        },
      },
      4: {
        armor: [
          { name: "Divan's Helmet", cleanName: "Divan's Helmet", formattedName: '<span style="color: #FF55FF; font-weight: bold">Divan\'s Helmet</span>', icon: '/textures/minecraft/diamond_helmet.png' },
          { name: "Divan's Chestplate", cleanName: "Divan's Chestplate", formattedName: '<span style="color: #FF55FF; font-weight: bold">Divan\'s Chestplate</span>', icon: '/textures/minecraft/diamond_chestplate.png' },
          { name: "Divan's Leggings", cleanName: "Divan's Leggings", formattedName: '<span style="color: #FF55FF; font-weight: bold">Divan\'s Leggings</span>', icon: '/textures/minecraft/diamond_leggings.png' },
          { name: "Divan's Boots", cleanName: "Divan's Boots", formattedName: '<span style="color: #FF55FF; font-weight: bold">Divan\'s Boots</span>', icon: '/textures/minecraft/diamond_boots.png' },
        ],
        equipment: [
          { name: "Divan's Pendant", cleanName: "Divan's Pendant", formattedName: '<span style="color: #FF55FF; font-weight: bold">Divan\'s Pendant</span>', icon: '/textures/minecraft/equipment/divan_pendant.png' },
          { name: 'Molten Cloak', cleanName: 'Molten Cloak', formattedName: '<span style="color: #FFAA00; font-weight: bold">Molten Cloak</span>', icon: '/textures/minecraft/equipment/molten_cloak.png' },
          { name: 'Implosion Belt', cleanName: 'Implosion Belt', formattedName: '<span style="color: #FFAA00; font-weight: bold">Implosion Belt</span>', icon: '/textures/minecraft/safari_belt.png' },
          { name: 'Gauntlet of Contagion', cleanName: 'Gauntlet of Contagion', formattedName: '<span style="color: #FFAA00; font-weight: bold">Gauntlet of Contagion</span>', icon: '/textures/minecraft/equipment/gauntlet_of_contagion.png' },
        ],
        pet: {
          name: '[Lvl 100] Bal',
          icon: '/textures/minecraft/pets/magma_cube.png',
          formattedName: '<span style="color: #FFAA00; font-weight: bold">[Lvl 100] Bal</span>',
          loreHtml: ['<span style="color: #AAAAAA">Combat Pet</span>', '', '<span style="color: #55FF55">Currently Summoned!</span>'],
        },
      },
    };

    const activeSetup = presets[selectedLoadout] || presets[1];

    // Left Column 1: Equipped Equipment (Necklace, Cloak, Belt, Gloves)
    const eqSlots = [10, 19, 28, 37];
    eqSlots.forEach((slotIdx, i) => {
      const eqItem = activeSetup.equipment[i];
      if (eqItem) {
        slots[slotIdx] = {
          id: `equipped_equipment_${i}`,
          name: eqItem.cleanName || eqItem.name,
          realItem: eqItem,
          icon: (eqItem.cleanName ? getItemTexture(eqItem) : null) || eqItem.icon,
          rawItem: eqItem.rawName ? eqItem : {
            cleanName: eqItem.name,
            formattedName: eqItem.formattedName || `<span style="color: #FFAA00; font-weight: bold">${eqItem.name}</span>`,
            loreHtml: ['<span style="color: #55FF55">Currently Equipped Equipment</span>'],
          },
        };
      }
    });

    // Left Column 2: Equipped Armor (Helmet, Chestplate, Leggings, Boots)
    const armorSlots = [11, 20, 29, 38];
    armorSlots.forEach((slotIdx, i) => {
      const armItem = activeSetup.armor[i];
      if (armItem) {
        slots[slotIdx] = {
          id: `equipped_armor_${i}`,
          name: armItem.cleanName || armItem.name,
          realItem: armItem,
          icon: (armItem.cleanName ? getItemTexture(armItem) : null) || armItem.icon,
          rawItem: armItem.rawName ? armItem : {
            cleanName: armItem.name,
            formattedName: armItem.formattedName || `<span style="color: #FFAA00; font-weight: bold">${armItem.name}</span>`,
            loreHtml: ['<span style="color: #55FF55">Currently Equipped Armor</span>'],
          },
        };
      }
    });

    // Left Column 3: Active Pet (Slot 21)
    const currentPet = activeSetup.pet;
    slots[21] = {
      id: 'active_pet',
      name: currentPet.name,
      icon: currentPet.icon,
      realItem: currentPet.rawItem || currentPet,
      rawItem: currentPet.rawItem || {
        cleanName: currentPet.name,
        formattedName: currentPet.formattedName || `<span style="color: #FFAA00; font-weight: bold">${currentPet.name}</span>`,
        loreHtml: currentPet.loreHtml || ['<span style="color: #55FF55">Currently Summoned Pet</span>'],
      },
    };

    // Right Side: 12 Loadout Slots per page (Rows 1..4, Cols 5..7 -> slots: 14,15,16, 23,24,25, 32,33,34, 41,42,43)
    const loadoutGrid = [14, 15, 16, 23, 24, 25, 32, 33, 34, 41, 42, 43];
    const pageOffset = (wardrobePage - 1) * 12;

    loadoutGrid.forEach((gridSlot, idx) => {
      const loadoutNum = pageOffset + idx + 1;
      if (wardrobePage === 1) {
        if (idx === 0) {
          const isAct = selectedLoadout === 1;
          slots[gridSlot] = {
            id: `loadout_${loadoutNum}`,
            name: `Loadout #${loadoutNum}`,
            icon: '/textures/minecraft/loadout_slot_1.png',
            action: 'select_loadout',
            loadoutNum: 1,
            rawItem: {
              cleanName: `Loadout #${loadoutNum}`,
              formattedName: `<span style="color: #55FF55; font-weight: bold">Loadout #${loadoutNum}</span>`,
              loreHtml: [
                isAct ? '<span style="color: #55FF55">Currently Active!</span>' : '<span style="color: #AAAAAA">Status: Inactive</span>',
                '',
                '<span style="color: #AAAAAA">Armor: </span><span style="color: #FFAA00">Storm\'s Armor</span>',
                '<span style="color: #AAAAAA">Pet: </span><span style="color: #FFAA00">[Lvl 100] Sheep</span>',
                '<span style="color: #AAAAAA">Equipment: </span><span style="color: #FFAA00">Molten Set</span>',
                '',
                isAct ? '<span style="color: #55FF55">Already equipped!</span>' : '<span style="color: #FFFF55">Click to equip!</span>',
              ],
            },
          };
        } else if (idx === 1) {
          const isAct = selectedLoadout === 2;
          slots[gridSlot] = {
            id: `loadout_${loadoutNum}`,
            name: `Loadout #${loadoutNum}`,
            icon: '/textures/minecraft/loadout_slot_2.png',
            action: 'select_loadout',
            loadoutNum: 2,
            rawItem: {
              cleanName: `Loadout #${loadoutNum}`,
              formattedName: `<span style="color: #55FF55; font-weight: bold">Loadout #${loadoutNum}</span>`,
              loreHtml: [
                isAct ? '<span style="color: #55FF55">Currently Active!</span>' : '<span style="color: #AAAAAA">Status: Inactive</span>',
                '',
                '<span style="color: #AAAAAA">Armor: </span><span style="color: #FFAA00">Necron\'s Armor</span>',
                '<span style="color: #AAAAAA">Pet: </span><span style="color: #FFAA00">[Lvl 100] Wither Skeleton</span>',
                '<span style="color: #AAAAAA">Equipment: </span><span style="color: #FFAA00">Gauntlet of Contagion Set</span>',
                '',
                isAct ? '<span style="color: #55FF55">Already equipped!</span>' : '<span style="color: #FFFF55">Click to equip!</span>',
              ],
            },
          };
        } else if (idx === 2) {
          const isAct = selectedLoadout === 3;
          slots[gridSlot] = {
            id: `loadout_${loadoutNum}`,
            name: `Loadout #${loadoutNum}`,
            icon: '/textures/minecraft/loadout_slot_3.png',
            action: 'select_loadout',
            loadoutNum: 3,
            rawItem: {
              cleanName: `Loadout #${loadoutNum}`,
              formattedName: `<span style="color: #55FF55; font-weight: bold">Loadout #${loadoutNum}</span>`,
              loreHtml: [
                isAct ? '<span style="color: #55FF55">Currently Active!</span>' : '<span style="color: #AAAAAA">Status: Inactive</span>',
                '',
                '<span style="color: #AAAAAA">Armor: </span><span style="color: #FFAA00">Maxor\'s Armor</span>',
                '<span style="color: #AAAAAA">Pet: </span><span style="color: #FFAA00">[Lvl 100] Black Cat</span>',
                '<span style="color: #AAAAAA">Equipment: </span><span style="color: #FFAA00">Speed Equipment Set</span>',
                '',
                isAct ? '<span style="color: #55FF55">Already equipped!</span>' : '<span style="color: #FFFF55">Click to equip!</span>',
              ],
            },
          };
        } else if (idx === 3) {
          const isAct = selectedLoadout === 4;
          slots[gridSlot] = {
            id: `loadout_${loadoutNum}`,
            name: `Loadout #${loadoutNum}`,
            icon: '/textures/minecraft/loadout_slot_4.png',
            action: 'select_loadout',
            loadoutNum: 4,
            rawItem: {
              cleanName: `Loadout #${loadoutNum}`,
              formattedName: `<span style="color: #55FF55; font-weight: bold">Loadout #${loadoutNum}</span>`,
              loreHtml: [
                isAct ? '<span style="color: #55FF55">Currently Active!</span>' : '<span style="color: #AAAAAA">Status: Inactive</span>',
                '',
                '<span style="color: #AAAAAA">Armor: </span><span style="color: #FFAA00">Divan\'s Armor</span>',
                '<span style="color: #AAAAAA">Pet: </span><span style="color: #FFAA00">[Lvl 100] Bal</span>',
                '<span style="color: #AAAAAA">Equipment: </span><span style="color: #FFAA00">Titanium Equipment Set</span>',
                '',
                isAct ? '<span style="color: #55FF55">Already equipped!</span>' : '<span style="color: #FFFF55">Click to equip!</span>',
              ],
            },
          };
        } else if (idx < 10) {
          slots[gridSlot] = {
            id: `loadout_${loadoutNum}`,
            name: 'Empty Loadout Slot',
            icon: '/textures/minecraft/loadout_empty.png',
            rawItem: {
              cleanName: 'Empty Loadout Slot',
              formattedName: `<span style="color: #AAAAAA; font-weight: bold">Loadout #${loadoutNum} (Empty)</span>`,
              loreHtml: [
                '<span style="color: #AAAAAA">Save your current setup into</span>',
                '<span style="color: #AAAAAA">this slot.</span>',
                '',
                '<span style="color: #FFFF55">Right-click to save current setup!</span>',
              ],
            },
          };
        } else {
          slots[gridSlot] = {
            id: `loadout_locked_${loadoutNum}`,
            name: 'Locked Loadout Slot',
            icon: '/textures/minecraft/loadout_locked.png',
            rawItem: {
              cleanName: 'Locked Loadout Slot',
              formattedName: `<span style="color: #FF5555; font-weight: bold">Loadout #${loadoutNum} (Locked)</span>`,
              loreHtml: [
                '<span style="color: #FF5555">Locked!</span>',
                '<span style="color: #AAAAAA">Unlock more loadout slots via</span>',
                '<span style="color: #FFAA00">Community Shop Upgrades</span>',
                '<span style="color: #AAAAAA">at Elizabeth in the Hub.</span>',
              ],
            },
          };
        }
      } else {
        // Page 2 & 3
        slots[gridSlot] = {
          id: `loadout_locked_${loadoutNum}`,
          name: 'Locked Loadout Slot',
          icon: '/textures/minecraft/loadout_locked.png',
          rawItem: {
            cleanName: 'Locked Loadout Slot',
            formattedName: `<span style="color: #FF5555; font-weight: bold">Loadout #${loadoutNum} (Locked)</span>`,
            loreHtml: [
              '<span style="color: #FF5555">Locked!</span>',
              '<span style="color: #AAAAAA">Unlock more loadout slots via</span>',
              '<span style="color: #FFAA00">Community Shop Upgrades</span>',
              '<span style="color: #AAAAAA">at Elizabeth in the Hub.</span>',
            ],
          },
        };
      }
    });

    // Pagination Arrow: Slot 44 (Row 4, Col 8) for Next Page
    if (wardrobePage < 3) {
      slots[44] = {
        id: 'next_wardrobe',
        name: 'Next Page',
        icon: '/textures/minecraft/arrow.png',
        action: 'next_wardrobe_page',
        rawItem: {
          cleanName: 'Next Page',
          formattedName: '<span style="color: #55FF55; font-weight: bold">Next Page</span>',
          loreHtml: [`<span style="color: #AAAAAA">To Page ${wardrobePage + 1}</span>`],
        },
      };
    }
    // Previous Page Arrow on Slot 35 if on page 2 or 3
    if (wardrobePage > 1) {
      slots[35] = {
        id: 'prev_wardrobe',
        name: 'Previous Page',
        icon: '/textures/minecraft/arrow.png',
        action: 'prev_wardrobe_page',
        rawItem: {
          cleanName: 'Previous Page',
          formattedName: '<span style="color: #55FF55; font-weight: bold">Previous Page</span>',
          loreHtml: [`<span style="color: #AAAAAA">To Page ${wardrobePage - 1}</span>`],
        },
      };
    }

    // Bottom Navigation: Slot 48 (Go Back), Slot 49 (Close)
    slots[48] = {
      id: 'back',
      name: 'Go Back',
      icon: '/textures/minecraft/arrow.png',
      targetScreen: 'menu',
      rawItem: { cleanName: 'Go Back', formattedName: '<span style="color: #55FF55; font-weight: bold">Go Back</span>', loreHtml: ['<span style="color: #AAAAAA">To SkyBlock Menu</span>'] },
    };

    slots[49] = {
      id: 'close',
      name: 'Close',
      icon: '/textures/minecraft/barrier.png',
      action: 'close',
      rawItem: { cleanName: 'Close', formattedName: '<span style="color: #FF5555; font-weight: bold">Close</span>', loreHtml: [] },
    };

    return slots;
  }, [wardrobePage, selectedLoadout, inventories.armor, inventories.equipment, activePet]);

  // -------------------------------------------------------------
  // BANK MENU SLOTS (Matches in-game screenshot media_1790527579316.png - 36 slots)
  // -------------------------------------------------------------
  const bankMenuSlots = useMemo(() => {
    const slots = new Array(36).fill(null);
    for (let i = 0; i < 36; i++) {
      slots[i] = {
        type: 'glass',
        icon: '/textures/minecraft/gray_stained_glass_pane.png',
        rawItem: { rawName: ' ', formattedName: ' ', loreHtml: [] },
      };
    }

    // Row 1, Col 2: Deposit Coins (Chest)
    slots[11] = {
      id: 'deposit',
      name: 'Deposit Coins',
      icon: '/textures/minecraft/chest.png',
      rawItem: {
        cleanName: 'Deposit Coins',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Deposit Coins</span>',
        loreHtml: [
          `<span style="color: #AAAAAA">Current purse: </span><span style="color: #FFAA00">${formatCoins(economy.purse || 0)} coins</span>`,
          `<span style="color: #AAAAAA">Bank capacity: </span><span style="color: #FFAA00">1,000,000,000 coins</span>`,
          '',
          '<span style="color: #FFFF55">Click to deposit coins!</span>',
        ],
      },
    };

    // Row 1, Col 4: Withdraw Coins (Dropper)
    slots[13] = {
      id: 'withdraw',
      name: 'Withdraw Coins',
      icon: '/textures/minecraft/dropper.png',
      rawItem: {
        cleanName: 'Withdraw Coins',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Withdraw Coins</span>',
        loreHtml: [
          `<span style="color: #AAAAAA">Bank balance: </span><span style="color: #FFAA00">${formatCoins(economy.bank || 0)} coins</span>`,
          '',
          '<span style="color: #FFFF55">Click to withdraw coins!</span>',
        ],
      },
    };

    // Row 1, Col 6: Recent Transactions (Map)
    slots[15] = {
      id: 'transactions',
      name: 'Recent Transactions',
      icon: '/textures/minecraft/map.png',
      rawItem: {
        cleanName: 'Recent Transactions',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Recent Transactions</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">View your recent deposits and withdrawals.</span>',
          '',
          '<span style="color: #FFFF55">Click to view history!</span>',
        ],
      },
    };

    // Row 3, Col 3: Go Back (Arrow)
    slots[30] = {
      id: 'back',
      name: 'Go Back',
      icon: '/textures/minecraft/arrow.png',
      targetScreen: 'menu',
      rawItem: { cleanName: 'Go Back', formattedName: '<span style="color: #55FF55; font-weight: bold">Go Back</span>', loreHtml: ['<span style="color: #AAAAAA">To SkyBlock Menu</span>'] },
    };

    // Row 3, Col 4: Close (Barrier)
    slots[31] = {
      id: 'close',
      name: 'Close',
      icon: '/textures/minecraft/barrier.png',
      action: 'close',
      rawItem: { cleanName: 'Close', formattedName: '<span style="color: #FF5555; font-weight: bold">Close</span>', loreHtml: [] },
    };

    // Row 3, Col 5: Bank Settings (Redstone Torch)
    slots[32] = {
      id: 'bank_settings',
      name: 'Bank Settings',
      icon: '/textures/minecraft/redstone_torch.png',
      rawItem: {
        cleanName: 'Bank Settings',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Bank Settings</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Configure your bank notifications and</span>',
          '<span style="color: #AAAAAA">custom transaction preferences.</span>',
          '',
          '<span style="color: #FFFF55">Click to configure!</span>',
        ],
      },
    };

    // Row 3, Col 6: Co-op Bank (Iron Door)
    slots[33] = {
      id: 'coop_bank',
      name: 'Co-op Bank',
      icon: '/textures/minecraft/iron_door.png',
      rawItem: {
        cleanName: 'Co-op Bank',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Co-op Bank</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Switch between Personal Bank and</span>',
          '<span style="color: #AAAAAA">Co-op Bank shared account.</span>',
          '',
          '<span style="color: #FFFF55">Click to toggle!</span>',
        ],
      },
    };

    // Row 3, Col 7: Custom Amount (Chest)
    slots[34] = {
      id: 'custom_amount',
      name: 'Custom Amount',
      icon: '/textures/minecraft/chest.png',
      rawItem: {
        cleanName: 'Custom Amount',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Custom Amount</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Deposit or withdraw a specific amount</span>',
          '<span style="color: #AAAAAA">of coins.</span>',
          '',
          '<span style="color: #FFFF55">Click to enter amount!</span>',
        ],
      },
    };

    // Row 3, Col 8: Bank Upgrades (Gold Block)
    slots[35] = {
      id: 'upgrades',
      name: 'Bank Upgrades',
      icon: '/textures/minecraft/gold_block.png',
      rawItem: {
        cleanName: 'Bank Upgrades',
        formattedName: '<span style="color: #FFAA00; font-weight: bold">Bank Upgrades</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Current Account: </span><span style="color: #FFAA00">Palatial</span>',
          `<span style="color: #AAAAAA">Bank Limit: </span><span style="color: #FFAA00">1,000,000,000 coins</span>`,
          `<span style="color: #AAAAAA">Interest: </span><span style="color: #55FF55">2.08% every 31 hours</span>`,
          '',
          '<span style="color: #FFFF55">Click to view upgrade tiers!</span>',
        ],
      },
    };

    return slots;
  }, [economy]);

  // -------------------------------------------------------------
  // FAST TRAVEL MENU SLOTS (Matches in-game screenshot media_1790527598937.png - 54 slots)
  // -------------------------------------------------------------
  const fastTravelMenuSlots = useMemo(() => {
    const slots = new Array(54).fill(null);
    for (let i = 0; i < 54; i++) {
      slots[i] = {
        type: 'glass',
        icon: '/textures/minecraft/gray_stained_glass_pane.png',
        rawItem: { rawName: ' ', formattedName: ' ', loreHtml: [] },
      };
    }

    const destinations = [
      {
        slot: 10,
        name: 'Your Island',
        icon: '/textures/minecraft/fast_travel_island.png',
        lore: [
          '<span style="color: #AAAAAA">Teleport to your private island.</span>',
          '',
          '<span style="color: #FFFF55">Right-Click to open options!</span>',
          '<span style="color: #FFFF55">Left-Click to warp!</span>',
        ],
      },
      {
        slot: 11,
        name: 'The Hub',
        icon: '/textures/minecraft/fast_travel_hub.png',
        lore: [
          '<span style="color: #AAAAAA">Teleport to the central village</span>',
          '<span style="color: #AAAAAA">of the main SkyBlock island.</span>',
          '',
          '<span style="color: #FFFF55">Right-Click to open options!</span>',
          '<span style="color: #FFFF55">Left-Click to warp!</span>',
        ],
      },
      {
        slot: 12,
        name: 'The Farming Islands',
        icon: '/textures/minecraft/fast_travel_farming.png',
        lore: [
          '<span style="color: #AAAAAA">Teleport to The Barn and Mushroom</span>',
          '<span style="color: #AAAAAA">Desert to cultivate crops.</span>',
          '',
          '<span style="color: #FFFF55">Right-Click to open options!</span>',
          '<span style="color: #FFFF55">Left-Click to warp!</span>',
        ],
      },
      {
        slot: 14,
        name: "Spider's Den",
        icon: '/textures/minecraft/fast_travel_spider.png',
        lore: [
          '<span style="color: #AAAAAA">Teleport to the arachnid lair</span>',
          '<span style="color: #AAAAAA">and Slayer territory.</span>',
          '',
          '<span style="color: #FFFF55">Right-Click to open options!</span>',
          '<span style="color: #FFFF55">Left-Click to warp!</span>',
        ],
      },
      {
        slot: 15,
        name: 'The Park',
        icon: '/textures/minecraft/fast_travel_park.png',
        lore: [
          '<span style="color: #AAAAAA">Teleport to the rich multi-tiered</span>',
          '<span style="color: #AAAAAA">forest for foraging logs.</span>',
          '',
          '<span style="color: #FFFF55">Right-Click to open options!</span>',
          '<span style="color: #FFFF55">Left-Click to warp!</span>',
        ],
      },
      {
        slot: 29,
        name: "Jerry's Workshop",
        icon: '/textures/minecraft/fast_travel_jerry.png',
        lore: [
          '<span style="color: #AAAAAA">Teleport to the seasonal winter</span>',
          '<span style="color: #AAAAAA">wonderland and Jerry event.</span>',
          '',
          '<span style="color: #FFFF55">Right-Click to open options!</span>',
          '<span style="color: #FFFF55">Left-Click to warp!</span>',
        ],
      },
      {
        slot: 33,
        name: 'Winter Island',
        icon: '/textures/minecraft/fast_travel_winter.png',
        lore: [
          '<span style="color: #AAAAAA">Teleport to the icy peaks and</span>',
          '<span style="color: #AAAAAA">frozen lake.</span>',
          '',
          '<span style="color: #FFFF55">Right-Click to open options!</span>',
          '<span style="color: #FFFF55">Left-Click to warp!</span>',
        ],
      },
    ];

    for (const d of destinations) {
      slots[d.slot] = {
        id: `warp_${d.name}`,
        name: d.name,
        icon: d.icon,
        rawItem: {
          cleanName: d.name,
          formattedName: `<span style="color: #55FF55; font-weight: bold">${d.name}</span>`,
          loreHtml: d.lore,
        },
      };
    }

    // Locked warps matching the question mark skulls in screenshot
    const lockedSlots = [13, 16, 19, 20, 21, 22, 23, 24, 25, 30, 31, 32];
    for (const s of lockedSlots) {
      slots[s] = {
        id: `warp_locked_${s}`,
        name: 'Locked Warp',
        icon: '/textures/minecraft/fast_travel_locked.png',
        rawItem: {
          cleanName: 'Locked Warp',
          formattedName: '<span style="color: #FF5555; font-weight: bold">???</span>',
          loreHtml: [
            '<span style="color: #AAAAAA">You haven\'t unlocked this fast</span>',
            '<span style="color: #AAAAAA">travel location yet!</span>',
            '',
            '<span style="color: #FF5555">Locked</span>',
          ],
        },
      };
    }

    slots[45] = {
      id: 'scroll',
      name: 'Island Warp Scroll',
      icon: '/textures/minecraft/fast_travel_fire.png',
      rawItem: {
        cleanName: 'Island Warp Scroll',
        formattedName: '<span style="color: #FFAA00; font-weight: bold">Island Warp Scroll</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Allows teleporting directly to</span>',
          '<span style="color: #AAAAAA">custom coordinates and sub-areas.</span>',
          '',
          '<span style="color: #55FF55">Unlocked</span>',
        ],
      },
    };

    slots[48] = {
      id: 'back',
      name: 'Go Back',
      icon: '/textures/minecraft/arrow.png',
      targetScreen: 'menu',
      rawItem: {
        cleanName: 'Go Back',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Go Back</span>',
        loreHtml: ['<span style="color: #AAAAAA">To SkyBlock Menu</span>'],
      },
    };

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

    slots[50] = {
      id: 'custom_spawn',
      name: 'Custom Island Spawn',
      icon: '/textures/minecraft/loadout_empty.png',
      rawItem: {
        cleanName: 'Custom Island Spawn',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Custom Island Spawn</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Teleport directly to your custom</span>',
          '<span style="color: #AAAAAA">island spawn point.</span>',
          '',
          '<span style="color: #FFFF55">Click to teleport!</span>',
        ],
      },
    };

    return slots;
  }, []);

  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // PROFILE MANAGEMENT MENU SLOTS (Matches screenshot media_1790527618082.png - 36 slots)
  // -------------------------------------------------------------
  const profileMenuSlots = useMemo(() => {
    const slots = new Array(36).fill(null);
    for (let i = 0; i < 36; i++) {
      slots[i] = {
        type: 'glass',
        icon: '/textures/minecraft/gray_stained_glass_pane.png',
        rawItem: { rawName: ' ', formattedName: ' ', loreHtml: [] },
      };
    }

    // Profiles array from API or mock fallback matching user screenshot
    const profileList = profiles && profiles.length > 0 ? profiles : [
      { profileId: selectedProfile?.profileId || 'p1', cuteName: selectedProfile?.cuteName || 'Banana', game_mode: selectedProfile?.game_mode || 'classic' },
      { profileId: 'p2', cuteName: 'Blueberry', game_mode: 'classic' }
    ];

    // Find active profile and other profiles
    const activeProf = profileList.find(p => p.profileId === selectedProfile?.profileId) || profileList[0];
    const otherProfs = profileList.filter(p => p.profileId !== activeProf.profileId);

    // Slot 11: Active Profile (Emerald Block)
    slots[11] = {
      id: 'active_profile',
      name: `Playing on: ${activeProf?.cuteName || 'Banana'}`,
      icon: '/textures/minecraft/emerald_block.png',
      profileId: activeProf?.profileId,
      rawItem: {
        cleanName: `Playing on: ${activeProf?.cuteName || 'Banana'}`,
        formattedName: `<span style="color: #55FF55; font-weight: bold">Profile: ${activeProf?.cuteName || 'Banana'}</span>`,
        loreHtml: [
          '<span style="color: #55FF55">Currently Playing!</span>',
          '',
          `<span style="color: #AAAAAA">Members: </span><span style="color: #FFFF55">${activeProf?.members ? Object.keys(activeProf.members).length : 1}</span>`,
          `<span style="color: #AAAAAA">Game Mode: </span><span style="color: #FFAA00">${activeProf?.game_mode ? activeProf.game_mode.toUpperCase() : 'Classic'}</span>`,
          '',
          '<span style="color: #AAAAAA">This is your currently active</span>',
          '<span style="color: #AAAAAA">SkyBlock profile.</span>',
        ],
      },
    };

    // Slot 12: Other profile (Grass Block)
    const secondProf = otherProfs[0] || { profileId: 'p2', cuteName: 'Blueberry' };
    slots[12] = {
      id: `profile_${secondProf.profileId}`,
      name: `Profile: ${secondProf.cuteName}`,
      icon: '/textures/minecraft/grass_block.png',
      action: 'select_profile',
      profileId: secondProf.profileId,
      rawItem: {
        cleanName: `Profile: ${secondProf.cuteName}`,
        formattedName: `<span style="color: #55FF55; font-weight: bold">Profile: ${secondProf.cuteName}</span>`,
        loreHtml: [
          `<span style="color: #AAAAAA">Members: </span><span style="color: #FFFF55">${secondProf?.members ? Object.keys(secondProf.members).length : 1}</span>`,
          `<span style="color: #AAAAAA">Game Mode: </span><span style="color: #FFAA00">${secondProf?.game_mode ? secondProf.game_mode.toUpperCase() : 'Classic'}</span>`,
          '',
          '<span style="color: #FFFF55">Click to switch to this profile!</span>',
        ],
      },
    };

    // Slot 13: Create New Profile (Wooden Button)
    slots[13] = {
      id: 'create_profile',
      name: 'Create New Profile',
      icon: '/textures/minecraft/wooden_button.png',
      rawItem: {
        cleanName: 'Create New Profile',
        formattedName: '<span style="color: #FFFF55; font-weight: bold">Create a new profile</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Start a fresh SkyBlock journey</span>',
          '<span style="color: #AAAAAA">with a new character!</span>',
          '',
          '<span style="color: #FFFF55">Click to create!</span>',
        ],
      },
    };

    // Slot 14: Locked Profile Slot (Bedrock)
    slots[14] = {
      id: 'locked_1',
      name: 'Locked Profile Slot',
      icon: '/textures/minecraft/bedrock.png',
      rawItem: {
        cleanName: 'Locked Profile Slot',
        formattedName: '<span style="color: #FF5555; font-weight: bold">Locked Profile Slot</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Unlock additional profile slots</span>',
          '<span style="color: #AAAAAA">with a Hypixel VIP rank or higher.</span>',
          '',
          '<span style="color: #FF5555">Locked</span>',
        ],
      },
    };

    // Slot 15: Locked Profile Slot (Bedrock)
    slots[15] = {
      id: 'locked_2',
      name: 'Locked Profile Slot',
      icon: '/textures/minecraft/bedrock.png',
      rawItem: {
        cleanName: 'Locked Profile Slot',
        formattedName: '<span style="color: #FF5555; font-weight: bold">Locked Profile Slot</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Unlock additional profile slots</span>',
          '<span style="color: #AAAAAA">with a Hypixel MVP rank or higher.</span>',
          '',
          '<span style="color: #FF5555">Locked</span>',
        ],
      },
    };

    // Slot 30: Go Back (Arrow)
    slots[30] = {
      id: 'back',
      name: 'Go Back',
      icon: '/textures/minecraft/arrow.png',
      targetScreen: 'menu',
      rawItem: {
        cleanName: 'Go Back',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Go Back</span>',
        loreHtml: ['<span style="color: #AAAAAA">To SkyBlock Menu</span>'],
      },
    };

    // Slot 31: Close (Barrier)
    slots[31] = {
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

    return slots;
  }, [profiles, selectedProfile]);

  // -------------------------------------------------------------
  // BOOSTER COOKIE MENU SLOTS (Matches screenshot media_1790527638591.png - 54 slots)
  // -------------------------------------------------------------
  const cookieMenuSlots = useMemo(() => {
    const slots = new Array(54).fill(null);
    for (let i = 0; i < 54; i++) {
      slots[i] = {
        type: 'glass',
        icon: '/textures/minecraft/gray_stained_glass_pane.png',
        rawItem: { rawName: ' ', formattedName: ' ', loreHtml: [] },
      };
    }
    // Slot 0 is an empty slot in the screenshot
    slots[0] = {
      type: 'empty',
      rawItem: { rawName: ' ', formattedName: ' ', loreHtml: [] },
    };

    slots[11] = {
      id: 'cookie_status',
      name: 'Cookie Buff Status',
      icon: '/textures/minecraft/diamond.png',
      rawItem: {
        cleanName: 'Cookie Buff Status',
        formattedName: '<span style="color: #FFAA00; font-weight: bold">Booster Cookie</span>',
        loreHtml: [
          '<span style="color: #55FF55">Cookie Buff: Active</span>',
          '<span style="color: #AAAAAA">Duration: </span><span style="color: #FFFF55">30 days</span>',
          '',
          '<span style="color: #FFAA00">Buff Benefits:</span>',
          '<span style="color: #AAAAAA">▶ </span><span style="color: #FFAA00">+25% Skill EXP</span>',
          '<span style="color: #AAAAAA">▶ </span><span style="color: #55FFFF">+15 Magic Find</span>',
          '<span style="color: #AAAAAA">▶ </span><span style="color: #FFAA00">Keep coins and effects on death</span>',
          '<span style="color: #AAAAAA">▶ </span><span style="color: #55FF55">Access to /ah and /bazaar anywhere</span>',
          '<span style="color: #AAAAAA">▶ </span><span style="color: #55FFFF">Earn Bits while playing!</span>',
        ],
      },
    };

    slots[13] = {
      id: 'eat_cookie',
      name: 'Eat Booster Cookie',
      icon: '/textures/minecraft/cookie.png',
      rawItem: {
        cleanName: 'Eat Booster Cookie',
        formattedName: '<span style="color: #FFAA00; font-weight: bold">Consume Booster Cookie</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Consuming a Booster Cookie grants</span>',
          '<span style="color: #AAAAAA">4 days of Cookie Buff and unlocks</span>',
          '<span style="color: #AAAAAA">Bits to earn over time.</span>',
          '',
          '<span style="color: #FFFF55">Click to consume!</span>',
        ],
      },
    };

    slots[15] = {
      id: 'bits',
      name: 'Available Bits',
      icon: '/textures/minecraft/gold_helmet.png',
      rawItem: {
        cleanName: 'Available Bits',
        formattedName: '<span style="color: #55FFFF; font-weight: bold">Bits</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Bits are a currency earned passively</span>',
          '<span style="color: #AAAAAA">while your Booster Cookie is active.</span>',
          '',
          '<span style="color: #AAAAAA">Available Bits: </span><span style="color: #55FFFF">4,800</span>',
          '<span style="color: #AAAAAA">Multiplier: </span><span style="color: #55FF55">1.2x</span>',
          '',
          '<span style="color: #FFFF55">Spend at Elizabeth in Community Shop!</span>',
        ],
      },
    };

    slots[28] = {
      id: 'remote_ec',
      name: 'Remote Ender Chest',
      icon: '/textures/minecraft/ender_chest.png',
      targetScreen: 'storage',
      storageTab: 'enderChest',
      rawItem: {
        cleanName: 'Remote Ender Chest',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Remote Ender Chest</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Open your Ender Chest from anywhere</span>',
          '<span style="color: #AAAAAA">across SkyBlock!</span>',
          '',
          '<span style="color: #55FF55">Cookie Buff Active</span>',
          '<span style="color: #FFFF55">Click to open!</span>',
        ],
      },
    };

    slots[29] = {
      id: 'remote_ench',
      name: 'Remote Enchanting Table',
      icon: '/textures/minecraft/enchanting_table.png',
      rawItem: {
        cleanName: 'Remote Enchanting Table',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Remote Enchanting Table</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Access enchanting powers from anywhere.</span>',
          '',
          '<span style="color: #55FF55">Cookie Buff Active</span>',
        ],
      },
    };

    slots[30] = {
      id: 'remote_anvil',
      name: 'Remote Anvil',
      icon: '/textures/minecraft/anvil.png',
      rawItem: {
        cleanName: 'Remote Anvil',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Remote Anvil</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Repair and combine items on the go.</span>',
          '',
          '<span style="color: #55FF55">Cookie Buff Active</span>',
        ],
      },
    };

    slots[32] = {
      id: 'god_pot',
      name: 'Active God Potion',
      icon: '/textures/minecraft/booster_potion.png',
      rawItem: {
        cleanName: 'Active God Potion',
        formattedName: '<span style="color: #FF55FF; font-weight: bold">God Potion Effects</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Potion effects are frozen and</span>',
          '<span style="color: #AAAAAA">will not expire during Cookie Buff!</span>',
          '',
          '<span style="color: #55FF55">Active</span>',
        ],
      },
    };

    slots[33] = {
      id: 'mounts',
      name: 'Mounts & Pets',
      icon: '/textures/minecraft/gold_horse_armor.png',
      rawItem: {
        cleanName: 'Mounts & Pets',
        formattedName: '<span style="color: #FFAA00; font-weight: bold">Active Pet & Mounts</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Keep pet leveling bonuses and mount</span>',
          '<span style="color: #AAAAAA">buffs preserved everywhere.</span>',
          '',
          '<span style="color: #55FF55">Active</span>',
        ],
      },
    };

    slots[34] = {
      id: 'comm_shop',
      name: 'Community Shop',
      icon: '/textures/minecraft/community_shop.png',
      rawItem: {
        cleanName: 'Community Shop',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Community Shop</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Spend your earned bits with</span>',
          '<span style="color: #AAAAAA">Elizabeth at the Community Center.</span>',
          '',
          '<span style="color: #FFFF55">Click to browse bits shop!</span>',
        ],
      },
    };

    slots[48] = {
      id: 'back',
      name: 'Go Back',
      icon: '/textures/minecraft/arrow.png',
      targetScreen: 'menu',
      rawItem: {
        cleanName: 'Go Back',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Go Back</span>',
        loreHtml: ['<span style="color: #AAAAAA">To SkyBlock Menu</span>'],
      },
    };

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

    slots[50] = {
      id: 'buy_cookie',
      name: 'Buy Booster Cookie',
      icon: '/textures/minecraft/emerald.png',
      rawItem: {
        cleanName: 'Buy Booster Cookie',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Buy Booster Cookie</span>',
        loreHtml: [
          '<span style="color: #AAAAAA">Buy a Booster Cookie from the</span>',
          '<span style="color: #AAAAAA">Bazaar or Community Shop.</span>',
          '',
          '<span style="color: #AAAAAA">Bazaar Price: </span><span style="color: #FFAA00">12,500,000 coins</span>',
          '',
          '<span style="color: #FFFF55">Click to view Bazaar!</span>',
        ],
      },
    };

    return slots;
  }, []);

  const handleSlotClick = (slot) => {
    if (!slot || slot.type === 'glass' || slot.id === 'crafting') return;
    if (slot.action === 'close') {
      if (onClose) onClose();
      return;
    }
    if (slot.action === 'menu') {
      setScreen('menu');
      return;
    }
    if (slot.action === 'bags') {
      setScreen('bags');
      return;
    }
    if (slot.action === 'prev_accessory_page') {
      setAccessoryBagPage((p) => Math.max(1, p - 1));
      return;
    }
    if (slot.action === 'next_accessory_page') {
      setAccessoryBagPage((p) => Math.min(3, p + 1));
      return;
    }
    if (slot.action === 'prev_pets_page') {
      setPetsPage((p) => Math.max(1, p - 1));
      return;
    }
    if (slot.action === 'next_pets_page') {
      const maxPages = Math.max(1, Math.ceil(pets.length / 28));
      setPetsPage((p) => Math.min(maxPages, p + 1));
      return;
    }
    if (slot.action === 'prev_wardrobe_page') {
      setWardrobePage((p) => Math.max(1, p - 1));
      return;
    }
    if (slot.action === 'next_wardrobe_page') {
      setWardrobePage((p) => Math.min(3, p + 1));
      return;
    }
    if (slot.action === 'select_loadout') {
      setSelectedLoadout(slot.loadoutNum);
      return;
    }
    if (slot.action === 'select_profile' && slot.profileId) {
      if (onSelectProfile) onSelectProfile(slot.profileId);
      return;
    }
    if (slot.storageTab) {
      setStorageKey(slot.storageTab);
    }
    if (slot.targetScreen) {
      if (slot.targetScreen === 'pets') setPetsPage(1);
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
  // VIEW: QUESTS & CHAPTERS (Matches in-game GUI 100%)
  // -------------------------------------------------------------
  if (screen === 'quests') {
    return (
      <div className="mc-chest-wrapper">
        <div className="mc-chest-window">
          {/* Header */}
          <div className="mc-chest-header">
            <span className="mc-chest-title text-2xl font-bold">Quests & Chapters</span>
            {onClose && (
              <button onClick={onClose} className="mc-close-button" title="Close [ESC]">
                <img src="/textures/minecraft/barrier.png" alt="Close" className="w-4 h-4 pointer-events-none" />
              </button>
            )}
          </div>

          {/* 54-Slot Chest Grid */}
          <div className="mc-chest-grid">
            {questsMenuSlots.map((slot, idx) => {
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
  // VIEW: CALENDAR AND EVENTS (Matches in-game GUI 100%)
  // -------------------------------------------------------------
  if (screen === 'calendar') {
    return (
      <div className="mc-chest-wrapper">
        <div className="mc-chest-window">
          {/* Header */}
          <div className="mc-chest-header">
            <span className="mc-chest-title text-2xl font-bold">Calendar and Events</span>
            {onClose && (
              <button onClick={onClose} className="mc-close-button" title="Close [ESC]">
                <img src="/textures/minecraft/barrier.png" alt="Close" className="w-4 h-4 pointer-events-none" />
              </button>
            )}
          </div>

          {/* 54-Slot Chest Grid */}
          <div className="mc-chest-grid">
            {calendarMenuSlots.map((slot, idx) => {
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
  // VIEW: STORAGE (Matches in-game GUI 100%)
  // -------------------------------------------------------------
  if (screen === 'storage') {
    return (
      <div className="mc-chest-wrapper">
        <div className="mc-chest-window">
          {/* Header */}
          <div className="mc-chest-header">
            <span className="mc-chest-title text-2xl font-bold">Storage</span>
            {onClose && (
              <button onClick={onClose} className="mc-close-button" title="Close [ESC]">
                <img src="/textures/minecraft/barrier.png" alt="Close" className="w-4 h-4 pointer-events-none" />
              </button>
            )}
          </div>

          {/* 54-Slot Chest Grid */}
          <div className="mc-chest-grid">
            {storageMenuSlots.map((slot, idx) => {
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
                  {slot?.count && slot.count > 1 && (
                    <span className="mc-slot-count text-[11px]">{slot.count}</span>
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
  // GENERIC 54-SLOT CHEST CONTAINER RENDERER
  // -------------------------------------------------------------
  const renderChestView = (title, slots) => {
    return (
      <div className="mc-chest-wrapper">
        <div className="mc-chest-window">
          {/* Header */}
          <div className="mc-chest-header">
            <span className="mc-chest-title text-2xl font-bold">{title}</span>
            {onClose && (
              <button onClick={onClose} className="mc-close-button" title="Close [ESC]">
                <img src="/textures/minecraft/barrier.png" alt="Close" className="w-4 h-4 pointer-events-none" />
              </button>
            )}
          </div>

          {/* Dynamic Chest Grid */}
          <div
            className="mc-chest-grid"
            style={{
              gridTemplateRows: `repeat(${Math.ceil(slots.length / 9)}, 42px)`
            }}
          >
            {slots.map((slot, idx) => {
              const dataAttr = slot?.rawItem && slot.rawItem.rawName !== ' '
                ? encodeURIComponent(JSON.stringify(slot.rawItem))
                : null;
              const isGlass = slot?.type === 'glass';
              const isEmpty = slot?.type === 'empty';

              return (
                <div
                  key={idx}
                  onClick={() => handleSlotClick(slot)}
                  className={`mc-slot-cell ${isGlass || isEmpty ? 'glass-border' : 'cursor-pointer hover:brightness-110'}`}
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
                  {slot?.count && slot.count > 1 && (
                    <span className="mc-slot-count text-[11px]">{slot.count}</span>
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
              let item = hotbarItems[idx];
              let isMenuStar = false;
              if (idx === 8 || !item || item.empty) {
                if (idx === 8) {
                  isMenuStar = true;
                  item = {
                    id: 'skyblock_menu',
                    cleanName: 'SkyBlock Menu',
                    formattedName: '<span style="color: #55FF55; font-weight: bold">SkyBlock Menu (Right Click)</span>',
                    icon: '/textures/minecraft/nether_star.png',
                    loreHtml: [
                      '<span style="color: #AAAAAA">Click to open your SkyBlock Menu!</span>',
                    ],
                  };
                }
              }

              const dataAttr = item && !item.empty ? encodeURIComponent(JSON.stringify(item)) : null;
              const tex = item && !item.empty ? (isMenuStar ? item.icon : getItemTexture(item)) : null;
              const isEnch = item && (item.starsCount > 0 || item.recombobulated || (item.enchants && Object.keys(item.enchants).length > 0));

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (isMenuStar) {
                      setScreen('menu');
                    }
                  }}
                  className={`mc-slot-cell ${isMenuStar ? 'cursor-pointer hover:brightness-125' : ''}`}
                  data-item={dataAttr}
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
  };

  // -------------------------------------------------------------
  // AUTHENTIC 54-SLOT CHEST SCREENS
  // -------------------------------------------------------------
  if (screen === 'bags' || screen === 'sacks') {
    return renderChestView('Your Bags', bagsMenuSlots);
  }

  if (screen === 'accessory_bag') {
    return renderChestView(`Accessory Bag (${accessoryBagPage}/3)`, accessoryBagSlots);
  }

  if (screen === 'fishing_bag') {
    return renderChestView('Fishing Bag', fishingBagSlots);
  }

  if (screen === 'potion_bag') {
    return renderChestView('Potion Bag', potionBagSlots);
  }

  if (screen === 'quiver') {
    return renderChestView('Quiver', quiverSlots);
  }

  if (screen === 'sack_of_sacks') {
    return renderChestView('Sack of Sacks', sackOfSacksSlots);
  }

  if (screen === 'time_pocket') {
    return renderChestView('Time Pocket', timePocketSlots);
  }

  if (screen === 'pets') {
    const totalPetPages = Math.max(1, Math.ceil(pets.length / 28));
    return renderChestView(`(${petsPage}/${totalPetPages}) Pets`, petsMenuSlots);
  }

  if (screen === 'wardrobe') {
    return renderChestView(`(${wardrobePage}/3) Loadouts`, wardrobeMenuSlots);
  }

  if (screen === 'bank') {
    return renderChestView('Personal Bank Account', bankMenuSlots);
  }

  if (screen === 'fast_travel') {
    return renderChestView('Fast Travel', fastTravelMenuSlots);
  }

  if (screen === 'profiles') {
    return renderChestView('Profile Management', profileMenuSlots);
  }

  if (screen === 'cookie') {
    return renderChestView('Booster Cookie', cookieMenuSlots);
  }

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


      </div>
    </div>
  );
}
