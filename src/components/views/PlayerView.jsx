'use client';

import { useState } from 'react';
import ItemSlot from '@/components/ItemSlot';

function renderSlot(item, customClass = '') {
  return <ItemSlot item={item} customClass={customClass} />;
}

export default function PlayerView({ playerData, activeSubtab = 'inventory', onSelectProfile, onSwitchUser }) {
  const [subtab, setSubtab] = useState(activeSubtab);
  const [storageKey, setStorageKey] = useState('enderChest');

  if (!playerData) {
    return (
      <div className="text-center p-12 glass-panel rounded-2xl border border-[#30363d] space-y-3">
        <h3 className="text-lg font-bold text-white">No Player Profile Loaded</h3>
        <p className="text-xs text-gray-400">Search for a Minecraft player using the search bar above.</p>
      </div>
    );
  }

  const { player, profiles = [], selectedProfile = {}, privacy = {}, inventories = {}, skills = {}, slayers = {}, dungeons = {}, mining = {}, pets = [], rift = {}, garden = {}, economy = {}, misc = {} } = playerData;

  const restrictedList = [];
  if (privacy.inventoryRestricted) restrictedList.push('Inventories & Gear');
  if (privacy.skillsRestricted) restrictedList.push('Skills');
  if (privacy.bankingRestricted) restrictedList.push('Co-op Banking');
  if (privacy.collectionsRestricted) restrictedList.push('Collections');

  const mainItems = (inventories.inventory || []).slice(9, 36);
  const hotbarItems = (inventories.inventory || []).slice(0, 9);

  let storageItems = [];
  if (storageKey === 'enderChest') storageItems = inventories.enderChest || [];
  else if (storageKey === 'talismanBag') storageItems = inventories.talismanBag || [];
  else if (storageKey === 'potionBag') storageItems = inventories.potionBag || [];
  else if (storageKey === 'fishingBag') storageItems = inventories.fishingBag || [];
  else if (storageKey === 'personalVault') storageItems = inventories.personalVault || [];

  return (
    <section className="space-y-6">
      {/* Player Header Card */}
      <div className="glass-panel rounded-2xl p-6 border border-[#30363d] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={player.avatarUrl || `https://mc-heads.net/avatar/${player.uuid}/100`}
                className="w-20 h-20 rounded-xl bg-[#090c10] border-2 border-amber-500/50 shadow-lg shadow-amber-500/10"
                alt="Avatar"
              />
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-black">
                ONLINE
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className="px-2.5 py-0.5 rounded text-xs font-black tracking-wide bg-amber-400/20 text-amber-400 border border-amber-400/30"
                  style={{ color: player.rankColor, borderColor: `${player.rankColor}40` }}
                >
                  [{player.rank}]
                </span>
                <h1 className="text-2xl font-black text-white tracking-wide">{player.username}</h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-800 text-gray-300">
                  {selectedProfile.gameMode || 'Standard'}
                </span>
              </div>
              <p className="text-xs font-mono text-gray-500 mt-1 select-all">UUID: {player.uuid}</p>

              <div className="flex items-center gap-4 mt-3 flex-wrap text-xs">
                <div className="flex items-center gap-1.5 text-gray-300">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span>SB Level:</span>
                  <span className="font-bold text-cyan-400 font-mono">{misc.skyblockLevel || 0}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Skill Avg:</span>
                  <span className="font-bold text-emerald-400 font-mono">{skills.skillAverage || 0}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-300">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  <span>Cata:</span>
                  <span className="font-bold text-purple-400 font-mono">{dungeons.catacombs?.level || 0}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-300">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>Purse:</span>
                  <span className="font-bold text-amber-400 font-mono">{economy.formattedPurse || 0}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-300">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  <span>Bank:</span>
                  <span className="font-bold text-blue-400 font-mono">{economy.formattedBank || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Selector & Switch User */}
          <div className="flex flex-col gap-2 min-w-[200px]">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                Select Profile:
              </label>
              <button
                onClick={onSwitchUser}
                className="px-2.5 py-1 rounded bg-[#090c10] hover:bg-[#21262d] border border-[#30363d] text-gray-300 hover:text-amber-400 text-xs font-semibold transition"
              >
                Switch IGN
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profiles.map(p => {
                const isSelected = p.profileId === selectedProfile.profileId;
                return (
                  <button
                    key={p.profileId}
                    onClick={() => onSelectProfile(p.profileId)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                        : 'bg-[#161b22] text-gray-400 hover:text-white hover:bg-[#21262d] border border-[#30363d]'
                    }`}
                  >
                    {p.cuteName}
                    {p.gameMode !== 'standard' && (
                      <span className="opacity-75 text-[10px] ml-1">({p.gameMode})</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Privacy Alert Banner */}
        {restrictedList.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
            <div>
              <span className="font-bold">Player API Restrictions Detected:</span>
              <p className="mt-0.5 text-amber-200/80">
                This player has restricted their public API settings for: [{restrictedList.join(', ')}]. To view all stats, enable them in SkyBlock via /settings -&gt; API Settings.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Subtab Navigation Buttons */}
      <div className="border-b border-[#30363d] flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 text-xs font-semibold">
        {[
          { key: 'inventory', label: 'Gear & Inventory' },
          { key: 'skills', label: 'Skills (1-60)' },
          { key: 'slayers', label: 'Slayers' },
          { key: 'dungeons', label: 'Dungeons' },
          { key: 'mining', label: 'Mining & HotM' },
          { key: 'pets', label: 'Pets' },
          { key: 'rift', label: 'The Rift' },
          { key: 'garden', label: 'The Garden' },
          { key: 'economy', label: 'Economy & Bank' },
          { key: 'misc', label: 'Misc Stats' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSubtab(tab.key)}
            className={`px-3 py-1.5 rounded-lg transition ${
              subtab === tab.key
                ? 'bg-amber-500 text-black font-bold'
                : 'text-gray-400 hover:text-white hover:bg-[#161b22]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: INVENTORY */}
      {subtab === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-panel rounded-xl p-5 border border-[#30363d] space-y-4">
              <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">
                Equipped Armor &amp; Equipment
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-400 mb-2 block font-medium">Armor</span>
                  <div className="flex gap-2">
                    {(inventories.armor || []).map((i, idx) => (
                      <div key={idx}>{renderSlot(i, 'w-12 h-12')}</div>
                    ))}
                  </div>
                </div>
                <div className="pt-2 border-t border-[#21262d]">
                  <span className="text-xs text-gray-400 mb-2 block font-medium">Equipment</span>
                  <div className="flex gap-2">
                    {(inventories.equipment || []).map((i, idx) => (
                      <div key={idx}>{renderSlot(i, 'w-12 h-12')}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 glass-panel rounded-xl p-5 border border-[#30363d] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">
                  Main Inventory (36 Slots)
                </h3>
                <span className="text-xs text-gray-400">Hover item to inspect</span>
              </div>

              <div className="p-3 bg-[#4a4a4a] rounded-lg border-2 border-[#373737] w-fit mx-auto shadow-inner">
                <div className="grid grid-cols-9 gap-1 mb-2">
                  {mainItems.map((i, idx) => (
                    <div key={idx}>{renderSlot(i)}</div>
                  ))}
                </div>
                <div className="grid grid-cols-9 gap-1 pt-1 border-t-2 border-[#373737]">
                  {hotbarItems.map((i, idx) => (
                    <div key={idx}>{renderSlot(i)}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-5 border border-[#30363d] space-y-4">
            <div className="flex items-center justify-between border-b border-[#21262d] pb-3 flex-wrap gap-2">
              <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">
                Extended Storage &amp; Bags
              </h3>
              <div className="flex gap-1.5 text-xs">
                {[
                  { key: 'enderChest', label: 'Ender Chest' },
                  { key: 'talismanBag', label: 'Accessory Bag' },
                  { key: 'backpacks', label: 'Backpacks' },
                  { key: 'potionBag', label: 'Potion Bag' },
                  { key: 'fishingBag', label: 'Fishing Bag' },
                  { key: 'personalVault', label: 'Personal Vault' },
                ].map(st => (
                  <button
                    key={st.key}
                    onClick={() => setStorageKey(st.key)}
                    className={`px-2.5 py-1 rounded transition ${
                      storageKey === st.key
                        ? 'bg-[#21262d] text-white font-bold'
                        : 'bg-[#161b22] text-gray-400 hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-[160px] flex items-center justify-center p-3 bg-[#4a4a4a] rounded-lg border-2 border-[#373737] w-fit mx-auto shadow-inner">
              {storageKey === 'backpacks' ? (
                (!inventories.backpacks || inventories.backpacks.length === 0) ? (
                  <span className="text-xs text-gray-400 p-4">No backpacks found in inventory storage.</span>
                ) : (
                  <div className="space-y-4 w-full">
                    {inventories.backpacks.map(bp => (
                      <div key={bp.index}>
                        <span className="text-xs font-bold text-amber-400 block mb-1.5">{bp.name}</span>
                        <div className="grid grid-cols-9 gap-1">
                          {(bp.items || []).map((i, idx) => (
                            <div key={idx}>{renderSlot(i)}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : storageItems.length === 0 ? (
                <span className="text-xs text-gray-400 p-4">Storage is empty or API is disabled.</span>
              ) : (
                <div className="grid grid-cols-9 gap-1">
                  {storageItems.map((i, idx) => (
                    <div key={idx}>{renderSlot(i)}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SKILLS */}
      {subtab === 'skills' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Skill Progression &amp; Levels</h3>
            <div className="text-xs text-gray-400">
              Non-Cosmetic Skill Avg: <strong className="text-emerald-400 font-mono">{skills.skillAverage || 0}</strong>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(skills.skills || []).map(skill => {
              const isMax = skill.level >= skill.maxLevel;
              return (
                <div key={skill.id} className="glass-panel rounded-xl p-4 border border-[#30363d] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{skill.icon}</span>
                      <div>
                        <h4 className="font-bold text-sm text-white">{skill.name}</h4>
                        <span className="text-[11px] text-gray-400 font-mono">{skill.xp.toLocaleString()} Total XP</span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded text-xs font-black font-mono ${
                      isMax ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-gray-800 text-gray-200'
                    }`}>
                      {isMax ? 'MAX ' : 'LVL '}{skill.level}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full bg-[#090c10] h-2 rounded-full overflow-hidden border border-[#21262d]">
                      <div className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-300" style={{ width: `${skill.progressPercent}%` }} />
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-400 font-mono">
                      <span>{isMax ? 'Completed' : `${skill.currentXp.toLocaleString()} / ${skill.nextLevelXp.toLocaleString()}`}</span>
                      <span>{skill.progressPercent}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: SLAYERS */}
      {subtab === 'slayers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Slayer Boss Mastery</h3>
            <span className="text-xs text-gray-400">Total Slayer XP: <strong className="text-amber-400 font-mono">{(slayers.totalXp || 0).toLocaleString()}</strong></span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(slayers.slayers || []).map(boss => {
              const isMax = boss.level >= boss.maxLevel;
              return (
                <div key={boss.id} className="glass-panel rounded-xl p-4 border border-[#30363d] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{boss.icon}</span>
                      <div>
                        <h4 className="font-bold text-sm text-white">{boss.name}</h4>
                        <span className="text-[11px] text-gray-400 font-mono">{boss.xp.toLocaleString()} XP</span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded text-xs font-black font-mono ${
                      isMax ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-gray-800 text-gray-200'
                    }`}>
                      LVL {boss.level}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full bg-[#090c10] h-2 rounded-full overflow-hidden border border-[#21262d]">
                      <div className="bg-gradient-to-r from-amber-500 to-red-500 h-full" style={{ width: `${boss.progressPercent}%` }} />
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-400 font-mono">
                      <span>{isMax ? 'Maxed Level' : `${boss.currentXp.toLocaleString()} / ${boss.nextLevelXp.toLocaleString()}`}</span>
                      <span>{boss.progressPercent}%</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#21262d] grid grid-cols-5 gap-1 text-center font-mono">
                    <div className="p-1 rounded bg-[#090c10] border border-[#21262d]">
                      <span className="text-[10px] text-gray-400 block">T1</span>
                      <span className="text-xs font-bold text-gray-200">{boss.kills.t1}</span>
                    </div>
                    <div className="p-1 rounded bg-[#090c10] border border-[#21262d]">
                      <span className="text-[10px] text-gray-400 block">T2</span>
                      <span className="text-xs font-bold text-gray-200">{boss.kills.t2}</span>
                    </div>
                    <div className="p-1 rounded bg-[#090c10] border border-[#21262d]">
                      <span className="text-[10px] text-gray-400 block">T3</span>
                      <span className="text-xs font-bold text-gray-200">{boss.kills.t3}</span>
                    </div>
                    <div className="p-1 rounded bg-[#090c10] border border-[#21262d]">
                      <span className="text-[10px] text-gray-400 block">T4</span>
                      <span className="text-xs font-bold text-amber-400">{boss.kills.t4}</span>
                    </div>
                    <div className="p-1 rounded bg-[#090c10] border border-[#21262d]">
                      <span className="text-[10px] text-gray-400 block">T5</span>
                      <span className="text-xs font-bold text-red-400">{boss.kills.t5}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: DUNGEONS */}
      {subtab === 'dungeons' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-[#30363d] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">The Catacombs</span>
                <div className="flex items-center gap-3 mt-1">
                  <h3 className="text-2xl font-black text-white font-mono">Level {dungeons.catacombs?.level || 0}</h3>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                    (dungeons.catacombs?.level || 0) >= 50 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-purple-500/20 text-purple-300'
                  }`}>
                    {(dungeons.catacombs?.level || 0) >= 50 ? 'CATA 50 MAX' : `${dungeons.catacombs?.progressPercent || 0}% to next`}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 font-mono">{(dungeons.catacombs?.xp || 0).toLocaleString()} Total Catacombs XP</p>
              </div>

              <div className="flex gap-4">
                <div className="px-4 py-2 rounded-xl bg-[#090c10] border border-[#21262d]">
                  <span className="text-xs text-gray-400 block">Selected Class</span>
                  <span className="text-sm font-bold text-cyan-400 uppercase font-mono">{dungeons.selectedClass || 'None'}</span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-[#090c10] border border-[#21262d]">
                  <span className="text-xs text-gray-400 block">Secrets Discovered</span>
                  <span className="text-sm font-bold text-amber-400 font-mono">{(dungeons.secrets || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="w-full bg-[#090c10] h-2.5 rounded-full overflow-hidden border border-[#21262d]">
              <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 h-full" style={{ width: `${dungeons.catacombs?.progressPercent || 0}%` }} />
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-[#30363d] space-y-4">
            <h4 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Dungeon Classes</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {(dungeons.classes || []).map(cls => (
                <div key={cls.id} className={`p-4 rounded-xl bg-[#090c10] border ${cls.selected ? 'border-amber-400/50 shadow-md shadow-amber-400/10' : 'border-[#21262d]'} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-sm ${cls.selected ? 'text-amber-400' : 'text-gray-200'}`}>{cls.name}</span>
                    <span className={`font-mono text-xs font-black ${cls.level >= 50 ? 'text-amber-400' : 'text-gray-300'}`}>Lvl {cls.level}</span>
                  </div>
                  <div className="w-full bg-[#161b22] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full" style={{ width: `${cls.progressPercent}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-500 block font-mono">{cls.xp.toLocaleString()} XP</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel rounded-xl p-5 border border-[#30363d] space-y-3">
              <h4 className="text-sm font-bold text-gray-200 uppercase tracking-wider">The Catacombs Floors (F1 - F7)</h4>
              <div className="grid grid-cols-4 gap-2 text-center font-mono">
                {Object.entries(dungeons.floorCompletions || {}).map(([floor, count]) => (
                  <div key={floor} className="p-2 rounded-lg bg-[#090c10] border border-[#21262d]">
                    <span className="text-xs text-purple-400 font-bold block">{floor}</span>
                    <span className="text-xs text-gray-200 font-semibold">{count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-xl p-5 border border-[#30363d] space-y-3">
              <h4 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Master Mode (M1 - M7)</h4>
              <div className="grid grid-cols-4 gap-2 text-center font-mono">
                {Object.entries(dungeons.masterCompletions || {}).map(([floor, count]) => (
                  <div key={floor} className="p-2 rounded-lg bg-[#090c10] border border-[#21262d]">
                    <span className="text-xs text-red-400 font-bold block">{floor}</span>
                    <span className="text-xs text-gray-200 font-semibold">{count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MINING */}
      {subtab === 'mining' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-[#30363d] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Mining Progression</span>
                <div className="flex items-center gap-3 mt-1">
                  <h3 className="text-2xl font-black text-white font-mono">Heart of the Mountain Lvl {mining?.level || 0}</h3>
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-300">
                    {mining?.level >= 10 ? 'MAX HOTM 10' : `${mining?.progressPercent || 0}%`}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 font-mono">{(mining?.xp || 0).toLocaleString()} Total HotM XP</p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-[#090c10] border border-[#21262d]">
                <span className="text-xs text-gray-400 block">Available Tokens</span>
                <span className="text-sm font-bold text-cyan-400 font-mono">{(mining?.tokens || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="w-full bg-[#090c10] h-2.5 rounded-full overflow-hidden border border-[#21262d]">
              <div className="bg-gradient-to-r from-cyan-500 to-amber-400 h-full" style={{ width: `${mining?.progressPercent || 0}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel rounded-xl p-5 border border-[#30363d] space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase">Mithril Powder</span>
              <h4 className="text-xl font-black text-white font-mono">{(mining?.powders?.mithril?.current || 0).toLocaleString()}</h4>
              <span className="text-[11px] text-gray-400 block font-mono">Total: {(mining?.powders?.mithril?.total || 0).toLocaleString()}</span>
            </div>
            <div className="glass-panel rounded-xl p-5 border border-[#30363d] space-y-2">
              <span className="text-xs font-bold text-pink-400 uppercase">Gemstone Powder</span>
              <h4 className="text-xl font-black text-white font-mono">{(mining?.powders?.gemstone?.current || 0).toLocaleString()}</h4>
              <span className="text-[11px] text-gray-400 block font-mono">Total: {(mining?.powders?.gemstone?.total || 0).toLocaleString()}</span>
            </div>
            <div className="glass-panel rounded-xl p-5 border border-[#30363d] space-y-2">
              <span className="text-xs font-bold text-cyan-400 uppercase">Glacite Powder</span>
              <h4 className="text-xl font-black text-white font-mono">{(mining?.powders?.glacite?.current || 0).toLocaleString()}</h4>
              <span className="text-[11px] text-gray-400 block font-mono">Total: {(mining?.powders?.glacite?.total || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: PETS */}
      {subtab === 'pets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">
              Pet Collection (<span>{pets.length}</span> Pets)
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pets.map((pet, idx) => (
              <div key={idx} className={`glass-panel rounded-xl p-4 border ${pet.active ? 'border-amber-400/60 shadow-lg shadow-amber-400/10' : 'border-[#30363d]'} space-y-2 relative overflow-hidden`}>
                {pet.active && (
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-500 text-black">
                    ACTIVE
                  </span>
                )}
                <h4 className="font-bold text-sm text-white">{pet.cleanName}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black font-mono px-2 py-0.5 rounded bg-[#090c10] border border-[#21262d] text-amber-400">
                    Lvl {pet.level}
                  </span>
                  <span className="text-xs font-semibold text-gray-400 uppercase">{pet.tier}</span>
                </div>
                {pet.heldItem && (
                  <p className="text-[11px] text-cyan-400 font-mono truncate">Item: {pet.heldItem}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: RIFT */}
      {subtab === 'rift' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-panel rounded-xl p-5 border border-[#30363d] space-y-1">
              <span className="text-xs uppercase font-bold text-purple-400">Enigma Souls</span>
              <h3 className="text-2xl font-black text-white font-mono">{rift.enigmaSouls || 0} / 42</h3>
            </div>
            <div className="glass-panel rounded-xl p-5 border border-[#30363d] space-y-1">
              <span className="text-xs uppercase font-bold text-amber-400">Secured Timecharms</span>
              <h3 className="text-2xl font-black text-white font-mono">{(rift.timecharms || []).length} / 8</h3>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: GARDEN */}
      {subtab === 'garden' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-[#30363d] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">The Farming Garden</span>
                <h3 className="text-2xl font-black text-white font-mono mt-1">Level {garden.level?.level || 0}</h3>
              </div>
              <div className="flex gap-4">
                <div className="px-4 py-2 rounded-xl bg-[#090c10] border border-[#21262d]">
                  <span className="text-xs text-gray-400 block">Unlocked Plots</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">{garden.unlockedPlotsCount || 0} / 24</span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-[#090c10] border border-[#21262d]">
                  <span className="text-xs text-gray-400 block">Unique Visitors</span>
                  <span className="text-sm font-bold text-cyan-400 font-mono">{garden.visitors?.unique || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: ECONOMY */}
      {subtab === 'economy' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-panel rounded-xl p-5 border border-[#30363d] space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase">Coin Purse</span>
              <h3 className="text-2xl font-black text-white font-mono">{economy.formattedPurse || 0}</h3>
            </div>
            <div className="glass-panel rounded-xl p-5 border border-[#30363d] space-y-2">
              <span className="text-xs font-bold text-blue-400 uppercase">Bank Balance</span>
              <h3 className="text-2xl font-black text-white font-mono">{economy.formattedBank || 0}</h3>
            </div>
          </div>

          <div className="glass-panel rounded-2xl border border-[#30363d] overflow-hidden space-y-3 p-5">
            <h4 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Recent Co-op Bank Transactions</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#090c10] text-gray-400 border-b border-[#21262d]">
                  <tr>
                    <th className="p-2.5">Action</th>
                    <th className="p-2.5">Amount</th>
                    <th className="p-2.5">Initiator</th>
                    <th className="p-2.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#21262d]">
                  {(economy.transactions || []).map((tx, idx) => (
                    <tr key={idx} className="hover:bg-[#161b22]">
                      <td className={`p-2.5 font-bold ${tx.action === 'DEPOSIT' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {tx.action}
                      </td>
                      <td className="p-2.5 text-white font-bold">{tx.formattedAmount}</td>
                      <td className="p-2.5 text-gray-300">{tx.initiator}</td>
                      <td className="p-2.5 text-gray-500">{new Date(tx.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 10: MISC */}
      {subtab === 'misc' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel rounded-xl p-5 border border-[#30363d] space-y-1">
            <span className="text-xs uppercase font-bold text-gray-400">Total Deaths</span>
            <h3 className="text-2xl font-black text-red-400 font-mono">{(misc.deaths || 0).toLocaleString()}</h3>
          </div>
          <div className="glass-panel rounded-xl p-5 border border-[#30363d] space-y-1">
            <span className="text-xs uppercase font-bold text-gray-400">Total Mob Kills</span>
            <h3 className="text-2xl font-black text-emerald-400 font-mono">{(misc.kills || 0).toLocaleString()}</h3>
          </div>
          <div className="glass-panel rounded-xl p-5 border border-[#30363d] space-y-1">
            <span className="text-xs uppercase font-bold text-gray-400">Fairy Souls Collected</span>
            <h3 className="text-2xl font-black text-pink-400 font-mono">{(misc.fairySouls || 0).toLocaleString()}</h3>
          </div>
        </div>
      )}
    </section>
  );
}
