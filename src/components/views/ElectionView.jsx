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
    return <div className="text-center py-12 text-gray-400 font-mono text-xs">Loading Election stats...</div>;
  }

  const mayor = data?.mayor || {};
  const election = data?.currentElection || {};

  return (
    <div className="space-y-6">
      {/* Active Mayor Card */}
      <div className="glass-panel rounded-2xl p-6 border border-[#30363d] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center font-bold text-xs font-mono text-purple-400">
              MAYOR
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-purple-400 tracking-wider">
                Current Serving Mayor
              </span>
              <h2 className="text-2xl font-black text-white">{mayor.name || 'Unknown'}</h2>
              {mayor.minister && (
                <span className="text-xs text-gray-400">
                  Minister: <strong className="text-cyan-400 font-semibold">{mayor.minister.name}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mayor Active Perks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {(mayor.perks || []).map((perk, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-[#090c10] border border-[#21262d] space-y-1">
              <h5 className="text-xs font-bold text-amber-400">{perk.name}</h5>
              <p className="text-[11px] text-gray-400">{perk.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Live Election Voting Booth */}
      {data?.electionActive ? (
        <div className="glass-panel rounded-2xl p-6 border border-[#30363d] space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                Ongoing Mayoral Election
              </span>
              <h3 className="text-xl font-black text-white mt-0.5">
                Live Candidate Voting Polls (Year {election.year})
              </h3>
            </div>
            <div className="text-right font-mono">
              <span className="text-xs text-gray-400 block">Total Votes Cast</span>
              <span className="text-lg font-bold text-emerald-400">{election.formattedTotalVotes}</span>
            </div>
          </div>

          <div className="space-y-4 font-mono">
            {(election.candidates || []).map((c, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#090c10] border border-[#21262d] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full ${i === 0 ? 'bg-amber-400 text-black' : 'bg-gray-800 text-white'} flex items-center justify-center font-bold text-[10px]`}>
                      #{i + 1}
                    </span>
                    <strong className="text-sm text-white">{c.name}</strong>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-amber-400">{c.formattedVotes} votes</span>
                    <span className="text-gray-400 ml-2">({c.percentage}%)</span>
                  </div>
                </div>

                <div className="w-full bg-[#161b22] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-500"
                    style={{ width: `${c.percentage}%` }}
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {(c.perks || []).map((p, pIdx) => (
                    <span
                      key={pIdx}
                      className="text-[10px] px-2 py-0.5 rounded bg-[#161b22] text-gray-300 border border-[#21262d] font-sans"
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
        <div className="glass-panel p-6 rounded-2xl text-xs text-gray-400">
          No mayoral election is actively voting right now.
        </div>
      )}
    </div>
  );
}
