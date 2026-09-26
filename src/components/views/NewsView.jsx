'use client';

import { useState, useEffect } from 'react';

export default function NewsView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      try {
        const res = await fetch('/api/news');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to load news:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  if (loading && !data) {
    return <div className="text-center py-12 text-gray-400 font-mono text-xs">Fetching SkyBlock patch notes...</div>;
  }

  const items = data?.items || [];

  return (
    <div className="space-y-4">
      <div className="glass-panel rounded-2xl p-6 border border-[#30363d] space-y-4">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          SkyBlock Update Threads &amp; Patch Notes
        </h2>
        <div className="space-y-3 pt-2">
          {items.map((item, idx) => (
            <a
              key={idx}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-[#090c10] border border-[#21262d] hover:border-blue-400/50 flex items-center justify-between transition group block"
            >
              <div>
                <h4 className="font-bold text-sm text-white group-hover:text-blue-400 transition">
                  {item.title}
                </h4>
                <span className="text-xs text-gray-500 font-mono">{item.text}</span>
              </div>
              <span className="text-xs text-blue-400 flex items-center gap-1 font-semibold">
                Read Thread ↗
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
