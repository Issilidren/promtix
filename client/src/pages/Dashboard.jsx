import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../utils/api.js';
import Layout from '../components/Layout.jsx';

const BIOME_LABEL = {
  debug_forest:   'Debug Forest',
  compile_plains: 'Compile Plains',
  runtime_realm:  'Runtime Realm',
  heap_highlands: 'Heap Highlands',
  stack_caverns:  'Stack Caverns',
  null_void:      'Null Void',
  git_grove:      'Git Grove',
};

const CLASS_ICON = {
  'Fighter 1': '⚔',
  'Wizard 1':  '✦',
  'Oracle 1':  '◎',
  'Rogue 1':   '◈',
  'Druid 1':   '❈',
  'Cleric 1':  '⊕',
};

const NPC_ELEMENT_COLOR = {
  lightning: 'text-yellow-400',
  void:      'neon-pink',
  shadow:    'text-slate-400',
  light:     'text-amber-300',
  nature:    'text-emerald-400',
};

function StatBar({ value, max, className }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="h-1.5 bg-game-border rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${className}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function WorldEventCard({ event }) {
  const endsAt = new Date(event.ends_at);
  const msLeft = endsAt - Date.now();
  const hLeft  = Math.max(0, Math.floor(msLeft / 3600000));
  const mLeft  = Math.max(0, Math.floor((msLeft % 3600000) / 60000));
  return (
    <div className="bg-game-card border border-game-border rounded-lg p-3 space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-white text-xs font-bold">{event.name}</span>
        <span className="text-neon-cyan text-[10px] font-mono">{hLeft}h {mLeft}m</span>
      </div>
      <div className="h-1 bg-game-border rounded-full overflow-hidden">
        <div className="bar-pink h-full w-2/3 rounded-full" />
      </div>
    </div>
  );
}

function QuestCard({ quest }) {
  if (!quest) return null;
  const pct = quest.wins_needed > 0 ? Math.round((quest.wins_done / quest.wins_needed) * 100) : 100;
  return (
    <div className="bg-game-card border border-neon-purple/20 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-neon-purple uppercase tracking-widest">
          {quest.quest_type} quest
        </span>
      </div>
      <p className="text-white text-xs font-bold">{quest.title}</p>
      <p className="text-slate-500 text-[11px]">{quest.objective}</p>
      <StatBar value={pct} max={100} className="bar-xp" />
      <div className="flex justify-between text-[10px] text-game-muted font-mono">
        <span>{quest.wins_done}/{quest.wins_needed} wins</span>
        <span className="text-yellow-400">+{quest.reward_gold}g +{quest.reward_xp}xp</span>
      </div>
    </div>
  );
}

