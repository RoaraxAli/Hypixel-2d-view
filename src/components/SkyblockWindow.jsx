'use client';

export const DEST_META = {
  player: {
    title: 'Player Profile & Gear',
    subtitle: 'Inventories, Equipped Armor, Skills, Slayers & Pets',
  },
  auctions: {
    title: 'Auction House',
    subtitle: 'Active Listings, BIN Filters & Auctions Browser',
  },
  bazaar: {
    title: 'SkyBlock Bazaar Market',
    subtitle: '2,100+ Commodities, Order Book Depth & Arbitrage Flips',
  },
  economy: {
    title: 'The Bank & Personal Vault',
    subtitle: 'Coin Purse, Bank Account, Ledger & Personal Vault Storage',
  },
  bank: {
    title: 'The Bank & Personal Vault',
    subtitle: 'Coin Purse, Bank Account, Ledger & Personal Vault Storage',
  },
  dungeons: {
    title: 'Catacombs & Slayer Mastery',
    subtitle: 'Floors F1-F7, Master Mode M1-M7 & 6 Slayer Bosses',
  },
  mining: {
    title: 'Deep Caverns & Heart of the Mountain',
    subtitle: 'HotM Tree Perks, Mithril/Gemstone/Glacite Powders & Crystals',
  },
  garden: {
    title: 'The Farming Garden',
    subtitle: 'Garden Level 1-15, Unlocked Plots, Visitors & Composter',
  },
  election: {
    title: 'Community Center & Mayoral Election',
    subtitle: 'Active Mayor & Minister Perks, Live Candidate Polls',
  },
  firesales: {
    title: 'Fire Sales',
    subtitle: 'Active & Scheduled Limited Cosmetic Sales',
  },
  bingo: {
    title: 'Bingo Hub',
    subtitle: 'Active 5x5 Bingo Board, Goals & Progress',
  },
  news: {
    title: 'Update Board & Patch Notes',
    subtitle: 'Official Hypixel SkyBlock Update Threads',
  },
  museum: {
    title: 'The Royal Museum',
    subtitle: 'Donated Weapons, Armor Sets, Rarities, Valuations & Special Artifacts',
  },
};

export default function SkyblockWindow({ isOpen, destination, onClose, children }) {
  if (!isOpen) return null;

  const isMinecraftGui = ['bazaar', 'auctions', 'economy', 'bank'].includes(destination);
  const meta = DEST_META[destination] || DEST_META.player;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 ${
        isMinecraftGui ? 'bazaar-mode bg-black/65 backdrop-blur-[2px]' : 'bg-black/80 backdrop-blur-md'
      }`}
      onClick={onClose}
    >
      <div
        className={`skyblock-window ${
          isMinecraftGui
            ? 'bazaar-mode w-auto max-w-fit h-auto max-h-[98vh] p-0'
            : 'w-full max-w-6xl h-full max-h-[92vh] overflow-hidden flex flex-col relative'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title Bar (hidden in Minecraft GUI mode) */}
        {!isMinecraftGui && (
          <div className="p-4 sm:px-6 border-b border-[#30363d] bg-[#090c10] flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                {meta.title}
              </h2>
              <p className="text-xs text-gray-400">{meta.subtitle}</p>
            </div>

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-[#161b22] hover:bg-red-500/20 hover:text-red-400 border border-[#30363d] text-gray-300 font-mono text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>Close</span>
              <span className="px-1.5 py-0.5 rounded bg-black/40 text-[10px] text-gray-400">ESC</span>
            </button>
          </div>
        )}

        {/* Body Content */}
        <div
          className={`flex-1 ${
            isMinecraftGui ? 'p-0 overflow-visible' : 'overflow-y-auto p-4 sm:p-6 space-y-6'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
