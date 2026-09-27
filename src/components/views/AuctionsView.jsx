'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getItemTexture } from '@/lib/itemTextures';

// Center 24 slot indices in a 6x9 chest grid
const AUCTION_SLOT_INDICES = [
  11, 12, 13, 14, 15, 16,
  20, 21, 22, 23, 24, 25,
  29, 30, 31, 32, 33, 34,
  38, 39, 40, 41, 42, 43
];

const CATEGORIES = [
  { id: 'weapon', slot: 0, name: 'Weapons', icon: '/textures/minecraft/gold_sword.png' },
  { id: 'armor', slot: 9, name: 'Armor', icon: '/textures/minecraft/diamond_chestplate.png' },
  { id: 'accessories', slot: 18, name: 'Accessories', icon: '/textures/minecraft/green_dye.png' },
  { id: 'consumables', slot: 27, name: 'Consumables', icon: '/textures/minecraft/apple.png' },
  { id: 'misc', slot: 36, name: 'Blocks & Misc', icon: '/textures/minecraft/speckled_melon.png' },
  { id: 'all', slot: 45, name: 'View All', icon: '/textures/minecraft/stick.png' }
];

const RARITIES = ['all', 'COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC', 'DIVINE', 'SPECIAL'];
const SORT_MODES = [
  { id: 'ending_soon', label: 'Ending Soonest' },
  { id: 'price_asc', label: 'Lowest Price' },
  { id: 'price_desc', label: 'Highest Price' }
];

