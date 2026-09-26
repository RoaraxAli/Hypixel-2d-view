'use client';

import { useState, useEffect } from 'react';

export default function AuctionsView() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [binOnly, setBinOnly] = useState(false);
  const [category, setCategory] = useState('all');
  const [tier, setTier] = useState('all');
  const [sort, setSort] = useState('ending_soon');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAuctions = async (targetPage = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: targetPage.toString(),
        bin: binOnly ? 'true' : 'false',
        category,
        tier,
        sort,
        query: searchQuery
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
  };

  useEffect(() => {
    fetchAuctions(0);
  }, [binOnly, category, tier, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAuctions(0);
  };

  return (
    <div className="space-y-6">
      {/* Controls & Filter Card */}
      <div className="glass-panel rounded-2xl p-6 border border-[#30363d] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              Active Auction House
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Live active listings across all pages, BIN filters, and item inspection
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search active auctions..."
              className="w-full px-3 py-2 bg-[#090c10] border border-[#30363d] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
            />
          </form>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
          <label className="flex items-center gap-2 cursor-pointer bg-[#090c10] px-3 py-1.5 rounded-lg border border-[#30363d]">
            <input
              type="checkbox"
              checked={binOnly}
              onChange={(e) => setBinOnly(e.target.checked)}
              className="rounded accent-amber-500"
            />
            <span>Buy It Now (BIN) Only</span>
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-[#090c10] px-3 py-1.5 rounded-lg border border-[#30363d] text-white"
          >
            <option value="all">All Categories</option>
            <option value="weapon">Weapons</option>
            <option value="armor">Armor</option>
            <option value="accessories">Accessories</option>
            <option value="consumables">Consumables</option>
            <option value="blocks">Blocks</option>
            <option value="misc">Misc</option>
          </select>

          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="bg-[#090c10] px-3 py-1.5 rounded-lg border border-[#30363d] text-white"
          >
            <option value="all">All Rarities</option>
            <option value="COMMON">Common</option>
            <option value="UNCOMMON">Uncommon</option>
            <option value="RARE">Rare</option>
            <option value="EPIC">Epic</option>
            <option value="LEGENDARY">Legendary</option>
            <option value="MYTHIC">Mythic</option>
            <option value="DIVINE">Divine</option>
            <option value="SPECIAL">Special</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-[#090c10] px-3 py-1.5 rounded-lg border border-[#30363d] text-white"
          >
            <option value="ending_soon">Ending Soonest</option>
            <option value="price_asc">Price: Lowest First</option>
            <option value="price_desc">Price: Highest First</option>
          </select>

          <button
            onClick={() => fetchAuctions(0)}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition ml-auto"
          >
            Apply Filter
          </button>
        </div>
      </div>

      {/* Grid of Listings */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 font-mono text-xs">
          Loading auctions...
        </div>
      ) : auctions.length === 0 ? (
        <div className="text-center py-12 text-gray-400 font-mono text-xs">
          No auctions found matching criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {auctions.map((auc) => {
            const timeLeftMs = Math.max(0, auc.end - Date.now());
            const mins = Math.floor(timeLeftMs / 60000);
            const secs = Math.floor((timeLeftMs % 60000) / 1000);
            const timeText = mins > 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m ${secs}s`;

            const rawItem = {
              rawName: auc.itemName,
              formattedName: auc.formattedName,
              rarity: auc.tier,
              loreHtml: auc.loreHtml || []
            };

            return (
              <div
                key={auc.uuid}
                className="glass-panel rounded-xl p-4 border border-[#30363d] space-y-3 hover:border-amber-400/50 transition cursor-pointer"
                data-item={encodeURIComponent(JSON.stringify(rawItem))}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4
                      className="font-bold text-sm"
                      dangerouslySetInnerHTML={{ __html: auc.formattedName || auc.itemName }}
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/40 text-gray-300">
                        {auc.tier}
                      </span>
                      {auc.bin ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          BUY IT NOW
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                          {auc.bidsCount} Bids
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#21262d] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase font-mono">
                      {auc.bin ? 'Buy Price' : 'Current Bid'}
                    </span>
                    <span className="text-amber-400 font-black font-mono">{auc.formattedPrice}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 block uppercase font-mono">Ends In</span>
                    <span className="text-gray-300 font-mono text-[11px]">{timeText}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div className="glass-panel p-4 rounded-xl border border-[#30363d] flex items-center justify-between text-xs text-gray-400">
        <span>Page {page + 1} of {totalPages}</span>
        <div className="flex gap-2">
          <button
            onClick={() => fetchAuctions(Math.max(0, page - 1))}
            disabled={page <= 0}
            className="px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] disabled:opacity-40 rounded text-white font-semibold transition"
          >
            Previous Page
          </button>
          <button
            onClick={() => fetchAuctions(page + 1)}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] disabled:opacity-40 rounded text-white font-semibold transition"
          >
            Next Page
          </button>
        </div>
      </div>
    </div>
  );
}
