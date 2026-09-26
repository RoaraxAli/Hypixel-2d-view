import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  API_KEY,
  rateLimitStatus,
  resolvePlayer,
  getPlayerInfo,
  getSkyblockProfiles,
  getSkyblockProfile,
  getGardenData,
  getBazaar,
  getAuctions,
  getAuction,
  getEndedAuctions,
  getElection,
  getFiresales,
  getNews,
  getPlayerBingo,
  getBingoResources,
  getMasterItems,
  getSkillsReference,
  getCollectionsReference,
  getMuseumData
} from './lib/hypixelApi.js';

import { parseNbtItems, formatMinecraftText, stripMinecraftCodes } from './lib/nbtParser.js';
import {
  calculateSkills,
  calculateSlayers,
  calculateDungeons,
  calculateHotM,
  calculatePets,
  calculateGarden,
  calculateEconomy,
  formatCoins
} from './lib/skyblockUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Server & API Key Health
app.get('/api/status', (req, res) => {
  const maskedKey = `${API_KEY.slice(0, 8)}...${API_KEY.slice(-4)}`;
  res.json({
    status: 'ONLINE',
    apiKeyMasked: maskedKey,
    apiKeyValid: true,
    rateLimit: rateLimitStatus,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: Date.now()
  });
});

// Resolve & Fetch Full Player Data
app.get('/api/player/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const requestedProfileId = req.query.profile;

    // 1. Resolve Username to UUID
    const player = await resolvePlayer(query);
    const uuid = player.uuid;

    // 2. Fetch Player Info & SkyBlock Profiles in parallel
    const [playerInfoRes, profilesRes] = await Promise.all([
      getPlayerInfo(uuid).catch(() => null),
      getSkyblockProfiles(uuid)
    ]);

    const hypixelPlayer = playerInfoRes?.player || {};
    const profiles = profilesRes?.profiles || [];

    if (!profiles || profiles.length === 0) {
      return res.status(404).json({
        error: `Player '${player.username}' has no SkyBlock profiles.`,
        player
      });
    }

    // Determine Rank
    let rank = 'DEFAULT';
    if (hypixelPlayer.rank && hypixelPlayer.rank !== 'NORMAL') rank = hypixelPlayer.rank;
    else if (hypixelPlayer.monthlyPackageRank && hypixelPlayer.monthlyPackageRank !== 'NONE') rank = 'MVP++';
    else if (hypixelPlayer.newPackageRank) rank = hypixelPlayer.newPackageRank.replace('_PLUS', '+');
    else if (hypixelPlayer.packageRank) rank = hypixelPlayer.packageRank.replace('_PLUS', '+');

    // Rank prefix colors
    const rankColors = {
      'VIP': '#55FF55',
      'VIP+': '#55FF55',
      'MVP': '#55FFFF',
      'MVP+': '#55FFFF',
      'MVP++': '#FFAA00',
      'ADMIN': '#FF5555',
      'YOUTUBER': '#FF5555',
      'DEFAULT': '#AAAAAA'
    };

    // Profiles summary list
    const profileSummaries = profiles.map(p => ({
      profileId: p.profile_id,
      cuteName: p.cute_name || 'SkyBlock',
      gameMode: p.game_mode || 'standard',
      selected: Boolean(p.selected),
      lastSave: p.members?.[uuid]?.last_save || 0,
      memberCount: Object.keys(p.members || {}).length
    }));

    // Find requested or selected profile
    let activeProfile = profiles.find(p => p.profile_id === requestedProfileId);
    if (!activeProfile) {
      activeProfile = profiles.find(p => p.selected) || profiles[0];
    }

    const member = activeProfile.members?.[uuid] || {};

    // Privacy Checks
    const hasInventory = Boolean(member.inventory?.inv_contents?.data || member.inv_contents?.data);
    const hasSkills = Boolean(member.player_data?.experience && Object.keys(member.player_data.experience).length > 0);
    const hasBanking = Boolean(activeProfile.banking?.balance !== undefined);
    const hasCollections = Boolean(member.collection && Object.keys(member.collection).length > 0);

    const privacy = {
      inventoryRestricted: !hasInventory,
      skillsRestricted: !hasSkills,
      bankingRestricted: !hasBanking,
      collectionsRestricted: !hasCollections
    };

    // Decode Inventories
    let decodedInventories = {
      armor: [],
      equipment: [],
      inventory: [],
      enderChest: [],
      backpacks: [],
      talismanBag: [],
      potionBag: [],
      fishingBag: [],
      personalVault: []
    };

    if (hasInventory) {
      const invData = member.inventory || {};
      const bagData = invData.bag_contents || {};

      const [armor, equipment, inventory, enderChest, talismanBag, potionBag, fishingBag, personalVault] = await Promise.all([
        parseNbtItems(invData.inv_armor?.data),
        parseNbtItems(invData.equipment_contents?.data),
        parseNbtItems(invData.inv_contents?.data || member.inv_contents?.data),
        parseNbtItems(invData.ender_chest_contents?.data),
        parseNbtItems(bagData.talisman_bag?.data),
        parseNbtItems(bagData.potion_bag?.data),
        parseNbtItems(bagData.fishing_bag?.data),
        parseNbtItems(invData.personal_vault_contents?.data)
      ]);

      // Reverse armor to Helmet -> Boots order for display
      decodedInventories.armor = armor.reverse();
      decodedInventories.equipment = equipment;
      decodedInventories.inventory = inventory;
      decodedInventories.enderChest = enderChest;
      decodedInventories.talismanBag = talismanBag;
      decodedInventories.potionBag = potionBag;
      decodedInventories.fishingBag = fishingBag;
      decodedInventories.personalVault = personalVault;

      // Backpacks
      if (invData.backpack_contents) {
        const bpEntries = Object.entries(invData.backpack_contents);
        for (const [idx, bp] of bpEntries) {
          if (bp?.data) {
            const items = await parseNbtItems(bp.data);
            decodedInventories.backpacks.push({
              index: parseInt(idx, 10),
              name: `Backpack #${parseInt(idx, 10) + 1}`,
              items
            });
          }
        }
      }
    }

    // Calculate Skills, Slayers, Dungeons, Mining, Pets
    const skillsData = calculateSkills(member);
    const slayersData = calculateSlayers(member.slayer);
    const secretsFound = hypixelPlayer.achievements?.skyblock_treasure_hunter || 0;
    const dungeonsData = calculateDungeons(member.dungeons, secretsFound);
    const hotmData = calculateHotM(member.mining_core, member.skill_tree);
    const petsData = calculatePets(member.pets_data?.pets);
    const economyData = calculateEconomy(activeProfile.banking, member.currencies);

    // Rift Data
    const rift = member.rift || {};
    const riftData = {
      enigmaSouls: rift.enigma?.found_souls?.length || 0,
      totalEnigmaSouls: 42,
      timecharms: (rift.gallery?.secured_trophies || []).map(t => ({
        type: t.type,
        timestamp: t.timestamp,
        visits: t.visits
      })),
      deadCats: rift.dead_cats || {}
    };

    // Garden Data
    const gardenRaw = await getGardenData(activeProfile.profile_id);
    const gardenData = calculateGarden(gardenRaw, member.garden_player_data);

    // Misc Stats
    const miscStats = {
      skyblockLevel: member.leveling?.experience ? Math.floor(member.leveling.experience / 100) : 0,
      deaths: member.player_data?.death_count || member.player_stats?.deaths || 0,
      kills: member.player_stats?.kills || 0,
      fairySouls: member.fairy_soul?.total_collected || hypixelPlayer.achievements?.skyblock_harvester || 0,
      communityUpgrades: activeProfile.community_upgrades || null,
      visitedZones: member.player_data?.visited_zones || []
    };

    res.json({
      player: {
        uuid: player.uuid,
        username: player.username,
        rank,
        rankColor: rankColors[rank] || '#AAAAAA',
        firstLogin: hypixelPlayer.firstLogin || 0,
        lastLogin: hypixelPlayer.lastLogin || 0,
        avatarUrl: `https://mc-heads.net/avatar/${player.uuid}/100`
      },
      profiles: profileSummaries,
      selectedProfile: {
        profileId: activeProfile.profile_id,
        cuteName: activeProfile.cute_name || 'SkyBlock',
        gameMode: activeProfile.game_mode || 'standard',
        lastSave: member.last_save || 0
      },
      privacy,
      inventories: decodedInventories,
      skills: skillsData,
      slayers: slayersData,
      dungeons: dungeonsData,
      mining: hotmData,
      pets: petsData,
      rift: riftData,
      garden: gardenData,
      economy: economyData,
      misc: miscStats
    });
  } catch (err) {
    console.error('Error fetching player profile:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch player profile' });
  }
});

