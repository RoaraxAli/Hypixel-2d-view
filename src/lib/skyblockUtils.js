// SkyBlock Calculation Utilities & XP Curves

// Standard SkyBlock Skill XP Curve (Levels 1 - 60)
export const SKILL_XP_TABLE = [
  0, 50, 175, 375, 675, 1175, 1925, 2925, 4425, 6425, 9925, 14925, 22425, 32425, 47425,
  67425, 97425, 147425, 222425, 322425, 522425, 822425, 1222425, 1722425, 2322425,
  3022425, 3822425, 4722425, 5722425, 6822425, 8022425, 9322425, 10722425, 12222425,
  13822425, 15522425, 17322425, 19222425, 21222425, 23322425, 25522425, 27822425,
  30222425, 32722425, 35322425, 38072425, 40972425, 44072425, 47472425, 51172425,
  55172425, 59472425, 64072425, 68972425, 74172425, 79672425, 85472425, 91572425,
  97972425, 104672425, 111672425
];

// Runecrafting XP Table (Levels 1 - 25)
export const RUNECRAFTING_XP_TABLE = [
  0, 50, 100, 150, 250, 400, 600, 900, 1400, 2100, 2800, 3600, 4500, 5600, 6800, 8200,
  9800, 11700, 14000, 16800, 20300, 24600, 29800, 36100, 43700, 53000
];

// Social Skill XP Table (Levels 1 - 25)
export const SOCIAL_XP_TABLE = [
  0, 50, 100, 150, 250, 400, 600, 900, 1400, 2100, 2800, 3600, 4500, 5600, 6800, 8200,
  9800, 11700, 14000, 16800, 20300, 24600, 29800, 36100, 43700, 53000
];

// Catacombs & Class XP Table (Levels 1 - 50)
export const CATACOMBS_XP_TABLE = [
  0, 50, 125, 235, 395, 625, 955, 1425, 2095, 3045, 4385, 6275, 8940, 12700, 17960,
  25340, 35640, 50040, 70040, 97640, 135640, 188140, 259640, 356640, 488640, 668640,
  911640, 1239640, 1681640, 2276640, 3076640, 4146640, 5576640, 7486640, 10026640,
  13396640, 17846640, 23716640, 31446640, 41606640, 54906640, 72256640, 94856640,
  124156640, 161956640, 210756640, 273656640, 354456640, 458056640, 569806640
];

// Slayer XP Thresholds (Levels 1 - 9)
export const SLAYER_XP_TABLES = {
  zombie: [0, 5, 15, 200, 1000, 5000, 20000, 100000, 400000, 1000000],
  spider: [0, 5, 25, 200, 1000, 5000, 20000, 100000, 400000, 1000000],
  wolf: [0, 10, 30, 250, 1500, 5000, 20000, 100000, 400000, 1000000],
  enderman: [0, 10, 30, 250, 1500, 5000, 20000, 100000, 400000, 1000000],
  blaze: [0, 10, 30, 250, 1500, 5000, 20000, 100000, 400000, 1000000],
  vampire: [0, 20, 75, 240, 840, 2400] // Max Level 5
};

// Heart of the Mountain XP Table (Levels 1 - 10)
export const HOTM_XP_TABLE = [
  0, 0, 3000, 9000, 25000, 60000, 100000, 150000, 210000, 280000, 360000
];

// Garden XP Table (Levels 1 - 15)
export const GARDEN_XP_TABLE = [
  0, 70, 140, 280, 560, 1120, 2240, 4480, 8960, 17920, 35840, 71680, 143360, 286720, 573440, 1146880
];

/**
 * Format large coin / number values with suffixes
 */
