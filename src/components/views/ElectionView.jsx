'use client';

import { useState, useEffect } from 'react';

export default function ElectionView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchElection() {
      setLoading(true);
      try {
        const res = await fetch('/api/election');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to load election:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchElection();
  }, []);

  if (loading && !data) {
    return <div className="text-center py-10 minecraft-font text-xs text-gray-400">Loading Election stats...</div>;
  }

  const mayor = data?.mayor || {};
  const election = data?.currentElection || {};

  return (
    <div className="space-y-4">
      {/* Active Mayor Card */}
      <div className="mc-inset-box p-4 rounded space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-purple-900/40 border-2 border-purple-500/60 flex items-center justify-center font-bold text-xs minecraft-font text-purple-300">
              MAYOR
            </div>
            <div>
              <span className="minecraft-font text-xs uppercase font-bold text-purple-400 tracking-wider">
                Current Serving Mayor
              </span>
              <h2 className="minecraft-font text-2xl font-black text-white">{mayor.name || 'Unknown'}</h2>
              {mayor.minister && (
                <span className="minecraft-font text-xs text-gray-400">
                  Minister: <strong className="text-cyan-400 font-semibold">{mayor.minister.name}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mayor Active Perks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
          {(mayor.perks || []).map((perk, idx) => (
            <div key={idx} className="p-3 rounded bg-[#2b2b2b] border border-[#444444] space-y-1">
              <h5 className="minecraft-font text-xs font-bold text-yellow-400">{perk.name}</h5>
              <p className="minecraft-font text-[11px] text-gray-300">{perk.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Live Election Voting Booth */}
      {data?.electionActive ? (
        <div className="mc-inset-box p-4 rounded space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="minecraft-font text-xs uppercase font-bold text-emerald-400 tracking-wider">
                Ongoing Mayoral Election
              </span>
              <h3 className="minecraft-font text-lg font-black text-white mt-0.5">
                Live Candidate Voting Polls (Year {election.year})
              </h3>
            </div>
            <div className="text-right">
              <span className="minecraft-font text-xs text-gray-400 block">Total Votes Cast</span>
              <span className="minecraft-font text-base font-bold text-emerald-400">{election.formattedTotalVotes}</span>
            </div>
          </div>

          <div className="space-y-3">
            {(election.candidates || []).map((c, i) => (
              <div key={i} className="p-3 rounded bg-[#2b2b2b] border border-[#444444] space-y-2">
                <div className="flex items-center justify-between text-xs minecraft-font">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded ${i === 0 ? 'bg-yellow-400 text-black' : 'bg-gray-700 text-white'} flex items-center justify-center font-bold text-[10px]`}>
                      #{i + 1}
                    </span>
                    <strong className="text-sm text-white">{c.name}</strong>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-yellow-400">{c.formattedVotes} votes</span>
                    <span className="text-gray-400 ml-2">({c.percentage}%)</span>
                  </div>
                </div>

                <div className="w-full bg-[#121212] h-2 rounded border border-[#373737] overflow-hidden">
                  <div
                    className="bg-yellow-400 h-full transition-all duration-500"
                    style={{ width: `${c.percentage}%` }}
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(c.perks || []).map((p, pIdx) => (
                    <span
                      key={pIdx}
                      className="text-[10px] px-2 py-0.5 rounded bg-[#1c1c1c] text-gray-300 border border-[#3c3c3c] minecraft-font"
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mc-inset-box p-6 rounded text-center minecraft-font text-xs text-gray-400">
          No mayoral election is actively voting right now.
        </div>
      )}
    </div>
  );
}
