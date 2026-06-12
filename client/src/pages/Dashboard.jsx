import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../utils/api.js';
import Layout from '../components/Layout.jsx';
import { BIOME_LABEL, getBiomeTheme } from '../data/biomes.js';

const CLASS_ICON = {
  'Fighter 1':   '⚔',
  'Wizard 1':    '✦',
  'Oracle 1':    '◎',
  'Rogue 1':     '◈',
  'Druid 1':     '❈',
  'Cleric 1':    '⊕',
  'Ranger 1':    '⟁',
  'Barbarian 1': '⚡',
};

const NPC_ELEMENT_COLOR = {
  lightning: 'text-yellow-400',
  void:      'neon-pink',
  shadow:    'text-slate-400',
  light:     'text-amber-300',
  nature:    'text-emerald-400',
};

const MODES = [
  {
    path: '/solo',
    icon: '⚡',
    label: 'Training Grounds',
    sub: 'Solo challenges. Learn the craft.',
    glow: 'hover:border-neon-cyan hover:shadow-neon-cyan',
  },
  {
    path: '/pvp',
    icon: '⚔',
    label: 'PvP Arena',
    sub: 'Same challenge. Best prompt wins.',
    glow: 'hover:border-neon-pink hover:shadow-neon-pink',
  },
  {
    path: '/coop',
    icon: '◈',
    label: 'Co-op Mode',
    sub: 'Learn together. Both earn XP.',
    glow: 'hover:border-purple-500/50',
  },
];

