'use client';

import { useState, useEffect, useMemo } from 'react';
import ItemSlot from '@/components/ItemSlot';

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
      <div className="text-center p-8 mc-inset-box rounded space-y-3">
        <h3 className="minecraft-font text-lg font-bold text-white">No Player Profile Selected</h3>
        <p className="minecraft-font text-sm text-gray-400">Search for a Minecraft username or select a profile to view their Royal Museum collection.</p>
        <button
          onClick={onSwitchUser}
          className="mc-stone-button text-base px-4 py-1"
        >
          Lookup Player
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mc-inset-box p-4 rounded space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="minecraft-font text-xs uppercase font-bold text-yellow-400 tracking-wider">Royal SkyBlock Institution</span>
            <h2 className="minecraft-font text-xl font-black text-white mt-1">The Royal Museum</h2>
            <p className="minecraft-font text-xs text-gray-400 mt-1">
              Curated collection of donated weapons, armor sets, rarities, and special items
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-3 py-1.5 rounded bg-[#2b2b2b] border border-[#444444]">
              <span className="minecraft-font text-xs text-gray-400 block">Appraised Museum Value</span>
              <span className="minecraft-font text-base font-bold text-yellow-400">
                {museumData ? `${(museumData.value || 0).toLocaleString()} Coins` : '0 Coins'}
              </span>
            </div>
            <div className="px-3 py-1.5 rounded bg-[#2b2b2b] border border-[#444444]">
              <span className="minecraft-font text-xs text-gray-400 block">Donated Items</span>
              <span className="minecraft-font text-base font-bold text-cyan-400">
                {museumData ? (museumData.totalItemsCount || 0).toLocaleString() : '0'}
              </span>
            </div>
          </div>
        </div>

        <div className="minecraft-font text-xs text-emerald-400 flex items-center gap-1.5 pt-2 border-t border-[#373737]">
          <span>Official appraisal by Madame Eleanor Q. Goldsworth</span>
        </div>
      </div>

      {/* Controls */}
      <div className="mc-inset-box p-3 rounded flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center gap-1.5">
          {[
            { key: 'all', label: 'All Items' },
            { key: 'weaponsArmor', label: 'Weapons & Armor' },
            { key: 'special', label: 'Special Items' },
          ].map(c => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`mc-stone-button text-sm px-3 py-0.5 ${
                category === c.key ? 'active font-bold' : ''
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
            placeholder="Search items..."
            className="mc-search-box text-sm flex-1"
          />
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-[#121212] px-2.5 py-1 border border-[#373737] rounded minecraft-font text-xs text-white focus:outline-none"
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
        <div className="text-center py-10 minecraft-font text-xs text-gray-400">
          Accessing Royal Museum archives...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="col-span-full text-center p-8 mc-inset-box rounded space-y-1">
          <h4 className="minecraft-font text-sm font-bold text-white">No Matching Donated Items</h4>
          <p className="minecraft-font text-xs text-gray-400">Try adjusting your search query or rarity filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredItems.map((entry, idx) => {
            const item = entry.item;
            const rarityColor = item.rarityColor || '#FFFFFF';
            const donatedDate = entry.donatedTime
              ? new Date(entry.donatedTime).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })
              : null;

            return (
              <div
                key={idx}
                className="mc-inset-box p-3 rounded flex flex-col justify-between space-y-2 hover:border-[#8b8b8b] transition"
                style={{ borderLeft: `3px solid ${rarityColor}` }}
              >
                <div className="flex items-start gap-2.5">
                  <ItemSlot item={item} customClass="w-9 h-9 shrink-0" />

                  <div className="flex-1 min-w-0">
                    <h4
                      className="minecraft-font text-sm truncate font-bold"
                      style={{ color: rarityColor }}
                      dangerouslySetInnerHTML={{ __html: item.formattedName || item.cleanName }}
                    />
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className="minecraft-font text-[10px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-black/50"
                        style={{ color: rarityColor }}
                      >
                        {item.rarity || 'COMMON'}
                      </span>
                      {item.starsDisplay && (
                        <span className="minecraft-font text-[11px] font-bold text-yellow-400">{item.starsDisplay}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-1.5 border-t border-[#373737] flex items-center justify-between text-[11px] text-gray-400 minecraft-font">
                  <span className="truncate text-gray-500">{entry.category}</span>
                  {entry.borrowing && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-yellow-300 font-bold text-[10px]">
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
