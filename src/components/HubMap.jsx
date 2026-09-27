'use client';

import { useEffect, useRef, useState } from 'react';

const HUB_PINS = [
  { id: 'election', name: 'Community Center', left: '49.5%', top: '11.5%' },
  { id: 'auctions', name: 'Auction House', left: '70.0%', top: '37.0%' },
  { id: 'bazaar', name: 'Bazaar', left: '68.5%', top: '57.0%' },
  { id: 'economy', name: 'The Bank', left: '67.0%', top: '63.5%' },
  { id: 'player', name: 'Player Profile', left: '50.0%', top: '52.0%' },
  { id: 'mining', name: 'Deep Caverns', left: '53.5%', top: '82.0%' },
  { id: 'garden', name: 'The Garden', left: '21.0%', top: '88.0%' },
  { id: 'museum', name: 'Museum', left: '33.5%', top: '26.5%' },
  { id: 'dungeons', name: 'Dungeons & Slayers', left: '67.0%', top: '6.5%' },
  { id: 'news', name: 'Update Board', left: '49.5%', top: '34.0%' },
];

export default function HubMap({ onOpenDestination, onShowUserPrompt }) {
  const containerRef = useRef(null);
  const [wrapperStyle, setWrapperStyle] = useState({
    width: '100%',
    height: '100%',
    left: '0px',
    top: '0px',
    position: 'absolute'
  });

  useEffect(() => {
    function updateDimensions() {
      if (!containerRef.current) return;
      const W = containerRef.current.clientWidth;
      const H = containerRef.current.clientHeight;
      if (!W || !H) return;

      const imgRatio = 2730 / 1536;
      const winRatio = W / H;

      let renderW, renderH, offsetL, offsetT;
      if (winRatio >= imgRatio) {
        renderW = W;
        renderH = W / imgRatio;
        offsetL = 0;
        offsetT = (H - renderH) / 2;
      } else {
        renderH = H;
        renderW = H * imgRatio;
        offsetL = (W - renderW) / 2;
        offsetT = 0;
      }

      setWrapperStyle({
        width: `${renderW}px`,
        height: `${renderH}px`,
        left: `${offsetL}px`,
        top: `${offsetT}px`,
        position: 'absolute'
      });
    }

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* Map Viewport */}
      <div ref={containerRef} className="relative w-full h-full overflow-hidden flex items-center justify-center">
        <div style={wrapperStyle} className="overflow-hidden">
          <img
            src="/hub_map.jpg"
            alt="Hypixel SkyBlock Hub"
            className="w-full h-full object-cover pointer-events-none select-none filter contrast-105 brightness-95"
          />

          {/* Floating House Pins */}
          {HUB_PINS.map((pin) => (
            <div
              key={pin.id}
              className="hub-pin"
              style={{ left: pin.left, top: pin.top }}
              onClick={() => onOpenDestination(pin.id)}
            >
              {pin.name}
            </div>
          ))}
        </div>
      </div>

      {/* Top-Left Corner: Switch User Option */}
      <div className="absolute top-4 left-4 z-40">
        <button
          onClick={onShowUserPrompt}
          className="mc-stone-button text-base px-3.5 py-1.5 flex items-center gap-2 shadow-lg"
          title="Switch Player IGN"
        >
          <span>Switch User</span>
        </button>
      </div>
    </div>
  );
}
