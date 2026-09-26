'use client';

import { useState, useMemo } from 'react';
import {
  BAZAAR_CATEGORIES,
  BAZAAR_PARENT_GROUPS,
  getGroupProducts,
  createProductSlotData
} from '@/lib/bazaarConstants';

export default function BazaarView({ bazaarData, playerData }) {
  const [category, setCategory] = useState('farming');
  const [subGroup, setSubGroup] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showFlips, setShowFlips] = useState(false);

  const allProducts = useMemo(() => bazaarData?.products || [], [bazaarData]);

  // Compute Top Flips
  const topFlips = useMemo(() => {
    return [...allProducts]
      .filter(p => p.buyPrice > 10 && p.weeklyVolume > 50000 && p.sellPrice > 0)
      .sort((a, b) => b.marginPercent - a.marginPercent)
      .slice(0, 4);
  }, [allProducts]);

  // Handle Search Filtering
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allProducts.filter(p =>
      p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
    );
  }, [allProducts, searchQuery]);

  // Construct 54-slot chest grid
  const chestSlots = useMemo(() => {
    const slots = new Array(54).fill(null);

    // 1. Column 0: Category Selector Navigation Icons (Slots 0, 9, 18, 27, 36, 45)
    Object.entries(BAZAAR_CATEGORIES).forEach(([catKey, catDef]) => {
      const isSelected = category === catKey && !subGroup;
      slots[catDef.slotIndex] = {
        type: 'category',
        catKey,
        name: catDef.name,
        icon: catDef.icon,
        active: isSelected,
        lore: catDef.lore,
        rawItem: {
          rawName: catDef.name,
          formattedName: `<span style="color: #FFAA00; font-weight: bold">${catDef.title}</span>`,
          rarity: 'COMMON',
          rarityColor: '#FFAA00',
          loreHtml: catDef.lore.map(l => `<span style="color: #AAAAAA">${l}</span>`)
        }
      };
    });

    // 2. SEARCH MODE
    if (category === 'search') {
      const pageSize = 28;
      const totalPages = Math.ceil(searchResults.length / pageSize) || 1;
      const startIndex = page * pageSize;
      const paged = searchResults.slice(startIndex, startIndex + pageSize);

      const contentSlots = [
        10, 11, 12, 13, 14, 15, 16,
        19, 20, 21, 22, 23, 24, 25,
        28, 29, 30, 31, 32, 33, 34,
        37, 38, 39, 40, 41, 42, 43
      ];

      paged.forEach((prod, i) => {
        if (contentSlots[i] !== undefined) {
          slots[contentSlots[i]] = createProductSlotData(prod);
        }
      });

      if (page > 0) {
        slots[48] = {
          type: 'prev_page',
          name: 'Previous Page',
          icon: '/textures/minecraft/arrow.png',
          rawItem: { rawName: 'Previous Page', formattedName: '<span style="color: #55FF55">Previous Page</span>' }
        };
      }
      if (page < totalPages - 1) {
        slots[50] = {
          type: 'next_page',
          name: 'Next Page',
          icon: '/textures/minecraft/arrow.png',
          rawItem: { rawName: 'Next Page', formattedName: '<span style="color: #55FF55">Next Page</span>' }
        };
      }
      return slots;
    }

    // 3. SUB-GROUP VIEW (Drilled-down commodity items)
    if (subGroup) {
      const groupDef = BAZAAR_PARENT_GROUPS[category]?.[subGroup];
      const products = groupDef ? getGroupProducts(groupDef, allProducts) : [];

      const contentSlots = [
        11, 12, 13, 14, 15,
        20, 21, 22, 23, 24,
        29, 30, 31, 32, 33,
        38, 39, 40, 41, 42
      ];

      products.forEach((prod, i) => {
        if (contentSlots[i] !== undefined) {
          slots[contentSlots[i]] = createProductSlotData(prod);
        }
      });

      // Back Button at slot 45 (or 48)
      slots[48] = {
        type: 'back',
        name: 'Go Back',
        icon: '/textures/minecraft/arrow.png',
        rawItem: {
          rawName: 'Go Back',
          formattedName: '<span style="color: #FF5555; font-weight: bold">◀ Go Back</span>',
          loreHtml: ['<span style="color: #AAAAAA">Return to category view</span>']
        }
      };

      return slots;
    }

    // 4. CATEGORY MAIN VIEW (Parent groups)
    const groups = BAZAAR_PARENT_GROUPS[category] || {};
    Object.entries(groups).forEach(([groupKey, groupDef]) => {
      slots[groupDef.slot] = {
        type: 'group',
        groupKey,
        name: groupDef.name,
        icon: groupDef.icon,
        rawItem: {
          rawName: groupDef.name,
          formattedName: `<span style="color: #FFAA00; font-weight: bold">${groupDef.name}</span>`,
          rarity: 'COMMON',
          rarityColor: '#FFAA00',
          loreHtml: [
            '<span style="color: #AAAAAA">Click to view all commodity tiers and products!</span>'
          ]
        }
      };
    });

    return slots;
  }, [category, subGroup, page, searchResults, allProducts]);

  const handleSlotClick = (slot) => {
    if (!slot) return;
    if (slot.type === 'category') {
      setCategory(slot.catKey);
      setSubGroup(null);
      setPage(0);
      if (slot.catKey === 'search') setSearchOpen(true);
    } else if (slot.type === 'group') {
      setSubGroup(slot.groupKey);
    } else if (slot.type === 'back') {
      setSubGroup(null);
    } else if (slot.type === 'prev_page') {
      setPage(p => Math.max(0, p - 1));
    } else if (slot.type === 'next_page') {
      setPage(p => p + 1);
    } else if (slot.type === 'product' && slot.product) {
      setSelectedProduct(slot.product);
    }
  };

  const inventoryItems = playerData?.inventories?.inventory || [];
  const invRows = inventoryItems.slice(9, 36);
  const hotbarRow = inventoryItems.slice(0, 9);

  return (
    <div className="space-y-4">
      {/* Authentic Minecraft Double Chest Wrapper */}
      <div className="mc-chest-wrapper">
        <div className="mc-chest-window">
          {/* Header */}
          <div className="mc-chest-header">
            <div className="flex items-center gap-2">
              <span className="mc-chest-title">
                {subGroup
                  ? `${BAZAAR_CATEGORIES[category]?.name || 'Category'} ➜ ${BAZAAR_PARENT_GROUPS[category]?.[subGroup]?.name || 'Items'}`
                  : (BAZAAR_CATEGORIES[category]?.title || 'Bazaar')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSearchOpen(!searchOpen);
                  if (!searchOpen) setCategory('search');
                }}
                className="mc-dollar-button"
                title="Search commodities"
              >
                <span className="minecraft-font text-lg font-bold leading-none">$</span>
              </button>
            </div>
          </div>

          {/* Search Box */}
          {searchOpen && (
            <div className="w-full mb-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCategory('search');
                  setPage(0);
                }}
                placeholder="Type to search 2,100+ commodities..."
                className="mc-search-box"
                autoFocus
              />
            </div>
          )}

          {/* Chest 54-slot Grid */}
          <div className="mc-chest-grid">
            {chestSlots.map((slot, idx) => {
              const isCatSlot = [0, 9, 18, 27, 36, 45].includes(idx);
              const dataAttr = slot?.rawItem
                ? encodeURIComponent(JSON.stringify(slot.rawItem))
                : null;

              return (
                <div
                  key={idx}
                  onClick={() => handleSlotClick(slot)}
                  className={`mc-slot-cell ${slot?.active ? 'nav-active' : ''} ${!slot && !isCatSlot ? 'glass-border' : ''} ${slot?.enchanted ? 'mc-enchanted' : ''}`}
                  data-item={dataAttr}
                >
                  {slot?.icon && (
                    <img src={slot.icon} alt={slot.name || ''} className="w-8 h-8 pointer-events-none" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Inventory Below */}
          <div className="mc-inventory-header">
            <span className="mc-chest-title text-xl">Inventory</span>
            <span className="minecraft-font text-base text-gray-600 font-bold">
              {playerData?.player?.username || ''}
            </span>
          </div>

          {/* 3x9 Main Inventory */}
          <div className="mc-inventory-grid">
            {Array.from({ length: 27 }).map((_, idx) => {
              const item = invRows[idx];
              const dataAttr = item && !item.empty ? encodeURIComponent(JSON.stringify(item)) : null;
              return (
                <div key={idx} className="mc-slot-cell" data-item={dataAttr}>
                  {item && !item.empty && (
                    <span
                      className="text-[10px] font-bold truncate select-none pointer-events-none px-0.5"
                      style={{ color: item.rarityColor || '#fff' }}
                    >
                      {item.cleanName?.slice(0, 4)}
                    </span>
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
              return (
                <div key={idx} className="mc-slot-cell" data-item={dataAttr}>
                  {item && !item.empty && (
                    <span
                      className="text-[10px] font-bold truncate select-none pointer-events-none px-0.5"
                      style={{ color: item.rarityColor || '#fff' }}
                    >
                      {item.cleanName?.slice(0, 4)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Flips Toggle Button & Panel */}
      <div className="text-center">
        <button
          onClick={() => setShowFlips(!showFlips)}
          className="px-3.5 py-1.5 rounded-lg bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-amber-400 text-xs font-bold transition"
        >
          {showFlips ? 'Hide' : 'Show'} Top Arbitrage Flips
        </button>
      </div>

      {showFlips && (
        <div className="glass-panel rounded-2xl p-4 border border-[#30363d] space-y-3 max-w-xl mx-auto">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Top Arbitrage Margin Opportunities:
            </span>
            <button onClick={() => setShowFlips(false)} className="text-xs text-gray-400 hover:text-white">
              Close
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {topFlips.map(prod => (
              <div
                key={prod.id}
                onClick={() => setSelectedProduct(prod)}
                className="p-2.5 rounded-xl bg-[#090c10] border border-[#21262d] hover:border-amber-400/50 cursor-pointer space-y-1 transition"
              >
                <h5 className="text-xs font-bold text-white truncate">{prod.name}</h5>
                <div className="text-[11px] font-mono">
                  <span className="text-emerald-400 font-bold block">+{prod.marginPercent}%</span>
                  <span className="text-gray-400 text-[10px]">{(prod.weeklyVolume || 0).toLocaleString()} vol</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Order Book Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161b22] border-2 border-[#30363d] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 px-2 py-1 rounded bg-[#090c10] border border-[#30363d] text-gray-400 hover:text-white text-xs font-mono"
            >
              Close
            </button>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-amber-400">{selectedProduct.name}</h3>
              <p className="text-xs font-mono text-gray-400">{selectedProduct.id}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#090c10] border border-[#21262d]">
                <span className="text-[11px] text-gray-400 block">Buy Price (Instant)</span>
                <span className="text-sm font-black text-emerald-400 font-mono">
                  {selectedProduct.buyPrice ? `${selectedProduct.buyPrice.toLocaleString()} coins` : 'N/A'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#090c10] border border-[#21262d]">
                <span className="text-[11px] text-gray-400 block">Sell Price (Instant)</span>
                <span className="text-sm font-black text-red-400 font-mono">
                  {selectedProduct.sellPrice ? `${selectedProduct.sellPrice.toLocaleString()} coins` : 'N/A'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#090c10] border border-[#21262d]">
                <span className="text-[11px] text-gray-400 block">Spread Margin</span>
                <span className="text-sm font-black text-amber-400 font-mono">
                  {selectedProduct.marginPercent}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#090c10] border border-[#21262d]">
                <span className="text-[11px] text-gray-400 block">Weekly Volume</span>
                <span className="text-sm font-black text-cyan-400 font-mono">
                  {(selectedProduct.weeklyVolume || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#090c10] border border-[#21262d] space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 uppercase">Top Buy Orders</h4>
                <p className="text-xs text-gray-300">
                  {selectedProduct.topBuyOrder
                    ? `${selectedProduct.topBuyOrder.amount}x @ ${selectedProduct.topBuyOrder.pricePerUnit} coins`
                    : 'No active buy orders'}
                </p>
                <span className="text-[11px] text-gray-500 font-mono block">
                  Total Orders: {(selectedProduct.buyOrders || 0).toLocaleString()}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#090c10] border border-[#21262d] space-y-2">
                <h4 className="text-xs font-bold text-red-400 uppercase">Top Sell Offers</h4>
                <p className="text-xs text-gray-300">
                  {selectedProduct.topSellOffer
                    ? `${selectedProduct.topSellOffer.amount}x @ ${selectedProduct.topSellOffer.pricePerUnit} coins`
                    : 'No active sell offers'}
                </p>
                <span className="text-[11px] text-gray-500 font-mono block">
                  Total Offers: {(selectedProduct.sellOrders || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
