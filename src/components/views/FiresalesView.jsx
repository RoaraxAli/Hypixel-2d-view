'use client';

import { useState, useEffect } from 'react';

export default function FiresalesView() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchFiresales() {
      setLoading(true);
      try {
        const res = await fetch('/api/firesales');
        const data = await res.json();
        setSales(data.sales || []);
      } catch (err) {
        console.error('Failed to load fire sales:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFiresales();
  }, []);

  if (loading && sales.length === 0) {
    return <div className="text-center py-12 text-gray-400 font-mono text-xs">Checking Fire Sales...</div>;
  }

  if (sales.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-8 border border-[#30363d] text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-xs font-mono mx-auto">
          SALES
        </div>
        <h3 className="text-lg font-black text-white">No Fire Sales Currently Active</h3>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          Hypixel schedules limited-edition cosmetic fire sales periodically. Check back soon or monitor forum announcements!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sales.map((s, idx) => (
        <div key={idx} className="glass-panel rounded-xl p-5 border border-[#30363d] space-y-3 font-mono">
          <h4 className="font-bold text-sm text-white">{s.item_id}</h4>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Price:</span>
            <span className="text-amber-400 font-bold">{s.price} Gems</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Sold:</span>
            <span className="text-white">{s.amount_sold} / {s.total_units}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
