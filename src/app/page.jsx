'use client';

import { useState, useEffect, useCallback } from 'react';
import HubMap from '@/components/HubMap';
import SkyblockWindow from '@/components/SkyblockWindow';
import ItemTooltip from '@/components/ItemTooltip';
import GlobalLoader from '@/components/GlobalLoader';
import UsernamePromptModal from '@/components/UsernamePromptModal';
import NPCSceneView from '@/components/NPCSceneView';

import PlayerView from '@/components/views/PlayerView';
import BazaarView from '@/components/views/BazaarView';
import AuctionsView from '@/components/views/AuctionsView';
import BankView from '@/components/views/BankView';
import EndedAuctionsView from '@/components/views/EndedAuctionsView';
import ElectionView from '@/components/views/ElectionView';
import FiresalesView from '@/components/views/FiresalesView';
import BingoView from '@/components/views/BingoView';
import NewsView from '@/components/views/NewsView';
import MuseumView from '@/components/views/MuseumView';

export default function HomePage() {
  const [playerData, setPlayerData] = useState(null);
  const [bazaarData, setBazaarData] = useState(null);
  const [activeScene, setActiveScene] = useState(null); // 'bazaar' | 'economy' | 'auctions' | null
  const [activeDestination, setActiveDestination] = useState(null);
  const [sceneInitialTab, setSceneInitialTab] = useState(null);
  const [playerSubtab, setPlayerSubtab] = useState('inventory');
  const [showUserPrompt, setShowUserPrompt] = useState(false);
  const [loaderText, setLoaderText] = useState(null);

  // Fetch Player Profile
  const lookupPlayer = useCallback(async (query, profileId = null) => {
    setLoaderText(`Fetching SkyBlock data for ${query}...`);
    try {
      const url = `/api/player/${encodeURIComponent(query)}${profileId ? `?profile=${profileId}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to fetch player profile.');
        return;
      }
      setPlayerData(data);
    } catch (err) {
      console.error('Player lookup error:', err);
      alert('Network error communicating with server.');
    } finally {
      setLoaderText(null);
    }
  }, []);

  // Preload Bazaar data
  const loadBazaarData = useCallback(async () => {
    try {
      const res = await fetch('/api/bazaar');
      const data = await res.json();
      if (data.success) {
        setBazaarData(data);
      }
    } catch (err) {
      console.error('Bazaar preload error:', err);
    }
  }, []);

  // Initialization
  useEffect(() => {
    loadBazaarData();

    const savedUser = localStorage.getItem('skyblock_saved_username');
    if (savedUser) {
      lookupPlayer(savedUser);
    } else {
      setShowUserPrompt(true);
    }
  }, [lookupPlayer, loadBazaarData]);

  // Open Destination Handler
  const handleOpenDestination = useCallback((dest) => {
    if (dest === 'bazaar') {
      setActiveScene('bazaar');
      setActiveDestination(null);
      setSceneInitialTab(null);
    } else if (dest === 'economy' || dest === 'bank') {
      setActiveScene('economy');
      setActiveDestination(null);
      setSceneInitialTab('account');
    } else if (dest === 'auctions') {
      setActiveScene('auctions');
      setActiveDestination(null);
      setSceneInitialTab('main');
    } else if (dest === 'dungeons') {
      setActiveScene(null);
      setActiveDestination('player');
      setPlayerSubtab('dungeons');
    } else if (dest === 'mining') {
      setActiveScene(null);
      setActiveDestination('player');
      setPlayerSubtab('mining');
    } else if (dest === 'garden') {
      setActiveScene(null);
      setActiveDestination('player');
      setPlayerSubtab('garden');
    } else {
      setActiveScene(null);
      setActiveDestination(dest);
      if (dest === 'player') setPlayerSubtab('inventory');
    }
  }, []);

  // Handle Opening Menu from Interactive NPC scene
  const handleSceneMenuOpen = useCallback((action) => {
    if (action === 'bazaar') {
      setActiveDestination('bazaar');
    } else if (action === 'bank_account') {
      setSceneInitialTab('account');
      setActiveDestination('economy');
    } else if (action === 'bank_vault') {
      setSceneInitialTab('vault');
      setActiveDestination('economy');
    } else if (action === 'auction_main') {
      setSceneInitialTab('main');
      setActiveDestination('auctions');
    } else if (action === 'auction_browser') {
      setSceneInitialTab('browser');
      setActiveDestination('auctions');
    } else {
      setActiveDestination(activeScene);
    }
  }, [activeScene]);

  // Keyboard Navigation: Escape to close, 1-9 for hotbar destinations
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        if (activeDestination) {
          setActiveDestination(null);
          return;
        }
        if (activeScene) {
          setActiveScene(null);
          return;
        }
        setShowUserPrompt(false);
        return;
      }

      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }

      const hotbarMap = [
        'player',
        'auctions',
        'bazaar',
        'economy',
        'dungeons',
        'mining',
        'garden',
        'election',
        'museum',
      ];
      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= 9) {
        handleOpenDestination(hotbarMap[keyNum - 1]);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleOpenDestination, activeDestination, activeScene]);

  const handleUserPromptSubmit = (username, remember) => {
    if (remember) {
      localStorage.setItem('skyblock_saved_username', username);
    } else {
      localStorage.removeItem('skyblock_saved_username');
    }
    setShowUserPrompt(false);
    lookupPlayer(username);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* 1. 2D Interactive Hub Map (shown when not in a 3D scene) */}
      {!activeScene && (
        <HubMap
          onOpenDestination={handleOpenDestination}
          onSearchPlayer={(query) => {
            lookupPlayer(query);
            handleOpenDestination('player');
          }}
          onShowUserPrompt={() => setShowUserPrompt(true)}
        />
      )}

      {/* 2. 3D NPC Scene View (Bazaar, Bank, or Auction House video transition & infinite idle loop) */}
      {activeScene && (
        <NPCSceneView
          scene={activeScene}
          onOpenMenu={handleSceneMenuOpen}
          onBackToMap={() => {
            setActiveScene(null);
            setActiveDestination(null);
          }}
        />
      )}

      {/* 3. In-Game Minecraft GUI Dialog (Centered over scene) */}
      <SkyblockWindow
        isOpen={Boolean(activeDestination)}
        destination={activeDestination}
        onClose={() => setActiveDestination(null)}
      >
        {activeDestination === 'player' && (
          <PlayerView
            playerData={playerData}
            activeSubtab={playerSubtab}
            onSelectProfile={(pId) => {
              if (playerData?.player?.uuid) {
                lookupPlayer(playerData.player.uuid, pId);
              }
            }}
            onSwitchUser={() => setShowUserPrompt(true)}
          />
        )}

        {activeDestination === 'bazaar' && (
          <BazaarView
            bazaarData={bazaarData}
            playerData={playerData}
            onClose={() => setActiveDestination(null)}
          />
        )}

        {activeDestination === 'economy' && (
          <BankView
            playerData={playerData}
            initialTab={sceneInitialTab || 'account'}
            onClose={() => setActiveDestination(null)}
          />
        )}

        {activeDestination === 'auctions' && (
          <AuctionsView
            playerData={playerData}
            initialScreen={sceneInitialTab || 'main'}
            onClose={() => setActiveDestination(null)}
          />
        )}

        {activeDestination === 'ended_auctions' && <EndedAuctionsView />}

        {activeDestination === 'election' && <ElectionView />}

        {activeDestination === 'firesales' && <FiresalesView />}

        {activeDestination === 'bingo' && <BingoView playerData={playerData} />}

        {activeDestination === 'news' && <NewsView />}

        {activeDestination === 'museum' && (
          <MuseumView
            playerData={playerData}
            onSwitchUser={() => setShowUserPrompt(true)}
          />
        )}
      </SkyblockWindow>

      {/* Username / IGN Prompt Modal */}
      <UsernamePromptModal
        isOpen={showUserPrompt}
        onClose={() => setShowUserPrompt(false)}
        onSubmitUsername={handleUserPromptSubmit}
      />

      {/* Global API Loader */}
      <GlobalLoader
        visible={Boolean(loaderText)}
        text={loaderText || 'Contacting Hypixel API...'}
      />

      {/* Floating Minecraft Item Tooltip */}
      <ItemTooltip />
    </main>
  );
}
