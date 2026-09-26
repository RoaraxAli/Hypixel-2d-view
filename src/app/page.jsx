'use client';

import { useState, useEffect, useCallback } from 'react';
import HubMap from '@/components/HubMap';
import SkyblockWindow from '@/components/SkyblockWindow';
import ItemTooltip from '@/components/ItemTooltip';
import GlobalLoader from '@/components/GlobalLoader';
import UsernamePromptModal from '@/components/UsernamePromptModal';

import PlayerView from '@/components/views/PlayerView';
import BazaarView from '@/components/views/BazaarView';
import AuctionsView from '@/components/views/AuctionsView';
import EndedAuctionsView from '@/components/views/EndedAuctionsView';
import ElectionView from '@/components/views/ElectionView';
import FiresalesView from '@/components/views/FiresalesView';
import BingoView from '@/components/views/BingoView';
import NewsView from '@/components/views/NewsView';
import MuseumView from '@/components/views/MuseumView';

export default function HomePage() {
  const [playerData, setPlayerData] = useState(null);
  const [bazaarData, setBazaarData] = useState(null);
  const [activeDestination, setActiveDestination] = useState(null);
  const [playerSubtab, setPlayerSubtab] = useState('inventory');
  const [showUserPrompt, setShowUserPrompt] = useState(false);
  const [loaderText, setLoaderText] = useState(null);

  // Fetch Player
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
    if (dest === 'economy') {
      setActiveDestination('player');
      setPlayerSubtab('economy');
    } else if (dest === 'dungeons') {
      setActiveDestination('player');
      setPlayerSubtab('dungeons');
    } else if (dest === 'mining') {
      setActiveDestination('player');
      setPlayerSubtab('mining');
    } else if (dest === 'garden') {
      setActiveDestination('player');
      setPlayerSubtab('garden');
    } else {
      setActiveDestination(dest);
      if (dest === 'player') setPlayerSubtab('inventory');
    }
  }, []);

  // Keyboard Navigation: Escape to close, 1-9 for hotbar destinations
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setActiveDestination(null);
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
  }, [handleOpenDestination]);

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
      {/* 2D Interactive Hub Map */}
      <HubMap
        onOpenDestination={handleOpenDestination}
        onSearchPlayer={(query) => {
          lookupPlayer(query);
          handleOpenDestination('player');
        }}
        onShowUserPrompt={() => setShowUserPrompt(true)}
      />

      {/* In-Game Window Dialog */}
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
          />
        )}

        {activeDestination === 'auctions' && <AuctionsView />}

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
