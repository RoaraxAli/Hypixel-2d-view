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
    return <div className="text-center py-12 text-gray-400 font-mono text-xs">Loading Bingo goals and challenges...</div>;
  }

  const ev = data?.event || {};
  const goals = ev.goals || [];

  return (
    <div className="space-y-4">
      <div className="glass-panel rounded-2xl p-6 border border-[#30363d] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">Active Event</span>
            <h2 className="text-xl font-black text-white mt-1">{ev.name || 'SkyBlock Bingo'}</h2>
            <p className="text-xs text-gray-400 mt-1">
              {ev.modifier ? `Modifier: ${ev.modifier}` : '5x5 Bingo Board Challenges'}
            </p>
          </div>
        </div>

        {/* 5x5 Bingo Board */}
        <div className="grid grid-cols-5 gap-3 pt-3">
          {goals.map((g, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#090c10] border border-[#21262d] flex flex-col justify-between space-y-2 hover:border-emerald-500/50 transition"
            >
              <div>
                <span className="text-[10px] text-gray-500 font-mono block">#{idx + 1}</span>
                <h5 className="text-xs font-bold text-white line-clamp-2">{g.name}</h5>
                {g.lore && (
                  <p className="text-[10px] text-gray-400 line-clamp-2 mt-1">{g.lore}</p>
                )}
              </div>
              <div className="pt-2 border-t border-[#161b22] font-mono text-[10px]">
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
