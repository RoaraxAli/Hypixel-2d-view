'use client';

import { useState, useEffect, useRef } from 'react';

const SCENE_CONFIGS = {
  bazaar: {
    id: 'bazaar',
    introSrc: '/videos/bazaar-intro.mp4',
    loopSrc: '/videos/bazaar-idle.mp4',
    targets: [
      {
        id: 'bazaar_npc',
        left: '42%',
        top: '35%',
        width: '16%',
        height: '42%',
        action: 'bazaar'
      }
    ]
  },
  economy: {
    id: 'economy',
    introSrc: '/videos/bank-intro.mp4',
    loopSrc: '/videos/bank-idle.mp4',
    targets: [
      {
        id: 'banker_npc',
        left: '35%',
        top: '47%',
        width: '16%',
        height: '38%',
        action: 'bank_account'
      },
      {
        id: 'vault_npc',
        left: '58%',
        top: '44%',
        width: '20%',
        height: '42%',
        action: 'bank_vault'
      }
    ]
  },
  auctions: {
    id: 'auctions',
    introSrc: '/videos/ah-intro.mp4',
    loopSrc: '/videos/ah-idle.mp4',
    targets: [
      {
        id: 'auction_master',
        left: '41%',
        top: '44%',
        width: '18%',
        height: '43%',
        action: 'auction_main'
      }
    ]
  }
};

export default function NPCSceneView({ scene, onOpenMenu, onBackToMap }) {
  const config = SCENE_CONFIGS[scene] || SCENE_CONFIGS.bazaar;

  const [isLooping, setIsLooping] = useState(false);
  const [wrapperStyle, setWrapperStyle] = useState({
    width: '100%',
    height: '100%',
    left: '0px',
    top: '0px',
    position: 'absolute'
  });

  const containerRef = useRef(null);
  const introVideoRef = useRef(null);
  const loopVideoRef = useRef(null);

  // Resize handler to match 16:9 ratio exactly
  useEffect(() => {
    function updateDimensions() {
      if (!containerRef.current) return;
      const W = containerRef.current.clientWidth;
      const H = containerRef.current.clientHeight;
      if (!W || !H) return;

      const imgRatio = 16 / 9;
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

  // Initialize and switch videos
  useEffect(() => {
    setIsLooping(false);

    const intro = introVideoRef.current;
    const loop = loopVideoRef.current;

    if (intro) {
      intro.currentTime = 0;
      intro.playbackRate = 1.0;
      intro.play().catch((err) => {
        console.warn('Autoplay error on intro video:', err);
      });
    }

    if (loop) {
      loop.currentTime = 0;
      loop.playbackRate = 1.0;
      loop.load();
    }
  }, [scene]);

  const handleIntroEnded = () => {
    setIsLooping(true);
    const loop = loopVideoRef.current;
    if (loop) {
      loop.playbackRate = 1.0;
      loop.play().catch((err) => {
        console.warn('Loop video play error:', err);
      });
    }
  };

  const handleTargetClick = (action) => {
    if (!isLooping) {
      if (introVideoRef.current) {
        introVideoRef.current.pause();
      }
      handleIntroEnded();
    }
    onOpenMenu(action);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-black select-none"
    >
      {/* 16:9 Scaled Video Viewport */}
      <div style={wrapperStyle} className="overflow-hidden relative">
        {/* Loop Video (preloaded, plays continuously without pause once intro ends) */}
        <video
          ref={loopVideoRef}
          src={config.loopSrc}
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          style={{
            zIndex: isLooping ? 10 : 1,
            opacity: isLooping ? 1 : 0,
            transition: 'opacity 0.08s ease'
          }}
        />

        {/* Intro Video (plays first, transitions seamlessly into loop video) */}
        <video
          ref={introVideoRef}
          src={config.introSrc}
          muted
          playsInline
          autoPlay
          preload="auto"
          onEnded={handleIntroEnded}
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            if (v.duration && v.duration - v.currentTime < 0.08 && !isLooping) {
              handleIntroEnded();
            }
          }}
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          style={{
            zIndex: isLooping ? 1 : 10,
            opacity: isLooping ? 0 : 1,
            transition: 'opacity 0.08s ease'
          }}
        />

        {/* Clean, transparent clickable hitboxes over NPCs */}
        {config.targets.map((tgt) => (
          <div
            key={tgt.id}
            onClick={() => handleTargetClick(tgt.action)}
            className="absolute z-20 cursor-pointer"
            style={{
              left: tgt.left,
              top: tgt.top,
              width: tgt.width,
              height: tgt.height
            }}
          />
        ))}
      </div>

      {/* Clean Top Bar: Back to Map button [ESC] */}
      <div className="absolute top-4 left-4 z-40">
        <button
          onClick={onBackToMap}
          className="px-3.5 py-1.5 rounded-xl bg-black/80 hover:bg-black/95 border border-white/20 hover:border-amber-400/60 text-white font-mono text-xs font-bold transition flex items-center gap-2 backdrop-blur-md shadow-lg"
        >
          <span>◀ Back to Hub Map</span>
          <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-gray-300">ESC</span>
        </button>
      </div>
    </div>
  );
}