export default function AuctionsView({ playerData, initialScreen = 'main', onClose }) {
  // Screen: 'main' (ah-ui-1.PNG) or 'browser' (ah-ui-2.PNG)
  const [screen, setScreen] = useState(initialScreen);
  const [category, setCategory] = useState('all');
  const [binMode, setBinMode] = useState('all'); // 'all', 'bin_only', 'auction_only'
  const [sortIndex, setSortIndex] = useState(0);
  const [tierIndex, setTierIndex] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentSort = SORT_MODES[sortIndex].id;
  const currentTier = RARITIES[tierIndex];

  // Fetch live auctions from API
  const fetchAuctions = useCallback(async (targetPage = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: targetPage.toString(),
        bin: binMode === 'bin_only' ? 'true' : 'false',
        category,
        tier: currentTier,
        sort: currentSort,
        query: searchQuery.trim()
      });
      const res = await fetch(`/api/auctions?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setAuctions(data.auctions || []);
        setPage(data.page || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load auctions:', err);
    } finally {
      setLoading(false);
    }
  }, [page, binMode, category, currentTier, currentSort, searchQuery]);

  useEffect(() => {
    if (screen === 'browser') {
      fetchAuctions(0);
    }
  }, [screen, category, binMode, currentTier, currentSort, fetchAuctions]);

  // Construct Screen 1: Auction House (ah-ui-1.PNG)
  const mainSlots = useMemo(() => {
    const slots = new Array(54).fill(null);

    // Decorative gray glass
    for (let i = 0; i < 54; i++) {
      slots[i] = {
        type: 'glass',
        icon: '/textures/minecraft/gray_stained_glass_pane.png',
        rawItem: { rawName: ' ', formattedName: ' ', loreHtml: [] }
      };
    }

    // Slot 11: Auctions Browser (GOLD BLOCK - as seen in ah-ui-1.PNG)
    slots[11] = {
      type: 'browse_button',
      icon: '/textures/minecraft/gold_block.png',
      rawItem: {
        rawName: 'Auctions Browser',
        formattedName: '<span style="color: #FFAA00; font-weight: bold">Auctions Browser</span>',
        rarity: 'COMMON',
        loreHtml: [
          '<span style="color: #AAAAAA">Find items by category, price,</span>',
          '<span style="color: #AAAAAA">and name from other players.</span>',
          '',
          '<span style="color: #FFFF55; font-weight: bold">▶ Click to browse auctions!</span>'
        ]
      }
    };

    // Slot 13: View Bids (Golden Carrot)
    slots[13] = {
      type: 'view_bids',
      icon: '/textures/minecraft/golden_carrot.png',
      rawItem: {
        rawName: 'View Bids',
        formattedName: '<span style="color: #FFAA00; font-weight: bold">View Bids</span>',
        rarity: 'COMMON',
        loreHtml: [
          '<span style="color: #AAAAAA">Check the status of your active bids</span>',
          '<span style="color: #AAAAAA">and claim completed auctions.</span>',
          '',
          '<span style="color: #55FF55">Active Bids:</span> <span style="color: #FFAA00; font-weight: bold">0</span>',
          '<span style="color: #55FF55">Claimable:</span> <span style="color: #FFAA00; font-weight: bold">0</span>',
          '',
          '<span style="color: #FFFF55">Click to inspect active bids</span>'
        ]
      }
    };

    // Slot 15: Create Auction (Golden Horse Armor)
    slots[15] = {
      type: 'create_auction',
      icon: '/textures/minecraft/golden_horse_armor.png',
      rawItem: {
        rawName: 'Create Auction',
        formattedName: '<span style="color: #FFAA00; font-weight: bold">Create Auction</span>',
        rarity: 'COMMON',
        loreHtml: [
          '<span style="color: #AAAAAA">Put items from your inventory</span>',
          '<span style="color: #AAAAAA">up for auction or Buy It Now (BIN)!</span>',
          '',
          '<span style="color: #55FF55">Listing Slots Available:</span> <span style="color: #FFAA00">14 / 14</span>',
          '',
          '<span style="color: #FFFF55">Click to list an item</span>'
        ]
      }
    };

    // Slot 31: Close Barrier
    slots[31] = {
      type: 'close',
      icon: '/textures/minecraft/barrier.png',
      rawItem: {
        rawName: 'Close',
        formattedName: '<span style="color: #FF5555; font-weight: bold">Close</span>',
        loreHtml: ['<span style="color: #AAAAAA">Click to exit the Auction House</span>']
      }
    };

    // Slot 32: Map (Rules & Stats)
    slots[32] = {
      type: 'rules',
      icon: '/textures/minecraft/map.png',
      rawItem: {
        rawName: 'Auction Rules & Stats',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Auction Rules & Stats</span>',
        rarity: 'COMMON',
        loreHtml: [
          '<span style="color: #AAAAAA">Hypixel SkyBlock Auction House rules:</span>',
          '',
          '<span style="color: #AAAAAA">• Listing Fee:</span> <span style="color: #FFAA00">1% (min. 10 coins)</span>',
          '<span style="color: #AAAAAA">• Buy It Now:</span> <span style="color: #55FF55">Instant purchase & delivery</span>',
          '<span style="color: #AAAAAA">• Normal Auctions:</span> <span style="color: #55FFFF">Bidding with timer extensions</span>',
          '<span style="color: #AAAAAA">• Escrow:</span> <span style="color: #55FF55">100% refund on outbid</span>'
        ]
      }
    };

    return slots;
  }, []);

  // Construct Screen 2: Auctions Browser (ah-ui-2.PNG)
  const browserSlots = useMemo(() => {
    const slots = new Array(54).fill(null);

    // 1. Purple Stained Glass Panes Border
    const purpleBorders = [
      1, 2, 3, 4, 5, 6, 7, 8,
      10, 17,
      19, 26,
      28, 35,
      37, 44,
      47
    ];
    purpleBorders.forEach((idx) => {
      slots[idx] = {
        type: 'border',
        icon: '/textures/minecraft/purple_stained_glass_pane.png',
        rawItem: { rawName: ' ', formattedName: ' ', loreHtml: [] }
      };
    });

    // 2. Left Column: Categories
    CATEGORIES.forEach((cat) => {
      slots[cat.slot] = {
        type: 'category',
        catId: cat.id,
        icon: cat.icon,
        active: category === cat.id,
        rawItem: {
          rawName: cat.name,
          formattedName: `<span style="color: #FFAA00; font-weight: bold">${cat.name}</span>`,
          rarity: 'COMMON',
          loreHtml: [
            `<span style="color: #AAAAAA">Filter items by ${cat.name}.</span>`,
            category === cat.id
              ? '<span style="color: #55FF55">▶ Currently selected</span>'
              : '<span style="color: #FFFF55">Click to view category</span>'
          ]
        }
      };
    });

    // 3. Center 24 Slots: Auctions
    AUCTION_SLOT_INDICES.forEach((slotIdx, i) => {
      const auc = auctions[i];
      if (auc) {
        const timeLeftMs = Math.max(0, auc.end - Date.now());
        const mins = Math.floor(timeLeftMs / 60000);
        const secs = Math.floor((timeLeftMs % 60000) / 1000);
        const timeText = mins > 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m ${secs}s`;

        const fallbackItem = {
          cleanName: auc.itemName,
          rawName: auc.itemName,
          skyblockId: auc.itemName.toUpperCase().replace(/\s+/g, '_')
        };
        const tex = getItemTexture(fallbackItem) || (
          auc.category === 'weapon' ? '/textures/minecraft/gold_sword.png' :
          auc.category === 'armor' ? '/textures/minecraft/diamond_chestplate.png' :
          auc.category === 'accessories' ? '/textures/minecraft/green_dye.png' :
          auc.category === 'consumables' ? '/textures/minecraft/apple.png' :
          '/textures/minecraft/speckled_melon.png'
        );

        const customLore = [
          ...(auc.loreHtml || []),
          '',
          '<span style="color: #555555">-----------------------</span>',
          auc.bin
            ? `<span style="color: #FFAA00; font-weight: bold">Buy It Now:</span> <span style="color: #55FF55; font-weight: bold">${auc.formattedPrice} coins</span>`
            : `<span style="color: #FFAA00; font-weight: bold">Current Bid:</span> <span style="color: #55FF55; font-weight: bold">${auc.formattedPrice} coins</span>`,
          auc.bin
            ? '<span style="color: #AAAAAA">Instant purchase</span>'
            : `<span style="color: #AAAAAA">Bids:</span> <span style="color: #FFFF55">${auc.bidsCount || 0}</span>`,
          `<span style="color: #AAAAAA">Ends in:</span> <span style="color: #55FFFF">${timeText}</span>`,
          `<span style="color: #AAAAAA">Seller:</span> <span style="color: #AAAAAA">${auc.auctioneer?.slice(0, 8) || 'Player'}</span>`
        ];

        slots[slotIdx] = {
          type: 'auction_item',
          auc,
          icon: tex,
          enchanted: auc.tier === 'EPIC' || auc.tier === 'LEGENDARY' || auc.tier === 'MYTHIC',
          rawItem: {
            rawName: auc.itemName,
            formattedName: auc.formattedName || auc.itemName,
            rarity: auc.tier || 'COMMON',
            loreHtml: customLore
          }
        };
      }
    });

    // 4. Slot 46: Go Back to ah-ui-1.PNG
    slots[46] = {
      type: 'back_main',
      icon: '/textures/minecraft/arrow.png',
      rawItem: {
        rawName: 'Go Back',
        formattedName: '<span style="color: #FF5555; font-weight: bold">◀ Go Back</span>',
        loreHtml: ['<span style="color: #AAAAAA">Return to Auction House main screen</span>']
      }
    };

    // 5. Slot 48: Oak Sign (Search)
    slots[48] = {
      type: 'toggle_search',
      icon: '/textures/minecraft/oak_sign.png',
      rawItem: {
        rawName: 'Search Auctions',
        formattedName: '<span style="color: #FFAA00; font-weight: bold">Search Auctions</span>',
        rarity: 'COMMON',
        loreHtml: [
          `<span style="color: #AAAAAA">Current query:</span> <span style="color: #55FF55">${searchQuery || 'None'}</span>`,
          '',
          '<span style="color: #FFFF55">Click to enter search query</span>'
        ]
      }
    };

    // 6. Slot 49: Previous Page
    if (page > 0) {
      slots[49] = {
        type: 'prev_page',
        icon: '/textures/minecraft/arrow.png',
        rawItem: {
          rawName: 'Previous Page',
          formattedName: '<span style="color: #55FF55; font-weight: bold">Previous Page</span>',
          loreHtml: [`<span style="color: #AAAAAA">Page ${page} of ${totalPages}</span>`]
        }
      };
    }

    // 7. Slot 50: Mode Filter (Hopper: All / BIN / Auction)
    slots[50] = {
      type: 'toggle_bin',
      icon: '/textures/minecraft/hopper.png',
      rawItem: {
        rawName: 'Filter Mode',
        formattedName: '<span style="color: #FFAA00; font-weight: bold">Filter: Mode</span>',
        rarity: 'COMMON',
        loreHtml: [
          `<span style="color: #AAAAAA">Current:</span> <span style="color: #55FF55">${
            binMode === 'bin_only' ? 'Buy It Now (BIN)' : binMode === 'auction_only' ? 'Auctions Only' : 'All Listings'
          }</span>`,
          '',
          '<span style="color: #FFFF55">Click to toggle mode</span>'
        ]
      }
    };

    // 8. Slot 51: Sort Mode (Eye of Ender)
    slots[51] = {
      type: 'toggle_sort',
      icon: '/textures/minecraft/ender_eye.png',
      rawItem: {
        rawName: 'Sort Mode',
        formattedName: '<span style="color: #55FFFF; font-weight: bold">Sort Mode</span>',
        rarity: 'COMMON',
        loreHtml: [
          `<span style="color: #AAAAAA">Current:</span> <span style="color: #FFAA00">${SORT_MODES[sortIndex].label}</span>`,
          '',
          '<span style="color: #FFFF55">Click to cycle sort order</span>'
        ]
      }
    };

    // 9. Slot 52: Rarity Filter (Gold Ingot)
    slots[52] = {
      type: 'toggle_tier',
      icon: '/textures/minecraft/gold_ingot.png',
      rawItem: {
        rawName: 'Rarity Filter',
        formattedName: '<span style="color: #FFAA00; font-weight: bold">Rarity Filter</span>',
        rarity: 'COMMON',
        loreHtml: [
          `<span style="color: #AAAAAA">Current:</span> <span style="color: #55FF55">${currentTier.toUpperCase()}</span>`,
          '',
          '<span style="color: #FFFF55">Click to cycle rarity filter</span>'
        ]
      }
    };

    // 10. Slot 53: Next Page
    if (page < totalPages - 1) {
      slots[53] = {
        type: 'next_page',
        icon: '/textures/minecraft/arrow.png',
        rawItem: {
          rawName: 'Next Page',
          formattedName: '<span style="color: #55FF55; font-weight: bold">Next Page</span>',
          loreHtml: [`<span style="color: #AAAAAA">Page ${page + 2} of ${totalPages}</span>`]
        }
      };
    }

    return slots;
  }, [auctions, category, binMode, sortIndex, tierIndex, page, totalPages, searchQuery, currentTier]);

  const handleSlotClick = (slot) => {
    if (!slot) return;
    if (slot.type === 'browse_button') {
      setScreen('browser');
    } else if (slot.type === 'back_main') {
      setScreen('main');
    } else if (slot.type === 'close') {
      onClose();
    } else if (slot.type === 'category') {
      setCategory(slot.catId);
      setPage(0);
    } else if (slot.type === 'toggle_search') {
      setSearchOpen(!searchOpen);
    } else if (slot.type === 'prev_page') {
      setPage((p) => Math.max(0, p - 1));
    } else if (slot.type === 'next_page') {
      setPage((p) => p + 1);
    } else if (slot.type === 'toggle_bin') {
      setBinMode((prev) => (prev === 'all' ? 'bin_only' : prev === 'bin_only' ? 'auction_only' : 'all'));
      setPage(0);
    } else if (slot.type === 'toggle_sort') {
      setSortIndex((prev) => (prev + 1) % SORT_MODES.length);
      setPage(0);
    } else if (slot.type === 'toggle_tier') {
      setTierIndex((prev) => (prev + 1) % RARITIES.length);
      setPage(0);
    }
  };

  const inventoryItems = playerData?.inventories?.inventory || [];
  const invRows = inventoryItems.slice(9, 36);
  const hotbarRow = inventoryItems.slice(0, 9);

  return (
    <div className="mc-chest-wrapper select-none">
      <div className="mc-chest-window">
        {/* Header */}
        <div className="mc-chest-header">
          <div className="flex items-center gap-2">
            {screen === 'browser' && (
              <button
                onClick={() => setScreen('main')}
                className="mc-dollar-button mr-1"
                title="Back to Auction House"
              >
                <span className="minecraft-font text-base font-bold">◀</span>
              </button>
            )}
            <span className="mc-chest-title">
              {screen === 'main' ? 'Auction House' : 'Auctions Browser'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (screen === 'main') {
                  setScreen('browser');
                } else {
                  setSearchOpen(!searchOpen);
                }
              }}
              className="mc-dollar-button"
              title="Search Auctions"
            >
              <span className="minecraft-font text-lg font-bold leading-none">$</span>
            </button>
            <button
              onClick={onClose}
              className="mc-close-button"
              title="Close [ESC]"
            >
              <img src="/textures/minecraft/barrier.png" alt="Close" className="w-4 h-4 pointer-events-none" />
            </button>
          </div>
        </div>

        {/* Search Input Bar (when active in browser) */}
        {screen === 'browser' && searchOpen && (
          <div className="w-full mb-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Search active auctions by name..."
              className="mc-search-box"
              autoFocus
            />
          </div>
        )}

        {/* Screen 1: Auction House (ah-ui-1.PNG) */}
        {screen === 'main' ? (
          <div className="mc-chest-grid">
            {mainSlots.map((slot, idx) => {
              const dataAttr = slot?.rawItem
                ? encodeURIComponent(JSON.stringify(slot.rawItem))
                : null;
              const isGlass = slot?.type === 'glass';

              return (
                <div
                  key={idx}
                  onClick={() => handleSlotClick(slot)}
                  className={`mc-slot-cell ${isGlass ? 'glass-border' : ''} ${
                    slot?.type === 'browse_button' ? 'hover:brightness-125' : ''
                  }`}
                  data-item={dataAttr}
                >
                  {slot?.icon && (
                    <img
                      src={slot.icon}
                      alt={slot.rawItem?.rawName || ''}
                      className="w-7 h-7 object-contain pointer-events-none"
                    />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // Screen 2: Auctions Browser (ah-ui-2.PNG)
          <div className="mc-chest-grid relative">
            {loading && (
              <div className="absolute inset-0 z-30 bg-black/40 flex items-center justify-center">
                <span className="minecraft-font text-amber-300 text-lg animate-pulse font-bold">
                  Loading Auctions...
                </span>
              </div>
            )}
            {browserSlots.map((slot, idx) => {
              const dataAttr = slot?.rawItem
                ? encodeURIComponent(JSON.stringify(slot.rawItem))
                : null;
              const isBorder = slot?.type === 'border';

              return (
                <div
                  key={idx}
                  onClick={() => handleSlotClick(slot)}
                  className={`mc-slot-cell ${slot?.active ? 'nav-active' : ''} ${
                    isBorder ? 'glass-border' : ''
                  } ${slot?.enchanted ? 'mc-enchanted' : ''}`}
                  data-item={dataAttr}
                >
                  {slot?.icon && (
                    <img
                      src={slot.icon}
                      alt={slot.rawItem?.rawName || ''}
                      className="w-7 h-7 object-contain pointer-events-none select-none"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Inventory Header */}
        <div className="mc-inventory-header">
          <span className="mc-chest-title text-xl">Inventory</span>
          <span className="minecraft-font text-base text-gray-600 font-bold">
            {playerData?.player?.username || ''}
          </span>
        </div>

        {/* 3x9 Main Player Inventory */}
        <div className="mc-inventory-grid">
          {Array.from({ length: 27 }).map((_, idx) => {
            const item = invRows[idx];
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
            const item = hotbarRow[idx];
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
      </div>
    </div>
  );
}
