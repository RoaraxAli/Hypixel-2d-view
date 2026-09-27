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
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-[2px] flex items-center justify-center p-3 select-none"
      onClick={onClose}
    >
      <div
        className="mc-chest-window max-w-md w-full p-4 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mc-chest-header pb-2 border-b-2 border-[#555555] w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="mc-chest-title text-2xl font-bold">Hypixel SkyBlock</span>
          </div>

          <button
            onClick={onClose}
            className="mc-close-button"
            title="Close [ESC]"
          >
            <img src="/textures/minecraft/barrier.png" alt="Close" className="w-4 h-4 pointer-events-none" />
          </button>
        </div>

        {/* Content in Minecraft Inset Box */}
        <div className="mc-inset-box p-4 rounded w-full space-y-4">
          <div className="space-y-1">
            <span className="minecraft-font text-xl text-yellow-400 font-bold block">
              Player Identification
            </span>
            <p className="minecraft-font text-base text-gray-300">
              Enter your Minecraft IGN (in-game name) or UUID to load your live SkyBlock profile:
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter player IGN..."
                className="mc-search-box text-xl"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded accent-amber-500 cursor-pointer"
                />
                <span className="minecraft-font text-base text-gray-300">
                  Save IGN on this device
                </span>
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="mc-stone-button text-xl px-5 py-1.5"
              >
                <span>▶ Enter SkyBlock Hub</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
