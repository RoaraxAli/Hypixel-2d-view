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
    return <div className="text-center py-10 minecraft-font text-xs text-gray-400">Checking Fire Sales...</div>;
  }

  if (sales.length === 0) {
    return (
      <div className="mc-inset-box rounded p-8 text-center space-y-3">
        <div className="w-10 h-10 rounded bg-red-900/40 border border-red-500/60 text-red-400 flex items-center justify-center font-bold text-xs minecraft-font mx-auto">
          SALES
        </div>
        <h3 className="minecraft-font text-base font-bold text-white">No Fire Sales Currently Active</h3>
        <p className="minecraft-font text-xs text-gray-400 max-w-md mx-auto">
          Hypixel schedules limited-edition cosmetic fire sales periodically. Check back soon or monitor forum announcements!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {sales.map((s, idx) => (
        <div key={idx} className="mc-inset-box rounded p-3 space-y-2 minecraft-font">
          <h4 className="font-bold text-sm text-yellow-400">{s.item_id}</h4>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Price:</span>
            <span className="text-yellow-300 font-bold">{s.price} Gems</span>
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
