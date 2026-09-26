'use client';

import { useState, useEffect } from 'react';

export default function EndedAuctionsView() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEndedAuctions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auctions/ended');
      const data = await res.json();
      if (data.success) {
        setAuctions(data.auctions || []);
      }
    } catch (err) {
      console.error('Failed to load ended auctions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEndedAuctions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-6 border border-[#30363d] flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            Recently Ended Auctions (Last 60 Seconds)
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Real-time completed auction transactions and sold prices
          </p>
        </div>
        <button
          onClick={fetchEndedAuctions}
          disabled={loading}
          className="px-3 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 disabled:opacity-50 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
        >
          {loading ? 'Refreshing...' : 'Refresh Stream'}
        </button>
      </div>

      {loading && auctions.length === 0 ? (
        <div className="text-center py-12 text-gray-400 font-mono text-xs">
          Loading ended auctions stream...
        </div>
      ) : auctions.length === 0 ? (
        <div className="text-center py-12 text-gray-400 font-mono text-xs">
          No recently ended auctions recorded in the last 60 seconds.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {auctions.map((auc) => {
            const item = auc.item;
            const dataAttr = item ? encodeURIComponent(JSON.stringify(item)) : null;

            return (
              <div
                key={auc.auctionId}
                className="glass-panel rounded-xl p-4 border border-[#30363d] space-y-3 hover:border-amber-400/50 transition cursor-pointer"
                data-item={dataAttr}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4
                      className="font-bold text-sm"
                      dangerouslySetInnerHTML={{
                        __html: item?.formattedName || item?.cleanName || 'Sold Item'
                      }}
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/40 text-gray-300">
                        {item?.rarity || 'COMMON'}
                      </span>
                      {auc.bin ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          BIN SNIPE
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          AUCTION WON
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#21262d] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase font-mono">Final Sale Price</span>
                    <span className="text-amber-400 font-black font-mono">{auc.formattedPrice}</span>
                  </div>
                  <div className="text-right text-[11px] font-mono text-gray-400">
                    <span>{new Date(auc.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
