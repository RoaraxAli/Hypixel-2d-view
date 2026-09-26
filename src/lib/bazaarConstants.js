// Bazaar Categories and Groupings for Minecraft Chest GUI

export const BAZAAR_CATEGORIES = {
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

export const BAZAAR_PARENT_GROUPS = {
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

export function getGroupProducts(group, allProducts = []) {
  if (!group || !allProducts) return [];
  if (group.isFilter) {
    return allProducts.filter(group.isFilter);
  }
  if (!group.productIds) return [];

  const matched = [];
  const matchedIds = new Set();

  for (const targetId of group.productIds) {
    const p = allProducts.find(item => item.id.toUpperCase() === targetId.toUpperCase());
    if (p && !matchedIds.has(p.id)) {
      matched.push(p);
      matchedIds.add(p.id);
    }
  }

  for (const p of allProducts) {
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

export function getBazaarProductCategory(product) {
  const id = product.id.toUpperCase();
  if (id.startsWith('ENCHANTMENT_') || id.startsWith('ESSENCE_')) return 'oddities';
  if (/WHEAT|CARROT|POTATO|PUMPKIN|MELON|MUSHROOM|CACTUS|SUGAR|NETHER_STALK|BEEF|PORK|CHICKEN|MUTTON|RABBIT|FEATHER|LEATHER|EGG|PELLET|COMPOST|CROP|HAY|COCOA|BREAD/i.test(id)) return 'farming';
  if (/COBBLE|COAL|IRON|GOLD_INGOT|DIAMOND|EMERALD|LAPIS|REDSTONE|QUARTZ|OBSIDIAN|GLOWSTONE|GRAVEL|FLINT|ICE|NETHERRACK|SAND|ENDSTONE|END_STONE|MITHRIL|TITANIUM|HARD_STONE|CONCENTRATED_STONE|RUBY|SAPPHIRE|AMETHYST|AMBER|TOPAZ|JADE|JASPER|OPAL|GLACITE|TUNGSTEN|UMBER|STARFALL|TREASURITE/i.test(id)) return 'mining';
  if (/ROTTEN|BONE|STRING|GUNPOWDER|SULPHUR|ENDER_PEARL|EYE_OF_ENDER|GHAST_TEAR|SLIME|MAGMA_CREAM|BLAZE|SPIDER|WITHER|REVENANT|TARANTULA|WOLF_TOOTH|NULL_SPHERE|NULL_OVOID|SOULFLOW|DERELICT|VERTEX|APEX|INFERNO|HEMOGLASS|FANG|TENTACLE|ECTOPLASM/i.test(id)) return 'combat';
  if (/WOOD|LOG|OAK|SPRUCE|BIRCH|JUNGLE|ACACIA|DARK_OAK|FISH|SALMON|CLOWN|PUFFER|PRISMARINE|CLAY|WATER_LILY|LILY_PAD|SPONGE|SHARK|BAIT/i.test(id)) return 'fishing';
  return 'oddities';
}

export function getBazaarItemTexture(product) {
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

export function createProductSlotData(product) {
  const isEnchanted = product.id.startsWith('ENCHANTED_') || product.id.includes('ENCHANTMENT_');
  const rarityColor = isEnchanted ? '#FFAA00' : '#FFFFFF';
  const catName = BAZAAR_CATEGORIES[getBazaarProductCategory(product)]?.name || 'Commodity';

  return {
    type: 'product',
    product,
    id: product.id,
    name: product.name,
    icon: getBazaarItemTexture(product),
    enchanted: isEnchanted,
    rarityColor,
    rawItem: {
      rawName: product.name,
      formattedName: `<span style="color: ${rarityColor}; font-weight: bold">${product.name}</span>`,
      rarity: isEnchanted ? 'RARE' : 'COMMON',
      rarityColor,
      loreHtml: [
        `<span style="color: #AAAAAA">Category: <span style="color: #FFAA00">${catName}</span></span>`,
        '',
        `<span style="color: #55FF55">Buy Price (Instant): <span style="color: #FFFF55; font-weight: bold">${product.buyPrice ? product.buyPrice.toLocaleString() + ' coins' : 'N/A'}</span></span>`,
        `<span style="color: #FF5555">Sell Price (Instant): <span style="color: #FFFF55; font-weight: bold">${product.sellPrice ? product.sellPrice.toLocaleString() + ' coins' : 'N/A'}</span></span>`,
        `<span style="color: #55FFFF">Spread Margin: <span style="color: #FFAA00">${product.marginPercent}%</span></span>`,
        '',
        `<span style="color: #AAAAAA">Buy Orders: <span style="color: #FFFFFF">${(product.buyOrders || 0).toLocaleString()}</span></span>`,
        `<span style="color: #AAAAAA">Sell Offers: <span style="color: #FFFFFF">${(product.sellOrders || 0).toLocaleString()}</span></span>`,
        `<span style="color: #AAAAAA">Weekly Volume: <span style="color: #FFAA00">${(product.weeklyVolume || 0).toLocaleString()}</span></span>`,
        '',
        `<span style="color: #FFAA00; font-weight: bold">Click to view Order Book & Graph!</span>`
      ]
    }
  };
}
