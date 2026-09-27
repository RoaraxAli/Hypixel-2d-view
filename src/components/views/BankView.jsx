'use client';

import { useState, useMemo } from 'react';
import { formatCoins } from '@/lib/skyblockUtils';
import { getItemTexture } from '@/lib/itemTextures';

// Fallback items matching bank-ui-2.PNG
const VAULT_DEFAULT_ITEMS = [
  { slot: 0, name: 'Bat Person Ring', cleanName: 'Bat Person Ring', formattedName: '<span style="color: #AA00AA; font-weight: bold">Bat Person Ring</span>', rarity: 'EPIC', rarityColor: '#AA00AA', icon: '/textures/minecraft/pumpkin.png', loreHtml: ['<span style="color: #55FF55">+5 Speed</span>', '<span style="color: #AAAAAA">Immunity to bats and night creatures</span>'] },
  { slot: 1, name: 'Overflux Power Orb', cleanName: 'Overflux Power Orb', formattedName: '<span style="color: #FFAA00; font-weight: bold">Overflux Power Orb</span>', rarity: 'LEGENDARY', rarityColor: '#FFAA00', icon: '/textures/minecraft/carrot_on_a_stick.png', loreHtml: ['<span style="color: #55FF55">Grants +2.5% max HP/sec</span>', '<span style="color: #55FFFF">+50 Mana regen</span>'] },
  { slot: 2, name: 'Reforge Anvil', cleanName: 'Reforge Anvil', formattedName: '<span style="color: #AAAAAA; font-weight: bold">Reforge Anvil</span>', rarity: 'RARE', rarityColor: '#5555FF', icon: '/textures/minecraft/anvil.png', loreHtml: ['<span style="color: #AAAAAA">Portable anvil for quick reforges</span>'] },
  { slot: 3, name: 'Wand of Atonement', cleanName: 'Wand of Atonement', formattedName: '<span style="color: #FFAA00; font-weight: bold">Wand of Atonement</span>', rarity: 'LEGENDARY', rarityColor: '#FFAA00', icon: '/textures/minecraft/carrot_on_a_stick.png', loreHtml: ['<span style="color: #55FF55">Heal 170 HP/sec for 7s</span>'] },
  { slot: 4, name: 'Enchanted Raw Salmon', cleanName: 'Enchanted Raw Salmon', formattedName: '<span style="color: #55FF55; font-weight: bold">Enchanted Raw Salmon</span>', rarity: 'UNCOMMON', rarityColor: '#55FF55', icon: '/textures/minecraft/salmon.png', count: 64, enchanted: true, loreHtml: ['<span style="color: #AAAAAA">Used for crafting salmon gear</span>'] },
  { slot: 5, name: 'Music Disc - Cat', cleanName: 'Music Disc - Cat', formattedName: '<span style="color: #5555FF; font-weight: bold">Music Disc (Cat)</span>', rarity: 'RARE', rarityColor: '#5555FF', icon: '/textures/minecraft/record_cat.png', loreHtml: ['<span style="color: #AAAAAA">C418 - cat</span>'] },
  { slot: 6, name: 'Emerald Block', cleanName: 'Emerald Block', formattedName: '<span style="color: #55FF55; font-weight: bold">Emerald Block</span>', rarity: 'COMMON', rarityColor: '#FFFFFF', icon: '/textures/minecraft/emerald_block.png', count: 17, loreHtml: ['<span style="color: #AAAAAA">17x Compact Emerald Blocks</span>'] },
  { slot: 7, name: 'Enchanted Raw Salmon', cleanName: 'Enchanted Raw Salmon', formattedName: '<span style="color: #55FF55; font-weight: bold">Enchanted Raw Salmon</span>', rarity: 'UNCOMMON', rarityColor: '#55FF55', icon: '/textures/minecraft/salmon.png', count: 64, enchanted: true, loreHtml: ['<span style="color: #AAAAAA">Enchanted commodity</span>'] },
  { slot: 9, name: 'Enchanted Raw Salmon', cleanName: 'Enchanted Raw Salmon', formattedName: '<span style="color: #55FF55; font-weight: bold">Enchanted Raw Salmon</span>', rarity: 'UNCOMMON', rarityColor: '#55FF55', icon: '/textures/minecraft/salmon.png', count: 64, enchanted: true, loreHtml: ['<span style="color: #AAAAAA">Enchanted commodity</span>'] },
  { slot: 10, name: 'Plasma Rune III', cleanName: 'Plasma Rune III', formattedName: '<span style="color: #FFAA00; font-weight: bold">Plasma Rune III</span>', rarity: 'LEGENDARY', rarityColor: '#FFAA00', icon: '/textures/minecraft/beacon.png', enchanted: true, loreHtml: ['<span style="color: #AAAAAA">Applies glowing cosmic particles</span>'] },
  { slot: 11, name: 'Enchanted Raw Salmon', cleanName: 'Enchanted Raw Salmon', formattedName: '<span style="color: #55FF55; font-weight: bold">Enchanted Raw Salmon</span>', rarity: 'UNCOMMON', icon: '/textures/minecraft/salmon.png', count: 64, enchanted: true, loreHtml: ['<span style="color: #AAAAAA">Enchanted commodity</span>'] },
  { slot: 12, name: 'Enchanted Raw Salmon', cleanName: 'Enchanted Raw Salmon', formattedName: '<span style="color: #55FF55; font-weight: bold">Enchanted Raw Salmon</span>', rarity: 'UNCOMMON', icon: '/textures/minecraft/salmon.png', count: 64, enchanted: true, loreHtml: ['<span style="color: #AAAAAA">Enchanted commodity</span>'] },
  { slot: 13, name: 'Enchanted Raw Salmon', cleanName: 'Enchanted Raw Salmon', formattedName: '<span style="color: #55FF55; font-weight: bold">Enchanted Raw Salmon</span>', rarity: 'UNCOMMON', icon: '/textures/minecraft/salmon.png', count: 64, enchanted: true, loreHtml: ['<span style="color: #AAAAAA">Enchanted commodity</span>'] },
  { slot: 14, name: 'Enchanted Raw Salmon', cleanName: 'Enchanted Raw Salmon', formattedName: '<span style="color: #55FF55; font-weight: bold">Enchanted Raw Salmon</span>', rarity: 'UNCOMMON', icon: '/textures/minecraft/salmon.png', count: 64, enchanted: true, loreHtml: ['<span style="color: #AAAAAA">Enchanted commodity</span>'] },
  { slot: 15, name: 'Enchanted Raw Salmon', cleanName: 'Enchanted Raw Salmon', formattedName: '<span style="color: #55FF55; font-weight: bold">Enchanted Raw Salmon</span>', rarity: 'UNCOMMON', icon: '/textures/minecraft/salmon.png', count: 64, enchanted: true, loreHtml: ['<span style="color: #AAAAAA">Enchanted commodity</span>'] },
  { slot: 16, name: 'Enchanted Raw Salmon', cleanName: 'Enchanted Raw Salmon', formattedName: '<span style="color: #55FF55; font-weight: bold">Enchanted Raw Salmon</span>', rarity: 'UNCOMMON', icon: '/textures/minecraft/salmon.png', count: 64, enchanted: true, loreHtml: ['<span style="color: #AAAAAA">Enchanted commodity</span>'] },
  { slot: 18, name: 'Large Quiver', cleanName: 'Large Quiver', formattedName: '<span style="color: #AA00AA; font-weight: bold">Large Quiver</span>', rarity: 'EPIC', icon: '/textures/minecraft/arrow.png', loreHtml: ['<span style="color: #AAAAAA">Stores up to 2,048 arrows</span>'] },
  { slot: 19, name: 'Stonk Pickaxe', cleanName: 'Stonk Pickaxe', formattedName: '<span style="color: #5555FF; font-weight: bold">Stonk Pickaxe</span>', rarity: 'RARE', icon: '/textures/minecraft/diamond_pickaxe.png', enchanted: true, loreHtml: ['<span style="color: #FFAA00">Efficiency VI</span>', '<span style="color: #AAAAAA">Instant breaks endstone</span>'] },
  { slot: 20, name: 'Enchanted Raw Salmon', cleanName: 'Enchanted Raw Salmon', formattedName: '<span style="color: #55FF55; font-weight: bold">Enchanted Raw Salmon</span>', rarity: 'UNCOMMON', icon: '/textures/minecraft/salmon.png', count: 64, enchanted: true, loreHtml: ['<span style="color: #AAAAAA">Enchanted commodity</span>'] },
  { slot: 21, name: 'Name Tag', cleanName: 'Name Tag', formattedName: '<span style="color: #FFFFFF; font-weight: bold">Name Tag</span>', rarity: 'COMMON', icon: '/textures/minecraft/name_tag.png', count: 64, loreHtml: ['<span style="color: #AAAAAA">Rename items and pets</span>'] },
  { slot: 22, name: 'Name Tag', cleanName: 'Name Tag', formattedName: '<span style="color: #FFFFFF; font-weight: bold">Name Tag</span>', rarity: 'COMMON', icon: '/textures/minecraft/name_tag.png', count: 47, loreHtml: ['<span style="color: #AAAAAA">Rename items and pets</span>'] }
];