export function formatCoins(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  const abs = Math.abs(num);
  if (abs >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (abs >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (abs >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toLocaleString('en-US', { maximumFractionDigits: 1 });
}

/**
 * Calculate level, progress, and next XP from XP table
 */
export function calculateLevelFromTable(xp = 0, table, maxLevel = null) {
  const max = maxLevel || (table.length - 1);
  if (xp <= 0) {
    return {
      level: 0,
      maxLevel: max,
      xp: 0,
      currentXp: 0,
      nextLevelXp: table[1] || 0,
      progressPercent: 0
    };
  }

  let level = 0;
  for (let i = 1; i <= max; i++) {
    if (xp >= table[i]) {
      level = i;
    } else {
      break;
    }
  }

  if (level >= max) {
    return {
      level: max,
      maxLevel: max,
      xp,
      currentXp: xp - table[max],
      nextLevelXp: 0,
      progressPercent: 100
    };
  }

  const currentLevelXp = table[level];
  const nextLevelXp = table[level + 1];
  const xpIntoCurrent = xp - currentLevelXp;
  const xpRequiredForNext = nextLevelXp - currentLevelXp;
  const progressPercent = Math.min(100, Math.max(0, (xpIntoCurrent / xpRequiredForNext) * 100));

  return {
    level,
    maxLevel: max,
    xp,
    currentXp: Math.floor(xpIntoCurrent),
    nextLevelXp: Math.floor(xpRequiredForNext),
    progressPercent: parseFloat(progressPercent.toFixed(1))
  };
}

/**
 * Calculate all skills for a player profile
 */
export function calculateSkills(memberData) {
  const expObj = memberData.player_data?.experience || {};
  
  const skillDefs = [
    { key: 'COMBAT', name: 'Combat', icon: '⚔️', maxLevel: 60, table: SKILL_XP_TABLE },
    { key: 'MINING', name: 'Mining', icon: '⛏️', maxLevel: 60, table: SKILL_XP_TABLE },
    { key: 'FARMING', name: 'Farming', icon: '🌾', maxLevel: 60, table: SKILL_XP_TABLE },
    { key: 'FORAGING', name: 'Foraging', icon: '🪓', maxLevel: 50, table: SKILL_XP_TABLE },
    { key: 'FISHING', name: 'Fishing', icon: '🎣', maxLevel: 50, table: SKILL_XP_TABLE },
    { key: 'ENCHANTING', name: 'Enchanting', icon: '🔮', maxLevel: 60, table: SKILL_XP_TABLE },
    { key: 'ALCHEMY', name: 'Alchemy', icon: '🧪', maxLevel: 50, table: SKILL_XP_TABLE },
    { key: 'CARPENTRY', name: 'Carpentry', icon: '🪑', maxLevel: 50, table: SKILL_XP_TABLE },
    { key: 'TAMING', name: 'Taming', icon: '🐾', maxLevel: 50, table: SKILL_XP_TABLE },
    { key: 'RUNECRAFTING', name: 'Runecrafting', icon: '✨', maxLevel: 25, table: RUNECRAFTING_XP_TABLE, cosmetic: true },
    { key: 'SOCIAL', name: 'Social', icon: '💬', maxLevel: 25, table: SOCIAL_XP_TABLE, cosmetic: true }
  ];

  const skills = [];
  let totalLevelNonCosmetic = 0;
  let nonCosmeticCount = 0;

  for (const def of skillDefs) {
    const rawXp = expObj[`SKILL_${def.key}`] || memberData[`experience_skill_${def.key.toLowerCase()}`] || 0;
    const calc = calculateLevelFromTable(rawXp, def.table, def.maxLevel);
    
    if (!def.cosmetic) {
      // Add fractional level for true skill average
      const fractional = calc.level + (calc.progressPercent / 100);
      totalLevelNonCosmetic += (calc.level >= def.maxLevel ? def.maxLevel : fractional);
      nonCosmeticCount++;
    }

    skills.push({
      id: def.key,
      name: def.name,
      icon: def.icon,
      cosmetic: Boolean(def.cosmetic),
      ...calc
    });
  }

  const skillAverage = nonCosmeticCount > 0 ? parseFloat((totalLevelNonCosmetic / nonCosmeticCount).toFixed(2)) : 0;

  return {
    skills,
    skillAverage
  };
}

/**
 * Calculate Slayer Progress
 */
export function calculateSlayers(slayerData) {
  const bosses = slayerData?.slayer_bosses || {};
  
  const slayerList = [
    { key: 'zombie', name: 'Revenant Horror', type: 'Zombie', icon: '🧟', maxLevel: 9 },
    { key: 'spider', name: 'Tarantula Broodmother', type: 'Spider', icon: '🕷️', maxLevel: 9 },
    { key: 'wolf', name: 'Sven Packmaster', type: 'Wolf', icon: '🐺', maxLevel: 9 },
    { key: 'enderman', name: 'Voidgloom Seraph', type: 'Enderman', icon: '👁️', maxLevel: 9 },
    { key: 'blaze', name: 'Inferno Demonlord', type: 'Blaze', icon: '🔥', maxLevel: 9 },
    { key: 'vampire', name: 'Riftstalker Bloodfiend', type: 'Vampire', icon: '🩸', maxLevel: 5 }
  ];

  let totalSlayerXp = 0;

  const results = slayerList.map(def => {
    const boss = bosses[def.key] || {};
    const xp = boss.xp || 0;
    totalSlayerXp += xp;
    const table = SLAYER_XP_TABLES[def.key] || SLAYER_XP_TABLES.zombie;
    const calc = calculateLevelFromTable(xp, table, def.maxLevel);

    const kills = {
      t1: boss.boss_kills_tier_0 || 0,
      t2: boss.boss_kills_tier_1 || 0,
      t3: boss.boss_kills_tier_2 || 0,
      t4: boss.boss_kills_tier_3 || 0,
      t5: boss.boss_kills_tier_4 || 0
    };

    return {
      id: def.key,
      name: def.name,
      icon: def.icon,
      type: def.type,
      kills,
      totalKills: Object.values(kills).reduce((a, b) => a + b, 0),
      ...calc
    };
  });

  return {
    slayers: results,
    totalXp: totalSlayerXp
  };
}

/**
 * Calculate Dungeons Data (Catacombs, Classes, Floors, Secrets)
 */
export function calculateDungeons(dungeonData, secretsFound = 0) {
  const catacombs = dungeonData?.dungeon_types?.catacombs || {};
  const masterCatacombs = dungeonData?.dungeon_types?.master_catacombs || {};
  const classes = dungeonData?.player_classes || {};
  
  const cataXp = catacombs.experience || 0;
  const cataCalc = calculateLevelFromTable(cataXp, CATACOMBS_XP_TABLE, 50);

  const classList = ['healer', 'mage', 'berserk', 'archer', 'tank'];
  const formattedClasses = classList.map(c => {
    const rawXp = classes[c]?.experience || 0;
    const calc = calculateLevelFromTable(rawXp, CATACOMBS_XP_TABLE, 50);
    return {
      id: c,
      name: c.charAt(0).toUpperCase() + c.slice(1),
      selected: (dungeonData?.selected_dungeon_class || '').toLowerCase() === c,
      ...calc
    };
  });

  // Floor completions
  const floorCompletions = {};
  for (let f = 1; f <= 7; f++) {
    floorCompletions[`F${f}`] = catacombs.tier_completions?.[f] || 0;
  }
  floorCompletions['Entrance'] = catacombs.tier_completions?.[0] || 0;

  const masterCompletions = {};
  for (let m = 1; m <= 7; m++) {
    masterCompletions[`M${m}`] = masterCatacombs.tier_completions?.[m] || 0;
  }

  return {
    catacombs: cataCalc,
    selectedClass: dungeonData?.selected_dungeon_class || 'None',
    classes: formattedClasses,
    secrets: secretsFound,
    floorCompletions,
    masterCompletions,
    highestFloorCompleted: catacombs.highest_tier_completed || 0
  };
}

/**
 * Calculate Mining & Heart of the Mountain (HotM)
 */
export function calculateHotM(miningCore, skillTree) {
  if (!miningCore && !skillTree) return null;

  const exp = skillTree?.experience?.mining || miningCore?.experience || 0;
  const hotmCalc = calculateLevelFromTable(exp, HOTM_XP_TABLE, 10);

  const nodes = {
    ...(skillTree?.nodes?.mining || {}),
    ...(miningCore?.nodes || {})
  };

  return {
    ...hotmCalc,
    powders: {
      mithril: {
        current: miningCore?.powder_mithril || 0,
        spent: miningCore?.powder_spent_mithril || 0,
        total: (miningCore?.powder_mithril || 0) + (miningCore?.powder_spent_mithril || 0)
      },
      gemstone: {
        current: miningCore?.powder_gemstone || 0,
        spent: miningCore?.powder_spent_gemstone || 0,
        total: (miningCore?.powder_gemstone || 0) + (miningCore?.powder_spent_gemstone || 0)
      },
      glacite: {
        current: miningCore?.powder_glacite || 0,
        spent: miningCore?.powder_spent_glacite || 0,
        total: (miningCore?.powder_glacite || 0) + (miningCore?.powder_spent_glacite || 0)
      }
    },
    tokens: miningCore?.tokens || 0,
    nodes,
    crystals: miningCore?.crystals || {}
  };
}

/**
 * Calculate Pets
 */
export function calculatePets(petsArray = []) {
  if (!Array.isArray(petsArray)) return [];

  return petsArray.map(pet => {
    // Basic pet level approximate (max 100, Golden Dragon 200)
    const isGdrag = pet.type === 'GOLDEN_DRAGON';
    const maxLvl = isGdrag ? 200 : 100;
    
    // Approximate level from XP (standard legendary pet needs ~25.3M XP for lvl 100)
    let approxLvl = 1;
    if (pet.exp > 0) {
      if (isGdrag) {
        approxLvl = Math.min(200, Math.max(1, Math.floor(Math.cbrt(pet.exp / 25)) + 1));
      } else {
        approxLvl = Math.min(100, Math.max(1, Math.floor(Math.pow(pet.exp / 25300000, 0.4) * 100)));
      }
    }

    return {
      type: pet.type,
      cleanName: pet.type ? pet.type.replace(/_/g, ' ') : 'Unknown Pet',
      tier: pet.tier || 'COMMON',
      exp: Math.floor(pet.exp || 0),
      level: approxLvl,
      maxLevel: maxLvl,
      heldItem: pet.heldItem ? pet.heldItem.replace(/^PET_ITEM_/, '').replace(/_/g, ' ') : null,
      candyUsed: pet.candyUsed || 0,
      active: Boolean(pet.active),
      skin: pet.skin || null
    };
  }).sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0) || b.level - a.level);
}

/**
 * Format Garden Data
 */
export function calculateGarden(gardenData, memberGardenData) {
  if (!gardenData?.garden) return null;
  const g = gardenData.garden;

  const exp = g.garden_experience || 0;
  const gardenLevel = calculateLevelFromTable(exp, GARDEN_XP_TABLE, 15);

  const visitors = g.commission_data?.visits || {};
  let totalVisits = 0;
  const uniqueVisitors = Object.keys(visitors).length;
  for (const count of Object.values(visitors)) {
    totalVisits += count;
  }

  return {
    level: gardenLevel,
    unlockedPlotsCount: g.unlocked_plots_ids?.length || 0,
    plots: g.unlocked_plots_ids || [],
    resourcesCollected: g.resources_collected || {},
    visitors: {
      unique: uniqueVisitors,
      total: totalVisits,
      list: visitors
    },
    composter: {
      organicMatter: Math.floor(g.composter_data?.organic_matter || 0),
      fuelUnits: Math.floor(g.composter_data?.fuel_units || 0),
      compostUnits: g.composter_data?.compost_units || 0,
      compostItems: g.composter_data?.compost_items || 0,
      upgrades: g.composter_data?.upgrades || {}
    },
    copper: memberGardenData?.copper || 0,
    barnSkin: g.selected_barn_skin || 'DEFAULT',
    unlockedBarnSkins: g.unlocked_barn_skins || []
  };
}

/**
 * Format Economy & Banking Data
 */
export function calculateEconomy(profileBanking, memberCurrencies) {
  return {
    bankBalance: profileBanking?.balance || 0,
    formattedBank: formatCoins(profileBanking?.balance || 0),
    transactions: (profileBanking?.transactions || []).map(tx => ({
      action: tx.action,
      amount: tx.amount,
      formattedAmount: formatCoins(tx.amount),
      initiator: tx.initiator_name || 'Co-op Member',
      timestamp: tx.timestamp
    })),
    coinPurse: memberCurrencies?.coin_purse || 0,
    formattedPurse: formatCoins(memberCurrencies?.coin_purse || 0),
    motesPurse: memberCurrencies?.motes_purse || 0,
    essences: memberCurrencies?.essence || {}
  };
}