// Bazaar Endpoint with Margins & Quick Search
app.get('/api/bazaar', async (req, res) => {
  try {
    const data = await getBazaar();
    const rawProducts = data.products || {};

    const products = Object.values(rawProducts).map(p => {
      const q = p.quick_status || {};
      const buyPrice = q.buyPrice || 0;
      const sellPrice = q.sellPrice || 0;
      const spread = buyPrice - sellPrice;
      const marginPercent = sellPrice > 0 ? (spread / sellPrice) * 100 : 0;
      const weeklyVolume = (q.buyMovingWeek || 0) + (q.sellMovingWeek || 0);

      // Clean title from ID (e.g. ENCHANTED_CARROT_ON_A_STICK -> Enchanted Carrot On A Stick)
      const cleanName = p.product_id
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase());

      return {
        id: p.product_id,
        name: cleanName,
        buyPrice,
        sellPrice,
        spread,
        marginPercent: parseFloat(marginPercent.toFixed(1)),
        buyVolume: q.buyVolume || 0,
        sellVolume: q.sellVolume || 0,
        buyOrders: q.buyOrders || 0,
        sellOrders: q.sellOrders || 0,
        weeklyVolume,
        topBuyOrder: p.buy_summary?.[0] || null,
        topSellOffer: p.sell_summary?.[0] || null
      };
    });

    res.json({
      success: true,
      lastUpdated: data.lastUpdated,
      totalProducts: products.length,
      products
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Detailed Bazaar Product
app.get('/api/bazaar/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const data = await getBazaar();
    const product = data.products?.[productId.toUpperCase()];

    if (!product) {
      return res.status(404).json({ error: `Product '${productId}' not found in Bazaar.` });
    }

    res.json({
      success: true,
      product
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Active Auctions with Pagination and Filters
app.get('/api/auctions', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 0;
    const binOnly = req.query.bin === 'true';
    const category = req.query.category || 'all';
    const tier = req.query.tier || 'all';
    const query = (req.query.query || '').trim().toLowerCase();
    const sort = req.query.sort || 'ending_soon';

    const data = await getAuctions(page);
    let auctions = data.auctions || [];

    // Filter
    if (binOnly) {
      auctions = auctions.filter(a => a.bin);
    }
    if (category !== 'all') {
      auctions = auctions.filter(a => a.category?.toLowerCase() === category.toLowerCase());
    }
    if (tier !== 'all') {
      auctions = auctions.filter(a => a.tier?.toLowerCase() === tier.toLowerCase());
    }
    if (query) {
      auctions = auctions.filter(a =>
        a.item_name?.toLowerCase().includes(query) ||
        a.item_lore?.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sort === 'price_asc') {
      auctions.sort((a, b) => (a.bin ? a.starting_bid : (a.highest_bid_amount || a.starting_bid)) - (b.bin ? b.starting_bid : (b.highest_bid_amount || b.starting_bid)));
    } else if (sort === 'price_desc') {
      auctions.sort((a, b) => (b.bin ? b.starting_bid : (b.highest_bid_amount || b.starting_bid)) - (a.bin ? a.starting_bid : (a.highest_bid_amount || a.starting_bid)));
    } else if (sort === 'ending_soon') {
      auctions.sort((a, b) => a.end - b.end);
    }

    const formatted = auctions.map(a => {
      const price = a.bin ? a.starting_bid : (a.highest_bid_amount || a.starting_bid);
      return {
        uuid: a.uuid,
        itemName: a.item_name,
        formattedName: formatMinecraftText(a.item_name),
        tier: a.tier || 'COMMON',
        category: a.category,
        bin: Boolean(a.bin),
        price,
        formattedPrice: formatCoins(price),
        bidsCount: a.bids?.length || 0,
        auctioneer: a.auctioneer,
        start: a.start,
        end: a.end,
        loreHtml: a.item_lore ? a.item_lore.split('\n').map(l => formatMinecraftText(l)) : []
      };
    });

    res.json({
      success: true,
      page: data.page,
      totalPages: data.totalPages,
      totalAuctions: data.totalAuctions,
      count: formatted.length,
      auctions: formatted
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ended Auctions Feed (Last 60 Seconds)
app.get('/api/auctions/ended', async (req, res) => {
  try {
    const data = await getEndedAuctions();
    const rawAuctions = data.auctions || [];

    // Parse items for the top 50 ended auctions
    const formatted = await Promise.all(
      rawAuctions.slice(0, 60).map(async a => {
        let parsedItem = null;
        if (a.item_bytes) {
          const items = await parseNbtItems(a.item_bytes);
          parsedItem = items[0] || null;
        }

        return {
          auctionId: a.auction_id,
          seller: a.seller,
          buyer: a.buyer,
          timestamp: a.timestamp,
          price: a.price,
          formattedPrice: formatCoins(a.price),
          bin: Boolean(a.bin),
          item: parsedItem
        };
      })
    );

    res.json({
      success: true,
      lastUpdated: data.lastUpdated,
      count: formatted.length,
      auctions: formatted
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mayoral Election & Current Mayor
app.get('/api/election', async (req, res) => {
  try {
    const data = await getElection();
    
    // Calculate candidate vote shares
    let totalVotes = 0;
    const candidates = data.current?.candidates || [];
    for (const c of candidates) {
      totalVotes += (c.votes || 0);
    }

    const candidatesWithPercent = candidates.map(c => ({
      name: c.name,
      votes: c.votes || 0,
      formattedVotes: (c.votes || 0).toLocaleString(),
      percentage: totalVotes > 0 ? parseFloat(((c.votes / totalVotes) * 100).toFixed(1)) : 0,
      perks: c.perks || []
    })).sort((a, b) => b.votes - a.votes);

    res.json({
      success: true,
      lastUpdated: data.lastUpdated,
      mayor: data.mayor || null,
      electionActive: Boolean(data.current),
      currentElection: {
        year: data.current?.year || null,
        totalVotes,
        formattedTotalVotes: totalVotes.toLocaleString(),
        candidates: candidatesWithPercent
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fire Sales
app.get('/api/firesales', async (req, res) => {
  try {
    const data = await getFiresales();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SkyBlock News
app.get('/api/news', async (req, res) => {
  try {
    const data = await getNews();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bingo Data (Resources + optional player UUID)
app.get('/api/bingo', async (req, res) => {
  try {
    const { uuid } = req.query;
    const [resources, personal] = await Promise.all([
      getBingoResources(),
      uuid ? getPlayerBingo(uuid) : null
    ]);

    res.json({
      success: true,
      event: {
        id: resources.id,
        name: resources.name,
        start: resources.start,
        end: resources.end,
        modifier: resources.modifier,
        goals: resources.goals || []
      },
      personal: personal?.events || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Master Item Encyclopedia
app.get('/api/resources/items', async (req, res) => {
  try {
    const data = await getMasterItems();
    const rawItems = data.items || [];
    const query = (req.query.query || '').trim().toLowerCase();
    const tier = req.query.tier || 'all';
    const category = req.query.category || 'all';

    let filtered = rawItems;
    if (query) {
      filtered = filtered.filter(i =>
        i.name?.toLowerCase().includes(query) ||
        i.id?.toLowerCase().includes(query)
      );
    }
    if (tier !== 'all') {
      filtered = filtered.filter(i => i.tier?.toLowerCase() === tier.toLowerCase());
    }
    if (category !== 'all') {
      filtered = filtered.filter(i => i.category?.toLowerCase() === category.toLowerCase());
    }

    res.json({
      success: true,
      totalCount: rawItems.length,
      filteredCount: filtered.length,
      items: filtered.slice(0, 100) // Paginated slice for fast rendering
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Skills Reference
app.get('/api/resources/skills', async (req, res) => {
  try {
    const data = await getSkillsReference();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Collections Reference
app.get('/api/resources/collections', async (req, res) => {
  try {
    const data = await getCollectionsReference();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SkyBlock Museum Data
app.get('/api/museum', async (req, res) => {
  try {
    const { profile, uuid } = req.query;
    if (!profile) {
      return res.status(400).json({ error: 'Missing profile query parameter' });
    }

    const rawMuseum = await getMuseumData(profile);
    if (!rawMuseum || !rawMuseum.members) {
      return res.json({
        success: true,
        museum: null
      });
    }

    // Select the player's member entry, or the first member
    const memberKey = (uuid && rawMuseum.members[uuid]) ? uuid : Object.keys(rawMuseum.members)[0];
    const memberData = rawMuseum.members[memberKey];

    if (!memberData) {
      return res.json({
        success: true,
        museum: null
      });
    }

    const itemsEntries = Object.entries(memberData.items || {});
    const specialEntries = Array.isArray(memberData.special) ? memberData.special : [];

    const [weaponsArmor, specialItems] = await Promise.all([
      Promise.all(itemsEntries.map(async ([key, val]) => {
        let parsed = [];
        if (val?.items?.data) {
          parsed = await parseNbtItems(val.items.data);
        }
        return {
          id: key,
          donatedTime: val?.donated_time || 0,
          borrowing: val?.borrowing || false,
          item: parsed[0] || null
        };
      })),
      Promise.all(specialEntries.map(async (spec, idx) => {
        let parsed = [];
        if (spec?.items?.data) {
          parsed = await parseNbtItems(spec.items.data);
        }
        return {
          index: idx,
          donatedTime: spec?.donated_time || 0,
          item: parsed[0] || null
        };
      }))
    ]);

    res.json({
      success: true,
      museum: {
        value: memberData.value || 0,
        appraisal: memberData.appraisal || false,
        totalItemsCount: weaponsArmor.length + specialItems.length,
        weaponsArmorCount: weaponsArmor.length,
        specialItemsCount: specialItems.length,
        weaponsArmor,
        specialItems
      }
    });
  } catch (err) {
    console.error('Error fetching museum data:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Hypixel SkyBlock Intelligence Platform Running!`);
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🔑 Key: ${API_KEY.slice(0, 8)}...${API_KEY.slice(-4)}`);
  console.log(`====================================================`);
});