export default function BankView({ playerData, initialTab = 'account', onClose }) {
  const [tab, setTab] = useState(initialTab); // 'account' (bank-1.PNG) or 'vault' (bank-ui-2.PNG)

  const economy = playerData?.economy || {};
  const bankBalance = economy.bank || 50000000;
  const purseBalance = economy.purse || 12500000;
  const formattedBank = economy.formattedBank || formatCoins(bankBalance);
  const formattedPurse = economy.formattedPurse || formatCoins(purseBalance);
  const estInterest = formatCoins(Math.min(bankBalance * 0.02, 250000));

  // Build slots for Personal Bank Account (bank-1.PNG: 54 slots)
  const bankSlots = useMemo(() => {
    const slots = new Array(54).fill(null);

    // Fill decorative gray glass pane
    for (let i = 0; i < 54; i++) {
      slots[i] = {
        type: 'glass',
        icon: '/textures/minecraft/gray_stained_glass_pane.png',
        rawItem: {
          rawName: ' ',
          formattedName: ' ',
          loreHtml: []
        }
      };
    }

    // Slot 11: Personal Bank Account Chest
    slots[11] = {
      type: 'account_info',
      icon: '/textures/minecraft/chest.png',
      rawItem: {
        rawName: 'Personal Bank Account',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Personal Bank Account</span>',
        rarity: 'COMMON',
        loreHtml: [
          `<span style="color: #AAAAAA">Bank Balance:</span> <span style="color: #FFAA00; font-weight: bold">${formattedBank} coins</span>`,
          `<span style="color: #AAAAAA">Purse:</span> <span style="color: #FFAA00; font-weight: bold">${formattedPurse} coins</span>`,
          `<span style="color: #AAAAAA">Account Tier:</span> <span style="color: #55FF55">${economy.bankTier || 'Starter Bank'}</span>`,
          `<span style="color: #AAAAAA">Max Bank Limit:</span> <span style="color: #FFFF55">50,000,000 coins</span>`,
          '',
          '<span style="color: #55FF55">Interest received every 31 hours!</span>'
        ]
      }
    };

    // Slot 13: Recent Transactions Dropper
    slots[13] = {
      type: 'transactions',
      icon: '/textures/minecraft/dropper.png',
      rawItem: {
        rawName: 'Recent Transactions',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Recent Transactions</span>',
        rarity: 'COMMON',
        loreHtml: [
          '<span style="color: #AAAAAA">View your latest banking activity.</span>',
          '',
          '<span style="color: #55FF55">▲ Deposit:</span> <span style="color: #FFAA00">+2,500,000 coins</span> <span style="color: #555555">(2h ago)</span>',
          '<span style="color: #FF5555">▼ Interest:</span> <span style="color: #FFAA00">+250,000 coins</span> <span style="color: #555555">(12h ago)</span>',
          '<span style="color: #FF5555">▼ Withdrawal:</span> <span style="color: #FFAA00">-750,000 coins</span> <span style="color: #555555">(1d ago)</span>',
          '',
          '<span style="color: #FFFF55">Stored securely in Hypixel banking ledger</span>'
        ]
      }
    };

    // Slot 15: Bank Information & Upgrades Map
    slots[15] = {
      type: 'upgrades',
      icon: '/textures/minecraft/map.png',
      rawItem: {
        rawName: 'Bank Upgrades',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Bank Information & Upgrades</span>',
        rarity: 'COMMON',
        loreHtml: [
          '<span style="color: #AAAAAA">Upgrade your bank account to increase</span>',
          '<span style="color: #AAAAAA">your maximum balance and interest cap!</span>',
          '',
          '<span style="color: #AAAAAA">Next Tier:</span> <span style="color: #FFAA00; font-weight: bold">Gold Account</span>',
          '<span style="color: #AAAAAA">Capacity:</span> <span style="color: #FFFF55">100,000,000 coins</span>',
          '<span style="color: #AAAAAA">Upgrade Cost:</span> <span style="color: #FFAA00">5,000,000 coins</span>',
          '<span style="color: #AAAAAA">Item Cost:</span> <span style="color: #FFFF55">50x Enchanted Gold</span>'
        ]
      }
    };

    // Slot 31: Close Barrier
    slots[31] = {
      type: 'close',
      icon: '/textures/minecraft/barrier.png',
      rawItem: {
        rawName: 'Close',
        formattedName: '<span style="color: #FF5555; font-weight: bold">Close</span>',
        loreHtml: ['<span style="color: #AAAAAA">Click to exit the bank</span>']
      }
    };

    // Slot 32: Redstone Torch (Interest Info)
    slots[32] = {
      type: 'interest',
      icon: '/textures/minecraft/redstone_torch.png',
      rawItem: {
        rawName: 'Interest Information',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Interest Breakdown</span>',
        rarity: 'COMMON',
        loreHtml: [
          '<span style="color: #AAAAAA">Interest is calculated every SkyBlock season</span>',
          '<span style="color: #AAAAAA">(approx. 31 real hours).</span>',
          '',
          '<span style="color: #AAAAAA">Current Rate:</span> <span style="color: #55FF55; font-weight: bold">2.0%</span>',
          `<span style="color: #AAAAAA">Est. Next Payment:</span> <span style="color: #FFAA00; font-weight: bold">${estInterest} coins</span>`,
          '<span style="color: #AAAAAA">Time Remaining:</span> <span style="color: #55FFFF">14h 22m</span>'
        ]
      }
    };

    // Slot 34: Co-op Account
    slots[34] = {
      type: 'coop',
      icon: '/textures/minecraft/chest.png',
      rawItem: {
        rawName: 'Co-op Bank Account',
        formattedName: '<span style="color: #55FF55; font-weight: bold">Co-op Bank Account</span>',
        rarity: 'COMMON',
        loreHtml: [
          '<span style="color: #AAAAAA">Shared balance with profile members:</span>',
          `<span style="color: #AAAAAA">Total Co-op:</span> <span style="color: #FFAA00; font-weight: bold">${formattedBank} coins</span>`,
          '',
          '<span style="color: #55FF55">All co-op members can deposit and withdraw</span>'
        ]
      }
    };

    // Slot 35: Personal Vault (GOLD BLOCK) -> user clicked this to open Vault (bank-ui-2.PNG)
    slots[35] = {
      type: 'vault_button',
      icon: '/textures/minecraft/gold_block.png',
      rawItem: {
        rawName: 'Personal Vault',
        formattedName: '<span style="color: #FFAA00; font-weight: bold">Personal Vault</span>',
        rarity: 'COMMON',
        loreHtml: [
          '<span style="color: #AAAAAA">High-security private storage vault</span>',
          '<span style="color: #AAAAAA">for your most valuable items.</span>',
          '',
          '<span style="color: #FFFF55; font-weight: bold">▶ Click to open Personal Vault!</span>'
        ]
      }
    };

    return slots;
  }, [formattedBank, formattedPurse, estInterest, economy]);

  // Build slots for Personal Vault (bank-ui-2.PNG: 27 slots / 3 rows)
  const vaultSlots = useMemo(() => {
    const slots = new Array(27).fill(null);
    const apiVault = playerData?.inventories?.personalVault || [];

    if (apiVault.length > 0) {
      apiVault.slice(0, 27).forEach((item, idx) => {
        if (!item.empty) {
          slots[idx] = {
            type: 'item',
            icon: getItemTexture(item),
            count: item.count,
            enchanted: item.starsCount > 0 || item.recombobulated || (item.enchants && Object.keys(item.enchants).length > 0),
            rawItem: item
          };
        }
      });
    } else {
      // Fallback items from bank-ui-2.PNG
      VAULT_DEFAULT_ITEMS.forEach((def) => {
        slots[def.slot] = {
          type: 'item',
          icon: def.icon,
          count: def.count,
          enchanted: def.enchanted,
          rawItem: def
        };
      });
    }

    // Slot 26: Return to Bank Account button
    slots[26] = {
      type: 'back',
      icon: '/textures/minecraft/arrow.png',
      rawItem: {
        rawName: 'Go Back',
        formattedName: '<span style="color: #FF5555; font-weight: bold">◀ Go Back</span>',
        loreHtml: ['<span style="color: #AAAAAA">Return to Personal Bank Account</span>']
      }
    };

    return slots;
  }, [playerData]);

  const handleSlotClick = (slot) => {
    if (!slot) return;
    if (slot.type === 'vault_button') {
      setTab('vault');
    } else if (slot.type === 'back') {
      setTab('account');
    } else if (slot.type === 'close') {
      onClose();
    }
  };

  const inventoryItems = playerData?.inventories?.inventory || [];
  const invRows = inventoryItems.slice(9, 36);
  const hotbarRow = inventoryItems.slice(0, 9);

  return (
    <div className="mc-chest-wrapper select-none">
      <div className="mc-chest-window">
        {/* Header */}
        <div className="mc-chest-header">
          <div className="flex items-center gap-2">
            {tab === 'vault' && (
              <button
                onClick={() => setTab('account')}
                className="mc-dollar-button mr-1"
                title="Back to Bank Account"
              >
                <span className="minecraft-font text-base font-bold">◀</span>
              </button>
            )}
            <span className="mc-chest-title">
              {tab === 'account' ? 'Personal Bank Account' : 'Personal Vault'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab(tab === 'account' ? 'vault' : 'account')}
              className="mc-dollar-button"
              title={tab === 'account' ? 'View Personal Vault' : 'View Bank Account'}
            >
              <span className="minecraft-font text-lg font-bold leading-none">$</span>
            </button>
          </div>
        </div>

        {/* Chest Grid */}
        {tab === 'account' ? (
          // 6 Rows x 9 Columns for Personal Bank Account (bank-1.PNG)
          <div className="mc-chest-grid">
            {bankSlots.map((slot, idx) => {
              const dataAttr = slot?.rawItem
                ? encodeURIComponent(JSON.stringify(slot.rawItem))
                : null;
              const isGlass = slot?.type === 'glass';

              return (
                <div
                  key={idx}
                  onClick={() => handleSlotClick(slot)}
                  className={`mc-slot-cell ${isGlass ? 'glass-border' : ''} ${
                    slot?.type === 'vault_button' ? 'hover:brightness-125' : ''
                  }`}
                  data-item={dataAttr}
                >
                  {slot?.icon && (
                    <img
                      src={slot.icon}
                      alt={slot.rawItem?.rawName || ''}
                      className="w-7 h-7 object-contain pointer-events-none"
                    />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // 3 Rows x 9 Columns for Personal Vault (bank-ui-2.PNG)
          <div className="mc-chest-grid chest-rows-3">
            {vaultSlots.map((slot, idx) => {
              const dataAttr = slot?.rawItem
                ? encodeURIComponent(JSON.stringify(slot.rawItem))
                : null;

              return (
                <div
                  key={idx}
                  onClick={() => handleSlotClick(slot)}
                  className={`mc-slot-cell ${slot?.enchanted ? 'mc-enchanted' : ''}`}
                  data-item={dataAttr}
                >
                  {slot?.icon && (
                    <>
                      <img
                        src={slot.icon}
                        alt={slot.rawItem?.rawName || ''}
                        className="w-7 h-7 object-contain pointer-events-none select-none"
                        style={{ imageRendering: 'pixelated' }}
                      />
                      {slot.count && slot.count > 1 && (
                        <span className="mc-slot-count text-[11px]">{slot.count}</span>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Inventory Header */}
        <div className="mc-inventory-header">
          <span className="mc-chest-title text-xl">Inventory</span>
          <span className="minecraft-font text-base text-gray-600 font-bold">
            {playerData?.player?.username || ''}
          </span>
        </div>

        {/* 3x9 Main Player Inventory */}
        <div className="mc-inventory-grid">
          {Array.from({ length: 27 }).map((_, idx) => {
            const item = invRows[idx];
            const dataAttr = item && !item.empty ? encodeURIComponent(JSON.stringify(item)) : null;
            const tex = item && !item.empty ? getItemTexture(item) : null;
            const isEnch = item && (item.starsCount > 0 || item.recombobulated || (item.enchants && Object.keys(item.enchants).length > 0));

            return (
              <div key={idx} className="mc-slot-cell" data-item={dataAttr}>
                {item && !item.empty && (
                  <>
                    {tex ? (
                      <img
                        src={tex}
                        alt={item.cleanName || ''}
                        className={`w-7 h-7 object-contain pointer-events-none select-none ${isEnch ? 'mc-enchanted' : ''}`}
                        style={{ imageRendering: 'pixelated' }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <span
                        className="text-[10px] font-bold truncate select-none pointer-events-none px-0.5"
                        style={{ color: item.rarityColor || '#fff' }}
                      >
                        {item.cleanName?.slice(0, 4)}
                      </span>
                    )}
                    {item.count && item.count > 1 && (
                      <span className="mc-slot-count text-[11px]">{item.count}</span>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* 1x9 Hotbar */}
        <div className="mc-hotbar-grid">
          {Array.from({ length: 9 }).map((_, idx) => {
            const item = hotbarRow[idx];
            const dataAttr = item && !item.empty ? encodeURIComponent(JSON.stringify(item)) : null;
            const tex = item && !item.empty ? getItemTexture(item) : null;
            const isEnch = item && (item.starsCount > 0 || item.recombobulated || (item.enchants && Object.keys(item.enchants).length > 0));

            return (
              <div key={idx} className="mc-slot-cell" data-item={dataAttr}>
                {item && !item.empty && (
                  <>
                    {tex ? (
                      <img
                        src={tex}
                        alt={item.cleanName || ''}
                        className={`w-7 h-7 object-contain pointer-events-none select-none ${isEnch ? 'mc-enchanted' : ''}`}
                        style={{ imageRendering: 'pixelated' }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <span
                        className="text-[10px] font-bold truncate select-none pointer-events-none px-0.5"
                        style={{ color: item.rarityColor || '#fff' }}
                      >
                        {item.cleanName?.slice(0, 4)}
                      </span>
                    )}
                    {item.count && item.count > 1 && (
                      <span className="mc-slot-count text-[11px]">{item.count}</span>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
