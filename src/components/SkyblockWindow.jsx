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

  const isCustomChestView = ['bazaar', 'auctions', 'economy', 'bank'].includes(destination);
  const meta = DEST_META[destination] || DEST_META.player;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-[2px] select-none"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="max-h-[96vh] flex items-center justify-center">
        {isCustomChestView ? (
          children
        ) : (
          <div className="mc-chest-wrapper">
            <div className="mc-chest-window w-full max-w-5xl max-h-[92vh] flex flex-col p-4">
              {/* Authentic Minecraft Header with Title and Red Close Button */}
              <div className="mc-chest-header pb-2 border-b-2 border-[#555555] w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="mc-chest-title text-2xl font-bold">{meta.title}</span>
                  <span className="minecraft-font text-sm text-gray-700 hidden sm:inline font-bold">
                    - {meta.subtitle}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="mc-close-button"
                    title="Close [ESC]"
                  >
                    <img src="/textures/minecraft/barrier.png" alt="Close" className="w-4 h-4 pointer-events-none" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content inside Minecraft Inset Box */}
              <div className="mc-inset-box p-3 sm:p-4 rounded mt-3 w-full flex-1 overflow-y-auto max-h-[76vh]">
                {children}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
