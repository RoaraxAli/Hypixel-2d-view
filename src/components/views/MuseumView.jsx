'use client';

import { useState, useEffect, useMemo } from 'react';

export default function MuseumView({ playerData, onSwitchUser }) {
  const [museumData, setMuseumData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');

  const profileId = playerData?.selectedProfile?.profileId;
  const uuid = playerData?.player?.uuid;

  useEffect(() => {
    if (!profileId || !uuid) return;

    async function fetchMuseum() {
      setLoading(true);
      try {
        const res = await fetch(`/api/museum?profile=${profileId}&uuid=${uuid}`);
        const data = await res.json();
        if (data.success) {
          setMuseumData(data.museum);
        }
      } catch (err) {
        console.error('Failed to load museum:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMuseum();
  }, [profileId, uuid]);

  const allItems = useMemo(() => {
    if (!museumData) return [];
    let list = [];
    if (category === 'all' || category === 'weaponsArmor') {
      list = list.concat(
        (museumData.weaponsArmor || []).map(e => ({ ...e, category: 'Weapons & Armor' }))
      );
    }
    if (category === 'all' || category === 'special') {
      list = list.concat(
        (museumData.specialItems || []).map(e => ({ ...e, category: 'Special Items' }))
      );
    }
    return list.filter(e => e.item && !e.item.empty);
  }, [museumData, category]);

  const filteredItems = useMemo(() => {
    return allItems.filter(entry => {
      const item = entry.item;
      if (!item) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = (item.cleanName || '').toLowerCase().includes(q);
        const idMatch = (entry.id || '').toLowerCase().includes(q);
        if (!nameMatch && !idMatch) return false;
      }

      if (tierFilter !== 'all') {
        if ((item.rarity || 'COMMON').toUpperCase() !== tierFilter.toUpperCase()) {
          return false;
        }
      }

      return true;
    });
  }, [allItems, searchQuery, tierFilter]);

  if (!playerData || !profileId) {
    return (
      <div className="text-center p-12 glass-panel rounded-2xl border border-[#30363d] space-y-3">
        <h3 className="text-base font-bold text-white">No Player Profile Selected</h3>
        <p className="text-xs text-gray-400">Search for a Minecraft username or select a profile to view their Royal Museum collection.</p>
        <button
          onClick={onSwitchUser}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg transition"
        >
          Lookup Player
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-6 border border-[#30363d] space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">Royal SkyBlock Institution</span>
            <h2 className="text-xl font-black text-white mt-1">The Royal Museum</h2>
            <p className="text-xs text-gray-400 mt-1">
              Curated collection of donated weapons, armor sets, rarities, and special items
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="px-4 py-2.5 rounded-xl bg-[#090c10] border border-[#21262d]">
              <span className="text-[11px] text-gray-400 block">Appraised Museum Value</span>
              <span className="text-base font-black text-amber-400 font-mono">
                {museumData ? `${(museumData.value || 0).toLocaleString()} Coins` : '0 Coins'}
              </span>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-[#090c10] border border-[#21262d]">
              <span className="text-[11px] text-gray-400 block">Donated Items</span>
              <span className="text-base font-black text-cyan-400 font-mono">
                {museumData ? (museumData.totalItemsCount || 0).toLocaleString() : '0'}
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs text-emerald-400 flex items-center gap-1.5 pt-2 border-t border-[#21262d]">
          <span>Official appraisal by Madame Eleanor Q. Goldsworth</span>
        </div>
      </div>

      {/* Controls */}
      <div className="glass-panel p-4 rounded-xl border border-[#30363d] flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold">
          {[
            { key: 'all', label: 'All Items' },
            { key: 'weaponsArmor', label: 'Weapons & Armor' },
            { key: 'special', label: 'Special Items' },
          ].map(c => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`px-3 py-1.5 rounded-lg font-bold border transition ${
                category === c.key
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-[#161b22] text-gray-400 border-[#30363d] hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search donated items by name..."
            className="flex-1 px-3 py-1.5 bg-[#090c10] border border-[#30363d] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
          />
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-[#090c10] px-3 py-1.5 rounded-lg border border-[#30363d] text-xs text-white"
          >
            <option value="all">All Rarities</option>
            <option value="SPECIAL">Special</option>
            <option value="VERY_SPECIAL">Very Special</option>
            <option value="DIVINE">Divine</option>
            <option value="MYTHIC">Mythic</option>
            <option value="LEGENDARY">Legendary</option>
            <option value="EPIC">Epic</option>
            <option value="RARE">Rare</option>
            <option value="UNCOMMON">Uncommon</option>
            <option value="COMMON">Common</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 font-mono text-xs">
          Accessing Royal Museum archives...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="col-span-full text-center p-12 glass-panel rounded-xl border border-[#30363d] space-y-2">
          <h4 className="text-sm font-bold text-white">No Matching Donated Items</h4>
          <p className="text-xs text-gray-400">Try adjusting your search query or rarity filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((entry, idx) => {
            const item = entry.item;
            const rarityColor = item.rarityColor || '#FFFFFF';
            const dataAttr = encodeURIComponent(JSON.stringify(item));
            const donatedDate = entry.donatedTime
              ? new Date(entry.donatedTime).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })
              : null;

            let textureUrl = null;
            if (item.skullTexture) {
              try {
                const parsed = JSON.parse(atob(item.skullTexture));
                const u = parsed?.textures?.SKIN?.url;
                if (u) textureUrl = u.replace('http://', 'https://');
              } catch {}
            }

            return (
              <div
                key={idx}
                className="glass-panel rounded-xl p-4 border border-[#30363d] hover:border-amber-400/50 transition flex flex-col justify-between space-y-3"
                style={{ borderLeft: `3px solid ${rarityColor}` }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="mc-slot w-10 h-10 shrink-0 bg-[#090c10] border border-[#30363d] rounded-lg flex items-center justify-center cursor-pointer relative"
                    data-item={dataAttr}
                  >
                    {textureUrl ? (
                      <img src={textureUrl} className="w-8 h-8 object-contain pointer-events-none" alt="" />
                    ) : (
                      <span className="text-xs font-black font-mono" style={{ color: rarityColor }}>
                        {(item.cleanName || '?').charAt(0)}
                      </span>
                    )}
                    {item.count && item.count > 1 && (
                      <span className="absolute bottom-0.5 right-1 text-[10px] font-mono font-bold text-white pointer-events-none">
                        {item.count}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4
                      className="font-bold text-sm truncate"
                      style={{ color: rarityColor }}
                      dangerouslySetInnerHTML={{ __html: item.formattedName || item.cleanName }}
                    />
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/40"
                        style={{ color: rarityColor }}
                      >
                        {item.rarity || 'COMMON'}
                      </span>
                      {item.starsDisplay && (
                        <span className="text-[11px] font-bold text-amber-400">{item.starsDisplay}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#21262d] flex items-center justify-between text-[11px] text-gray-400 font-mono">
                  <span className="truncate text-gray-500">{entry.category}</span>
                  {entry.borrowing && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                      Borrowing
                    </span>
                  )}
                  {donatedDate && <span className="text-gray-500 text-[10px]">{donatedDate}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
