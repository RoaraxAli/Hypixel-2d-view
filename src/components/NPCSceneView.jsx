'use client';

import { useState, useEffect, useRef } from 'react';

const SCENE_CONFIGS = {
  bazaar: {
    id: 'bazaar',
    name: 'Bazaar Alley',
    introSrc: '/videos/bazaar-intro.mp4',
    loopSrc: '/videos/bazaar-idle.mp4',
    speed: 1.0,
    targets: [
      {
        id: 'bazaar_npc',
        title: 'Bazaar',
        prompt: '[ CLICK ]',
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
    name: 'The Bank',
    introSrc: '/videos/bank-intro.mp4',
    loopSrc: '/videos/bank-idle.mp4',
    speed: 1.0,
    targets: [
      {
        id: 'banker_npc',
        title: 'Banker',
        prompt: '[ CLICK ]',
        left: '35%',
        top: '47%',
        width: '16%',
        height: '38%',
        action: 'bank_account'
      },
      {
        id: 'vault_npc',
        title: 'Vault',
        prompt: '[ CLICK ]',
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
    name: 'Auction House',
    introSrc: '/videos/ah-intro.mp4',
    loopSrc: '/videos/ah-idle.mp4',
    speed: 2.0, // 2x speed as requested: 4s becomes 2s
    targets: [
      {
        id: 'auction_master',
        title: 'Auction Master',
        prompt: '[ CLICK ]',
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
  const speed = config.speed || 1.0;

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
      intro.playbackRate = speed;
      intro.play().catch((err) => {
        console.warn('Autoplay error on intro video:', err);
      });
    }

    if (loop) {
      loop.currentTime = 0;
      loop.playbackRate = speed;
      loop.load();
    }
  }, [scene, speed]);

  const handleIntroEnded = () => {
    setIsLooping(true);
    const loop = loopVideoRef.current;
    if (loop) {
      loop.playbackRate = speed;
      loop.play().catch((err) => {
        console.warn('Loop video play error:', err);
      });
    }
  };

  const handleSkipOrForceLoop = () => {
    if (!isLooping) {
      if (introVideoRef.current) {
        introVideoRef.current.pause();
      }
      handleIntroEnded();
    }
  };

  const handleTargetClick = (action) => {
    handleSkipOrForceLoop();
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
          onPlay={(e) => {
            e.currentTarget.playbackRate = speed;
          }}
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
            // Near end of video 1, trigger pre-buffered video 2 play for seamless zero-gap handoff
            const v = e.currentTarget;
            if (v.duration && v.duration - v.currentTime < 0.08 && !isLooping) {
              handleIntroEnded();
            }
          }}
          onPlay={(e) => {
            e.currentTarget.playbackRate = speed;
          }}
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          style={{
            zIndex: isLooping ? 1 : 10,
            opacity: isLooping ? 0 : 1,
            transition: 'opacity 0.08s ease'
          }}
        />

        {/* Interactive Hitboxes & Clickable NPCs */}
        {config.targets.map((tgt) => (
          <div
            key={tgt.id}
            onClick={() => handleTargetClick(tgt.action)}
            className="absolute z-20 cursor-pointer group flex flex-col items-center justify-start"
            style={{
              left: tgt.left,
              top: tgt.top,
              width: tgt.width,
              height: tgt.height
            }}
            title={`Click to open ${tgt.title}`}
          >
            {/* Hover Indicator Box */}
            <div className="w-full h-full rounded border-2 border-transparent group-hover:border-amber-400/80 group-hover:bg-amber-400/10 transition duration-150 relative">
              {/* Floating Minecraft Click Prompt */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-90 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                <span className="px-2 py-0.5 rounded bg-black/80 border border-amber-400/60 text-amber-300 font-mono text-[11px] font-bold shadow-lg animate-pulse">
                  {tgt.prompt}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Bar Controls */}
      <div className="absolute top-4 left-4 z-40 flex items-center gap-3">
        <button
          onClick={onBackToMap}
          className="px-3.5 py-1.5 rounded-xl bg-black/80 hover:bg-black/95 border border-white/20 hover:border-amber-400/60 text-white font-mono text-xs font-bold transition flex items-center gap-2 backdrop-blur-md shadow-lg"
        >
          <span>◀ Back to Hub Map</span>
          <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-gray-300">ESC</span>
        </button>

        <div className="px-3 py-1.5 rounded-xl bg-black/70 border border-white/10 backdrop-blur-md flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold text-white tracking-wide">{config.name}</span>
          {speed > 1.0 && (
            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
              {speed}x Speed
            </span>
          )}
        </div>
      </div>

      {/* Skip Intro Button (Visible only during intro) */}
      {!isLooping && (
        <div className="absolute bottom-6 right-6 z-40">
          <button
            onClick={handleSkipOrForceLoop}
            className="px-3 py-1 rounded-lg bg-black/60 hover:bg-black/80 border border-white/20 text-gray-300 hover:text-white text-xs font-mono transition backdrop-blur-sm"
          >
            Skip Intro ⏩
          </button>
        </div>
      )}

      {/* Bottom Hint Banner */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="px-4 py-1.5 rounded-full bg-black/75 border border-white/15 backdrop-blur-md text-gray-300 text-xs font-medium flex items-center gap-2 shadow-2xl">
          <span className="text-amber-400 font-bold">💡 Tip:</span>
          <span>Click on the NPC in the center of the screen to open the menu</span>
        </div>
      </div>
    </div>
  );
}
