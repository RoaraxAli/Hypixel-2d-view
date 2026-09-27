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
    return <div className="text-center py-10 minecraft-font text-xs text-gray-400">Fetching SkyBlock patch notes...</div>;
  }

  const items = data?.items || [];

  return (
    <div className="space-y-4">
      <div className="mc-inset-box p-4 rounded space-y-3">
        <h2 className="minecraft-font text-lg font-bold text-white flex items-center gap-2">
          SkyBlock Update Threads &amp; Patch Notes
        </h2>
        <div className="space-y-2.5 pt-1">
          {items.map((item, idx) => (
            <a
              key={idx}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded bg-[#2b2b2b] border border-[#444444] hover:border-yellow-400 flex items-center justify-between transition group block"
            >
              <div>
                <h4 className="minecraft-font font-bold text-sm text-white group-hover:text-yellow-400 transition">
                  {item.title}
                </h4>
                <span className="minecraft-font text-xs text-gray-400">{item.text}</span>
              </div>
              <span className="minecraft-font text-xs text-cyan-400 flex items-center gap-1 font-bold">
                Read Thread ↗
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
