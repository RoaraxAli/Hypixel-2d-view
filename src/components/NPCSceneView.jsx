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
        points: '613,323 665,323 665,364 681,369 679,430 662,430 660,382 658,487 620,487 618,382 616,430 599,430 597,369 613,364',
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
        points: '535,425 585,425 585,487 613,495 613,539 512,539 512,495 535,487',
        action: 'bank_account'
      },
      {
        id: 'vault_npc',
        points: '810,365 890,365 935,410 935,495 910,538 800,538 780,480 780,410',
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
        points: '617,440 663,440 663,479 689,487 685,546 666,546 660,499 657,600 621,600 618,499 613,546 595,546 593,487 617,479',
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
    setHoveredId(null);

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

        {/* Invisible Clickable Targets over NPCs (No Border/Hover Effect) */}
        <svg
          viewBox="0 0 1280 720"
          className="absolute inset-0 w-full h-full pointer-events-auto select-none"
          style={{ zIndex: 20 }}
        >
          {config.targets.map((tgt) => (
            <polygon
              key={tgt.id}
              points={tgt.points}
              onClick={() => handleTargetClick(tgt.action)}
              className="cursor-pointer"
              stroke="transparent"
              strokeWidth="0"
              fill="rgba(0, 0, 0, 0.001)"
            />
          ))}
        </svg>
      </div>

      {/* Clean Top Bar: Back to Map button [ESC] in Minecraft stone button style */}
      <div className="absolute top-4 left-4 z-40">
        <button
          onClick={onBackToMap}
          className="mc-stone-button text-base px-3.5 py-1.5 flex items-center gap-2"
          title="Return to Hub Map [ESC]"
        >
          <span>◀ Back to Hub Map</span>
          <span className="text-yellow-300 font-bold">[ESC]</span>
        </button>
      </div>
    </div>
  );
}
