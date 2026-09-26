'use client';

import { useState } from 'react';

export default function UsernamePromptModal({ isOpen, onClose, onSubmitUsername }) {
  const [username, setUsername] = useState('');
  const [remember, setRemember] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    onSubmitUsername(username.trim(), remember);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="skyblock-window p-8 border-2 border-amber-500/50 text-center max-w-lg w-full space-y-6 shadow-2xl">
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">Welcome to Hypixel SkyBlock</h2>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Enter your Minecraft username (IGN) or UUID to view your live SkyBlock profile and hub village.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your Minecraft username (IGN)..."
              className="w-full px-4 py-3 bg-[#090c10] border-2 border-[#30363d] focus:border-amber-400 rounded-xl text-white placeholder-gray-500 font-semibold text-sm transition outline-none"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 px-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded accent-amber-500"
              />
              <span>Remember my username on this device</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-black font-extrabold rounded-xl text-sm transition shadow-lg shadow-amber-500/20"
          >
            Enter SkyBlock Hub
          </button>
        </form>
      </div>
    </div>
  );
}
