// Hypixel API Manager with Caching and Rate Limit Protection
const API_KEY = process.env.HYPIXEL_API_KEY || "3f57f6d0-6dbc-472d-b36c-6dee0b804523";
const HYPIXEL_BASE = "https://api.hypixel.net/v2";

// In-memory Cache Store
const cache = new Map();

function getCache(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expires) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCache(key, data, ttlSeconds) {
  cache.set(key, {
    data,
    expires: Date.now() + (ttlSeconds * 1000)
  });
}

// Rate limit tracker
export const rateLimitStatus = {
  limit: 300,
  remaining: 300,
  reset: 0,
  lastChecked: Date.now()
};

async function fetchHypixel(endpoint, options = {}, ttlSeconds = 60) {
  const cacheKey = endpoint;
  const cached = getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const url = `${HYPIXEL_BASE}${endpoint}`;
  const headers = {
    "User-Agent": "Hypixel-Skyblock-Portal/1.0",
    ...(options.requiresKey !== false ? { "API-Key": API_KEY } : {}),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, { headers });
    
    // Update rate limit stats if headers present
    if (res.headers.get("ratelimit-limit")) {
      rateLimitStatus.limit = parseInt(res.headers.get("ratelimit-limit"), 10) || rateLimitStatus.limit;
      rateLimitStatus.remaining = parseInt(res.headers.get("ratelimit-remaining"), 10) || rateLimitStatus.remaining;
      rateLimitStatus.reset = parseInt(res.headers.get("ratelimit-reset"), 10) || 0;
      rateLimitStatus.lastChecked = Date.now();
    }

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(`Hypixel API error ${res.status}: ${errBody.cause || res.statusText}`);
    }

    const data = await res.json();
    if (ttlSeconds > 0) {
      setCache(cacheKey, data, ttlSeconds);
    }
    return data;
  } catch (err) {
    console.error(`Fetch error on ${endpoint}:`, err.message);
    throw err;
  }
}

// Resolve Username to UUID via Mojang API
export async function resolvePlayer(query) {
  const clean = query.trim().replace(/-/g, "");
  
  // If it's already a 32-char hex UUID
  if (/^[0-9a-fA-F]{32}$/.test(clean)) {
    // Fetch username from Mojang session server
    const cached = getCache(`mojang_uuid_${clean}`);
    if (cached) return cached;
    try {
      const res = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${clean}`);
      if (res.ok) {
        const mojang = await res.json();
        const result = { uuid: clean, username: mojang.name };
        setCache(`mojang_uuid_${clean}`, result, 3600);
        return result;
      }
    } catch {
      // Fallback
    }
    return { uuid: clean, username: clean };
  }

  // Otherwise treat as username
  const cached = getCache(`mojang_name_${clean.toLowerCase()}`);
  if (cached) return cached;

  const res = await fetch(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(clean)}`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Minecraft player '${query}' not found.`);
    }
    throw new Error(`Mojang API error: ${res.statusText}`);
  }

  const data = await res.json();
  const result = { uuid: data.id, username: data.name };
  setCache(`mojang_name_${clean.toLowerCase()}`, result, 3600);
  setCache(`mojang_uuid_${data.id}`, result, 3600);
  return result;
}

// Player basic profile & network stats (Rank, Level, Secrets achievement)
export async function getPlayerInfo(uuid) {
  return fetchHypixel(`/player?uuid=${uuid}`, {}, 120);
}

// Player SkyBlock profiles
export async function getSkyblockProfiles(uuid) {
  return fetchHypixel(`/skyblock/profiles?uuid=${uuid}`, {}, 60);
}

// SkyBlock single profile
export async function getSkyblockProfile(profileId) {
  return fetchHypixel(`/skyblock/profile?profile=${profileId}`, {}, 60);
}

// Garden data
export async function getGardenData(profileId) {
  try {
    return await fetchHypixel(`/skyblock/garden?profile=${profileId}`, {}, 120);
  } catch {
    return null;
  }
}

// Bazaar data
export async function getBazaar() {
  return fetchHypixel(`/skyblock/bazaar`, {}, 30);
}

// Active Auctions
export async function getAuctions(page = 0) {
  return fetchHypixel(`/skyblock/auctions?page=${page}`, { requiresKey: false }, 60);
}

// Single / filtered auction
export async function getAuction(params = {}) {
  const query = new URLSearchParams(params).toString();
  return fetchHypixel(`/skyblock/auction?${query}`, { requiresKey: true }, 30);
}

// Ended auctions (last 60s stream)
export async function getEndedAuctions() {
  return fetchHypixel(`/skyblock/auctions_ended`, { requiresKey: false }, 30);
}

// Mayoral Election & Current Mayor
export async function getElection() {
  return fetchHypixel(`/resources/skyblock/election`, { requiresKey: false }, 300);
}

// Fire Sales
export async function getFiresales() {
  return fetchHypixel(`/skyblock/firesales`, {}, 120);
}

// SkyBlock News
export async function getNews() {
  return fetchHypixel(`/skyblock/news`, {}, 600);
}

// Bingo Personal Data
export async function getPlayerBingo(uuid) {
  try {
    return await fetchHypixel(`/skyblock/bingo?uuid=${uuid}`, {}, 300);
  } catch {
    return null;
  }
}

// Bingo Resource Data (Card goals & challenges)
export async function getBingoResources() {
  return fetchHypixel(`/resources/skyblock/bingo`, { requiresKey: false }, 300);
}

// Static Master Items Encyclopedia
export async function getMasterItems() {
  return fetchHypixel(`/resources/skyblock/items`, { requiresKey: false }, 3600);
}

// Static Skills XP Table
export async function getSkillsReference() {
  return fetchHypixel(`/resources/skyblock/skills`, { requiresKey: false }, 3600);
}

// Static Collections Reference
export async function getCollectionsReference() {
  return fetchHypixel(`/resources/skyblock/collections`, { requiresKey: false }, 3600);
}

// SkyBlock Museum Data
export async function getMuseumData(profileId) {
  try {
    return await fetchHypixel(`/skyblock/museum?profile=${profileId}`, {}, 120);
  } catch (err) {
    console.error(`Museum fetch error for ${profileId}:`, err.message);
    return null;
  }
}

export { API_KEY };
