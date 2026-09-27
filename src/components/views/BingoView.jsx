'use client';

import { useState, useEffect } from 'react';

export default function BingoView({ playerData }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchBingo() {
      setLoading(true);
      try {
        const uuid = playerData?.player?.uuid || '';
        const res = await fetch(`/api/bingo?uuid=${uuid}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to load bingo:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBingo();
  }, [playerData?.player?.uuid]);

  if (loading && !data) {
    return <div className="text-center py-10 minecraft-font text-xs text-gray-400">Loading Bingo goals and challenges...</div>;
  }

  const ev = data?.event || {};
  const goals = ev.goals || [];

  return (
    <div className="space-y-4">
      <div className="mc-inset-box p-4 rounded space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="minecraft-font text-xs uppercase font-bold text-emerald-400 tracking-wider">Active Event</span>
            <h2 className="minecraft-font text-xl font-black text-white mt-0.5">{ev.name || 'SkyBlock Bingo'}</h2>
            <p className="minecraft-font text-xs text-gray-400 mt-0.5">
              {ev.modifier ? `Modifier: ${ev.modifier}` : '5x5 Bingo Board Challenges'}
            </p>
          </div>
        </div>

        {/* 5x5 Bingo Board */}
        <div className="grid grid-cols-5 gap-2 pt-2">
          {goals.map((g, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded bg-[#2b2b2b] border border-[#444444] flex flex-col justify-between space-y-2 hover:border-yellow-400 transition"
            >
              <div>
                <span className="minecraft-font text-[10px] text-gray-400 block">#{idx + 1}</span>
                <h5 className="minecraft-font text-xs font-bold text-white line-clamp-2">{g.name}</h5>
                {g.lore && (
                  <p className="minecraft-font text-[10px] text-gray-400 line-clamp-2 mt-0.5">{g.lore}</p>
                )}
              </div>
              <div className="pt-1.5 border-t border-[#373737] minecraft-font text-[10px]">
                <span className="text-emerald-400 font-bold">
                  {typeof g.progress === 'number' ? g.progress.toLocaleString() : (g.progress || 0)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
