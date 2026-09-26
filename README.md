# Hypixel SkyBlock Intelligence Platform (Hypixel by Ali)

A real-time, comprehensive intelligence and analytics platform for **Hypixel SkyBlock**, powered by the official Hypixel Development API.

---

## 🚀 Running the Web Platform

The server is currently running locally on:
👉 **[http://localhost:3000](http://localhost:3000)**

To run locally in development mode:
```bash
npm run dev
```

To build and run in production:
```bash
npm run build
npm start
```

### 🗺️ Official Hub Village Map Navigation (No Traditional Navbar)
- **Interactive Top-Down Hub Map**: The entire platform is built directly inside the official top-down aerial map of the Hypixel SkyBlock Hub Village!
- **Floating 3D Holographic Pins**: Hovering above each house/building is a floating badge with real-time stats:
  - 👑 **Community Center** (Top Castle): Mayor & Minister Perks, Live Election Candidate Polls, Fire Sales
  - 🏛️ **Auction House** (Top-Left Red Roof): Active Listings, BIN Filters & 60s Ended Snipes
  - 🏦 **The Bank** (Right Dome): Bank Account Balance, Coin Purse, 50-Item Co-op Transaction Ledger & Essences
  - ⚖️ **Bazaar Alley** (Mid-Left Market): 2,100+ Commodities, Order Book Depth & Arbitrage Flips
  - 🎮 **Player Spawn Plaza** (Center Well): Equipped Armor & Equipment, 36-slot Inventory, Skills 1–60, Slayers, Pets & The Rift
  - 🌾 **The Garden** (Left Bridge): Garden Level 1–15, Unlocked Plots, Visitors & Composter
  - ⛏️ **Deep Caverns** (Upper-Left Trail): Mining & HotM Tree Perks, Powders & Crystals
  - 🏰 **Catacombs & Slayers** (Right Forest): Floors F1–F7, Master Mode M1–M7 & 6 Slayer Bosses
  - 🎯 **Bingo Hub** (South Pavilion): Active 5x5 Event Goals & Community Challenges
  - 📰 **Update Board** (Plaza Stairs): Official Hypixel SkyBlock Update Threads & Patch Notes
  - 📚 **Item Encyclopedia** (Upper-Right Library): 5,655 Items Database, Skills XP Tables & Collections
- **Everything Happens Inside the Hub**: Clicking any building opens an in-game SkyBlock dialog overlay. Press `ESC` or click `✕ Close` to return to the map view!
- **In-Game Minecraft Scoreboard**: Positioned on the right, updating with live SkyBlock Date, Time, Location (`⏣ Village`), Player IGN, Profile Cute Name, Purse, and Bank balances.
- **In-Game Minecraft Hotbar**: 9 interactive slots at the bottom with keyboard shortcuts (`1` to `9`) to quickly jump to any house!
- **Initial Username Prompt**: New visitors are greeted by a SkyBlock welcome dialog prompting them for their IGN or UUID with persistent memory.

---

## 🔑 Environment Variables & API Key
- **Environment Variable**: `HYPIXEL_API_KEY`
- Configured in [`.env.local`](file:///c:/Users/Muhammad%20Ali/Downloads/Hypixel-by-ali/.env.local) for local development (and added to your hosting provider like Vercel for production).
- See [`.env.example`](file:///c:/Users/Muhammad%20Ali/Downloads/Hypixel-by-ali/.env.example) for the template.
- **Rate Limit**: Monitored dynamically with real-time remaining quota indicators and caching layers to guarantee zero 429 throttling.

---

## 📋 Features & Implemented Endpoints

### 1. Player & Dynamic Profile Data
- **/v2/skyblock/profile & /v2/skyblock/profiles**:
  - **Inventories & Items**: Decodes Base64-encoded, Gzipped NBT strings using `prismarine-nbt`. Renders Armor (Helmet, Chestplate, Leggings, Boots), Equipment (Necklace, Cloak, Belt, Gloves), Main 36-slot Inventory, Ender Chest, 18 Backpacks, Accessory Bag (Talismans), Potion Bag, Fishing Bag, and Personal Vault.
  - **Item Metadata**: Parses Minecraft color codes (`§`), custom item IDs, enchants, reforge modifiers, regular stars (`✪`), master stars (`➊➋➌➍➎`), gem sockets, runes, and hot potato book counts into interactive Minecraft GUI tooltips.
  - **Progression & Skills**: Raw skill XP for Combat, Farming, Mining, Foraging, Fishing, Enchanting, Alchemy, Carpentry, Taming, Runecrafting, Social, and Hunting. Calculates exact levels 1–60, current XP, next XP, and progress percentages.
  - **Slayer Bosses**: XP, levels, and kill tier counters (Tier I through Tier V) for Revenant Horror, Tarantula Broodmother, Sven Packmaster, Voidgloom Seraph, Inferno Demonlord, and Riftstalker Bloodfiend.
  - **Dungeons**: Catacombs level & XP curve (0–50), Class levels (Healer, Mage, Berserk, Archer, Tank), highest floors beaten (Entrance, F1–F7), Master Mode completions (M1–M7), and Secrets discovered (via `achievements.skyblock_treasure_hunter`).
  - **Mining & Heart of the Mountain (HotM)**: HotM tree perks and levels 1–10 (supporting both modern unified `skill_tree` and legacy `mining_core`), Mithril Powder, Gemstone Powder, Glacite Powder (available & total spent), and Crystal Hollows gemstone crystals (Topaz, Jade, Amber, Sapphire, Amethyst, Jasper, Ruby).
  - **Pets**: Complete list of owned pets with rarity tier, calculated level (1–100 or 1–200 for Golden Dragon), held pet item, candy count, and active pet indicator.
  - **The Rift**: Secured Timecharms from the Elise Gallery, Enigma Souls collected count (/42), and Dead Cats progression.
  - **Economy**: Profile bank balance, 50-item transaction ledger with action/initiator/date, player coin purse, motes, and essence counters.
  - **Misc Stats**: Death counts, mob kill tracking, fairy souls found, and active community center upgrades.
  - **/v2/skyblock/garden**: Dedicated farming garden data including Garden level, crop milestones, unlocked plots (/24), visitor statistics (accepted and unique), composter status (organic matter, fuel levels, upgrades), barn skins, and copper balance.
  - **Player Privacy Settings**: Gracefully detects when players have restricted their Inventory, Skills, Collections, or Banking APIs, rendering a helpful alert banner with instructions (`/settings` -> `API Settings`).

### 2. Economy & Market Data
- **/v2/skyblock/bazaar**:
  - Over 2,100 commodities tracked in real-time.
  - Instant Buy & Instant Sell pricing, spread, margin percentage, and 7-day moving volume.
  - Top Arbitrage Flips spotlight.
  - Interactive Order Book depth modal showing Top 10 Buy Orders vs Top 10 Sell Offers.
- **/v2/skyblock/auctions & /v2/skyblock/auction**:
  - Paginated feed of active auction house listings.
  - Live filters: Buy It Now (BIN), Categories, Rarity tiers, Sort options (Ending soon, lowest price, highest price), and text search.
- **/v2/skyblock/auctions_ended**:
  - Stream of completed auctions within the last 60 seconds with decoded NBT item preview, sale price, buyer, and seller.

### 3. Events, Competitions & Server Meta
- **/v2/skyblock/bingo**: Active Bingo event status, 5x5 Bingo Board challenge grid, personal progress, and community goals.
- **/v2/skyblock/firesales**: Scheduled and active Fire Sales with gem cost, total stock, amount sold, and progress bar.
- **/v2/skyblock/news**: Live Hypixel forum SkyBlock update threads and patch notes.

### 4. Static Resources Reference Data (/v2/resources/skyblock/*)
- **/collections**: Complete collections breakdown (Farming, Mining, Combat, Foraging, Fishing, Rift) with tier thresholds and rewards.
- **/skills**: Complete XP requirement curve for levels 1–60 across all skills.
- **/items**: Master Item Encyclopedia containing 5,655 items with base stats (Damage, Strength, Crit Chance, Intelligence, etc.), rarity, and NPC sell value.
- **/election**: Mayoral election state with active Mayor perks, Minister, and live election voting booth candidate vote counts and percentages.
- **/bingo**: Reference standard challenge cards.
