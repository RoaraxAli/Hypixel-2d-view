'use client';

import { useState, useEffect } from 'react';
import ItemSlot from '@/components/ItemSlot';

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
    <div className="space-y-4">
      <div className="mc-inset-box p-3 rounded flex items-center justify-between">
        <div>
          <h2 className="minecraft-font text-lg font-bold text-white flex items-center gap-2">
            Recently Ended Auctions (Last 60 Seconds)
          </h2>
          <p className="minecraft-font text-xs text-gray-400 mt-0.5">
            Real-time completed auction transactions and sold prices
          </p>
        </div>
        <button
          onClick={fetchEndedAuctions}
          disabled={loading}
          className="mc-stone-button text-sm px-3 py-1 flex items-center gap-1.5"
        >
          {loading ? 'Refreshing...' : '↻ Refresh Stream'}
        </button>
      </div>

      {loading && auctions.length === 0 ? (
        <div className="text-center py-10 minecraft-font text-xs text-gray-400">
          Loading ended auctions stream...
        </div>
      ) : auctions.length === 0 ? (
        <div className="text-center py-10 mc-inset-box rounded minecraft-font text-xs text-gray-400">
          No recently ended auctions recorded in the last 60 seconds.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {auctions.map((auc) => {
            const item = auc.item;
            const dataAttr = item ? encodeURIComponent(JSON.stringify(item)) : null;

            return (
              <div
                key={auc.auctionId}
                className="mc-inset-box p-3 rounded space-y-2 hover:border-[#8b8b8b] transition cursor-pointer"
                data-item={dataAttr}
              >
                <div className="flex items-start gap-2.5">
                  {item && <ItemSlot item={item} customClass="w-9 h-9 shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <h4
                      className="minecraft-font font-bold text-sm truncate"
                      dangerouslySetInnerHTML={{
                        __html: item?.formattedName || item?.cleanName || 'Sold Item'
                      }}
                    />
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="minecraft-font text-[10px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-black/50 text-gray-300">
                        {item?.rarity || 'COMMON'}
                      </span>
                      {auc.bin ? (
                        <span className="minecraft-font text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-yellow-300 border border-amber-500/30">
                          BIN SNIPE
                        </span>
                      ) : (
                        <span className="minecraft-font text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          AUCTION WON
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-1.5 border-t border-[#373737] flex items-center justify-between text-xs minecraft-font">
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase">Final Sale Price</span>
                    <span className="text-yellow-400 font-bold">{auc.formattedPrice}</span>
                  </div>
                  <div className="text-right text-[11px] text-gray-400">
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