const MODES = [
  {
    path: '/solo',
    icon: '⚡',
    label: 'Training Grounds',
    sub: 'Solo challenges. Learn the craft.',
    accent: 'neon-cyan',
    glow: 'hover:border-neon-cyan hover:shadow-neon-cyan',
  },
  {
    path: '/pvp',
    icon: '⚔',
    label: 'PvP Arena',
    sub: 'Same challenge. Best prompt wins.',
    accent: 'neon-pink',
    glow: 'hover:border-neon-pink hover:shadow-neon-pink',
  },
  {
    path: '/coop',
    icon: '◈',
    label: 'Co-op Mode',
    sub: 'Learn together. Both earn XP.',
    accent: 'text-purple-400',
    glow: 'hover:border-purple-500/50',
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [playerData, setPlayerData]   = useState(null);
  const [worldData, setWorldData]     = useState(null);
  const [events, setEvents]           = useState([]);
  const [npcs, setNpcs]               = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Promise.all([
      api.getMe(),
      api.getWorld(),
      api.getWorldEvents(),
      api.getNpcs(),
    ])
      .then(([me, world, ev, npcList]) => {
        setPlayerData(me);
        setWorldData(world);
        setEvents(ev);
        setNpcs(npcList);
        setLoading(false);
        if (!me.character_set) navigate('/character-creation', { replace: true });
      })
      .catch(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-game-bg flex items-center justify-center">
        <div className="neon-cyan text-sm font-mono animate-pulse">&gt; sys.loading...</div>
      </div>
    );
  }

  const char  = worldData?.character;
  const world = worldData?.world;
  const quests = worldData?.quests ?? [];
  const activeQuest = quests.find(q => q.status === 'active');
  const xpToNext = playerData ? Math.ceil(Math.pow(playerData.level, 2) * 100) : 100;
  const xpPct    = playerData ? Math.min(100, Math.round((playerData.xp / xpToNext) * 100)) : 0;

  return (
    <Layout gold={char?.gold} characterName={char?.name}>
      <div className="flex h-full">
        {/* ── Main area ─────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-auto p-4 md:p-6 gap-4 min-w-0">

          {/* World header */}
          <div className="circuit-corner bg-game-panel border border-game-border rounded-xl p-4">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <div className="text-[10px] font-mono text-game-muted uppercase tracking-widest mb-1">
                  Current World
                </div>
                <h1 className="text-xl font-black text-white">
                  {world?.world_name ?? 'Unnamed Realm'}
                </h1>
                <div className="text-xs text-game-muted font-mono mt-0.5">
                  {BIOME_LABEL[world?.biome] ?? world?.biome} · Ch.{world?.story_chapter} — {world?.story_title}
                </div>
              </div>
              {char && (
                <div className="flex items-center gap-3">
                  <img
                    src={user?.avatar_url}
                    alt=""
                    className="w-10 h-10 rounded-full border-2 border-neon-cyan/40"
                  />
                  <div>
                    <div className="text-sm font-bold text-white">{char.name}</div>
                    <div className="text-[10px] neon-cyan font-mono">
                      {CLASS_ICON[char.pf_class]} {char.pf_class} · Lv.{playerData?.level}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* XP bar */}
            {playerData && (
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[10px] text-game-muted font-mono">
                  <span>{playerData.xp} / {xpToNext} XP</span>
                  <span>{playerData.wins}W · {playerData.losses}L</span>
                </div>
                <div className="h-1.5 bg-game-border rounded-full overflow-hidden">
                  <div className="bar-xp h-full rounded-full transition-all duration-700" style={{ width: `${xpPct}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Mode cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MODES.map(({ path, icon, label, sub, glow }) => (
              <Link
                key={path}
                to={path}
                className={`bg-game-panel border border-game-border rounded-xl p-5 transition-all duration-200 group ${glow}`}
              >
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="font-bold text-sm text-white mb-1 group-hover:text-neon-cyan transition-colors">
                  {label}
                </h3>
                <p className="text-game-muted text-xs leading-relaxed">{sub}</p>
              </Link>
            ))}
          </div>

          {/* HP / MP bars + stats */}
          {char && (
            <div className="bg-game-panel border border-game-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-mono text-game-muted uppercase tracking-widest">
                  Character Status
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  char.status === 'healthy'
                    ? 'text-green-400 border-green-500/30 bg-green-950/30'
                    : 'text-yellow-400 border-yellow-500/30 bg-yellow-950/30'
                }`}>
                  {char.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>HP</span><span>{char.hp}/{char.max_hp}</span>
                  </div>
                  <StatBar value={char.hp} max={char.max_hp} className="bar-hp" />
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>MP</span><span>{char.mp}/{char.max_mp}</span>
                  </div>
                  <StatBar value={char.mp} max={char.max_mp} className="bar-mp" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ['VIG', char.vigor],
                    ['REF', char.reflex],
                    ['END', char.endurance],
                    ['INS', char.insight],
                    ['SPI', char.spirit],
                    ['PRE', char.presence],
                  ].map(([k, v]) => (
                    <div key={k} className="text-center">
                      <div className="text-[9px] text-game-muted font-mono uppercase">{k}</div>
                      <div className="text-sm font-bold neon-cyan">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* NPC party row */}
          {npcs.length > 0 && (
            <div>
              <div className="text-[10px] font-mono text-game-muted uppercase tracking-widest mb-2">
                Companions
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {npcs.map(npc => (
                  <div
                    key={npc.id}
                    className="bg-game-panel border border-game-border rounded-xl p-3 min-w-[130px] shrink-0 hover:border-game-muted transition-colors"
                  >
                    <div className={`text-xl mb-1 ${NPC_ELEMENT_COLOR[npc.element] ?? 'text-slate-400'}`}>
                      {npc.role === 'shopkeeper' ? '⋄' : npc.role === 'quest_giver' ? '◆' : '◉'}
                    </div>
                    <div className="text-xs font-bold text-white">{npc.name}</div>
                    <div className={`text-[10px] font-mono capitalize ${NPC_ELEMENT_COLOR[npc.element] ?? 'text-game-muted'}`}>
                      {npc.role.replace('_', ' ')}
                    </div>
                    {npc.lines?.[0] && (
                      <p className="text-[10px] text-slate-600 mt-1 leading-tight line-clamp-2">
                        "{npc.lines[0]}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right panel ────────────────────────────────────────────── */}
        <div className="hidden lg:flex flex-col w-64 shrink-0 border-l border-game-border overflow-y-auto p-4 gap-4 bg-game-panel/50">
          {/* World events */}
          <div>
            <div className="text-[10px] font-mono text-game-muted uppercase tracking-widest mb-2">
              World Events
            </div>
            {events.length === 0 ? (
              <p className="text-game-muted text-xs font-mono">No active events.</p>
            ) : (
              <div className="space-y-2">
                {events.map(e => <WorldEventCard key={e.id} event={e} />)}
              </div>
            )}
          </div>

          {/* Active quest */}
          <div>
            <div className="text-[10px] font-mono text-game-muted uppercase tracking-widest mb-2">
              Active Quest
            </div>
            {activeQuest ? (
              <QuestCard quest={activeQuest} />
            ) : (
              <p className="text-game-muted text-xs font-mono">No active quest.</p>
            )}
          </div>

          {/* Inventory snapshot */}
          {worldData?.inventory?.length > 0 && (
            <div>
              <div className="text-[10px] font-mono text-game-muted uppercase tracking-widest mb-2">
                Inventory
              </div>
              <div className="space-y-1.5">
                {worldData.inventory.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span className={`text-xs ${`rarity-${item.rarity}`}`}>{item.name}</span>
                    <span className="text-[10px] text-game-muted font-mono">×{item.qty}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* System message */}
          <div className="mt-auto bg-game-card border border-game-border rounded-lg p-3">
            <div className="text-[9px] font-mono text-neon-cyan mb-1 uppercase tracking-widest">
              sys.msg
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed font-mono">
              &gt; Every prompt you cast teaches you something — even the bad ones.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