function StatBar({ value, max, className }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="h-1.5 bg-game-border rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${className}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function QuestCard({ quest }) {
  if (!quest) return null;
  const pct = quest.wins_needed > 0 ? Math.round((quest.wins_done / quest.wins_needed) * 100) : 100;
  return (
    <div className="bg-game-card border border-neon-purple/20 rounded-lg p-3 space-y-2">
      <div className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">
        {quest.quest_type} quest
      </div>
      <p className="text-white text-xs font-bold">{quest.title}</p>
      <p className="text-slate-500 text-[11px]">{quest.objective}</p>
      <div className="h-1.5 bg-game-border rounded-full overflow-hidden">
        <div className="bar-xp h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-game-muted font-mono">
        <span>{quest.wins_done}/{quest.wins_needed} wins</span>
        <span className="text-yellow-400">+{quest.reward_gold}g +{quest.reward_xp}xp</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [playerData, setPlayerData] = useState(null);
  const [worldData,  setWorldData]  = useState(null);
  const [npcs,       setNpcs]       = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    api.getMe()
      .then(me => {
        setPlayerData(me);
        if (!me.character_set) {
          navigate('/character-creation', { replace: true });
          return;
        }
        return Promise.all([api.getWorld(), api.getNpcs()])
          .then(([world, npcList]) => {
            setWorldData(world);
            setNpcs(npcList);
          })
          .catch(() => {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-game-bg flex items-center justify-center">
        <div className="neon-cyan text-sm font-mono animate-pulse">&gt; sys.loading...</div>
      </div>
    );
  }

  const char        = worldData?.character;
  const world       = worldData?.world;
  const inventory   = worldData?.inventory ?? [];
  const quests      = worldData?.quests ?? [];
  const activeQuest = quests.find(q => q.status === 'active');

  const xpToNext = playerData ? Math.ceil(Math.pow(playerData.level, 2) * 100) : 100;
  const xpPct    = playerData ? Math.min(100, Math.round((playerData.xp / xpToNext) * 100)) : 0;

  // Biome theme from Shaman palette
  const theme = getBiomeTheme(world?.biome);

  return (
    <Layout gold={char?.gold} characterName={char?.name}>
      <div className="p-4 md:p-6 space-y-4 h-full overflow-auto">

        {/* ── World Header — biome-themed ──────────────────────────── */}
        <div
          className="circuit-corner border rounded-xl p-4 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${theme.skyFrom} 0%, ${theme.skyMid} 60%, ${theme.skyTo} 100%)`,
            borderColor: theme.accent + '40',
          }}
        >
          {/* Mist overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: theme.mist }}
          />

          {/* Particle dots (purely decorative) */}
          <div className="absolute top-2 right-6 text-[8px] font-mono opacity-30 select-none"
            style={{ color: theme.particle }}>
            ✦ · ✦ · · ✦
          </div>

          <div className="relative flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest mb-1"
                style={{ color: theme.accent }}>
                {theme.displayName}
              </div>
              <h1 className="text-xl font-black text-white">
                {world?.world_name ?? 'Unnamed Realm'}
              </h1>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                {BIOME_LABEL[world?.biome] ?? world?.biome}
                {' · '}Ch.{world?.story_chapter} — {world?.story_title}
              </div>
            </div>

            {char && (
              <div className="flex items-center gap-3">
                <img src={user?.avatar_url} alt=""
                  className="w-10 h-10 rounded-full border-2 shrink-0"
                  style={{ borderColor: theme.accent + '80' }}
                />
                <div>
                  <div className="text-sm font-bold text-white">{char.name}</div>
                  <div className="text-[10px] font-mono" style={{ color: theme.accent }}>
                    {CLASS_ICON[char.pf_class]} {char.pf_class} · Lv.{playerData?.level}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* XP bar */}
          {playerData && (
            <div className="relative mt-3 space-y-1">
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>{playerData.xp} / {xpToNext} XP</span>
                <span>{playerData.wins}W · {playerData.losses}L</span>
              </div>
              <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${xpPct}%`, background: theme.accent }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Mode cards ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MODES.map(({ path, icon, label, sub, glow }) => (
            <Link key={path} to={path}
              className={`bg-game-panel border border-game-border rounded-xl p-5 transition-all duration-200 group ${glow}`}>
              <div className="text-2xl mb-3">{icon}</div>
              <h3 className="font-bold text-sm text-white mb-1 group-hover:text-neon-cyan transition-colors">
                {label}
              </h3>
              <p className="text-game-muted text-xs leading-relaxed">{sub}</p>
            </Link>
          ))}
        </div>

        {/* ── Character Status ─────────────────────────────────────── */}
        {char && (
          <div className="bg-game-panel border border-game-border rounded-xl p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
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
              <Link to="/character-creation"
                className="text-[10px] font-mono text-game-muted hover:text-neon-cyan transition-colors border border-game-border hover:border-neon-cyan/30 rounded px-2 py-1">
                ✎ edit
              </Link>
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

        {/* ── Bottom band: Quest + NPCs ─────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Active quest (covenant_log slot) */}
          <div>
            <div className="text-[10px] font-mono text-game-muted uppercase tracking-widest mb-2">
              Active Quest
            </div>
            {activeQuest ? (
              <QuestCard quest={activeQuest} />
            ) : (
              <div className="bg-game-panel border border-game-border rounded-lg p-3">
                <p className="text-game-muted text-xs font-mono">No active quest.</p>
              </div>
            )}

            {/* Inventory */}
            {inventory.length > 0 && (
              <div className="mt-3">
                <div className="text-[10px] font-mono text-game-muted uppercase tracking-widest mb-2">
                  Inventory
                </div>
                <div className="space-y-1">
                  {inventory.map(item => (
                    <div key={item.id}
                      className="flex justify-between items-center bg-game-card rounded px-3 py-1.5">
                      <span className={`text-xs rarity-${item.rarity}`}>{item.name}</span>
                      <span className="text-[10px] text-game-muted font-mono">×{item.qty}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* NPC companions (party_band slot) */}
          {npcs.length > 0 && (
            <div>
              <div className="text-[10px] font-mono text-game-muted uppercase tracking-widest mb-2">
                Companions
              </div>
              <div className="grid grid-cols-2 gap-2">
                {npcs.slice(0, 4).map(npc => (
                  <div key={npc.id}
                    className="bg-game-panel border border-game-border rounded-xl p-3 hover:border-game-muted transition-colors">
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

      </div>
    </Layout>
  );
}
