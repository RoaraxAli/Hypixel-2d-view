import { NextResponse } from 'next/server';
import {
  resolvePlayer,
  getPlayerInfo,
  getSkyblockProfiles,
  getGardenData
} from '@/lib/hypixelApi';
import { parseNbtItems } from '@/lib/nbtParser';
import {
  calculateSkills,
  calculateSlayers,
  calculateDungeons,
  calculateHotM,
  calculatePets,
  calculateGarden,
  calculateEconomy
} from '@/lib/skyblockUtils';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { query } = params;
    const { searchParams } = new URL(request.url);
    const requestedProfileId = searchParams.get('profile');

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
      return NextResponse.json(
        {
          error: `Player '${player.username}' has no SkyBlock profiles.`,
          player
        },
        { status: 404 }
      );
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

    return NextResponse.json({
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
    return NextResponse.json(
      { error: err.message || 'Failed to fetch player profile' },
      { status: 500 }
    );
  }
}
