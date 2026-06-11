import { useState, useEffect } from 'react';
import { api } from '../utils/api.js';
import Layout from '../components/Layout.jsx';

const DIFF_LABEL = ['', 'Novice', 'Apprentice', 'Adept', 'Master'];
const DIFF_COLOR = ['', 'text-green-400', 'text-yellow-400', 'text-orange-400', 'text-red-400'];

const CATEGORIES = [
  { key: 'all',               label: 'ALL',     icon: '⊕' },
  { key: 'python',            label: 'PYTHON',  icon: '🐍' },
  { key: 'javascript',        label: 'JS',      icon: '⚡' },
  { key: 'debugging',         label: 'DEBUG',   icon: '◈'  },
  { key: 'sql',               label: 'SQL',     icon: '⊞'  },
  { key: 'algorithms',        label: 'ALGO',    icon: '∑'  },
  { key: 'prompt-engineering', label: 'PROMPT', icon: '✦'  },
];

const ENEMY_MAP = {
  python:             { name: 'SYNTAX_WRAITH',    icon: '☠',  color: 'text-yellow-400' },
  javascript:         { name: 'CALLBACK_DEMON',   icon: '⚡', color: 'text-yellow-300' },
  debugging:          { name: 'BUG_ENTITY',       icon: '◈',  color: 'text-red-400'    },
  sql:                { name: 'NULL_PHANTOM',      icon: '⊞',  color: 'text-purple-400' },
  algorithms:         { name: 'COMPLEXITY_BEAST', icon: '∑',  color: 'text-orange-400' },
  'prompt-engineering': { name: 'PROMPT_SPECTER', icon: '✦',  color: 'text-neon-cyan'  },
};
const DEFAULT_ENEMY = { name: 'UNKNOWN_ENTITY', icon: '◎', color: 'text-neon-cyan' };

const ENEMY_MAX_HP = [0, 30, 60, 90, 120];

function HPBar({ current, max, color = 'bg-neon-cyan' }) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-game-card rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-mono text-game-muted w-12 text-right shrink-0">{current}/{max}</span>
    </div>
  );
}

function ScoreRing({ score }) {
  const color = score >= 80 ? '#00e5ff' : score >= 50 ? '#a78bfa' : '#f87171';
  return (
    <svg viewBox="0 0 36 36" className="w-16 h-16 rotate-[-90deg]">
      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e1e40" strokeWidth="3" />
      <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={`${score} 100`} strokeLinecap="round" />
    </svg>
  );
}

function CategoryTabs({ active, onChange }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1">
      {CATEGORIES.map(cat => (
        <button
          key={cat.key}
          onClick={() => onChange(cat.key)}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
            active === cat.key
              ? 'bg-neon-cyan text-game-bg shadow-neon-cyan'
              : 'bg-game-card border border-game-border text-game-muted hover:border-neon-cyan/40 hover:text-neon-cyan'
          }`}
        >
          {cat.icon} {cat.label}
        </button>
      ))}
    </div>
  );
}

function ChallengeList({ challenges, onSelect }) {
  const [category, setCategory] = useState('all');

  const filtered = category === 'all'
    ? challenges
    : challenges.filter(c => (c.category || '').toLowerCase() === category);

  return (
    <div className="space-y-4">
      <CategoryTabs active={category} onChange={setCategory} />

      {filtered.length === 0 ? (
        <div className="text-center text-game-muted py-14 font-mono">
          &gt; No {category} challenges yet — more coming soon
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => {
            const enemy = ENEMY_MAP[c.category] || DEFAULT_ENEMY;
            return (
              <button key={c.id} onClick={() => onSelect(c)}
                className="w-full bg-game-panel border border-game-border hover:border-neon-cyan/50 rounded-xl p-4 text-left transition-all group">
                <div className="flex items-start gap-3">
                  <div className={`text-2xl mt-0.5 ${enemy.color} group-hover:scale-110 transition-transform shrink-0`}>
                    {enemy.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <h3 className="font-bold text-white group-hover:text-neon-cyan transition-colors text-sm leading-tight">
                        {c.title}
                      </h3>
                      <span className={`text-[10px] font-mono shrink-0 ${DIFF_COLOR[c.difficulty]}`}>
                        {DIFF_LABEL[c.difficulty]}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed mb-2 line-clamp-2">{c.description}</p>
                    <div className="flex items-center gap-3 text-[10px] text-game-muted font-mono">
                      <span className="neon-cyan">+{c.xp_reward} XP</span>
                      <span>{c.token_budget} tokens</span>
                      <span className="uppercase tracking-wide text-slate-500">{c.category}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-game-muted group-hover:text-neon-cyan transition-colors text-xl font-bold">
                    ›
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BattleResults({ result, challenge, onRetry, onBack }) {
  const enemy = ENEMY_MAP[challenge.category] || DEFAULT_ENEMY;
  const victory = result.score >= 50;

  return (
    <div className="space-y-4 slide-up">
      <div className={`circuit-corner rounded-xl p-5 border text-center ${
        victory ? 'bg-neon-cyan/5 border-neon-cyan/40' : 'bg-red-950/30 border-red-700/40'
      }`}>
        <div className={`text-[10px] font-mono tracking-widest mb-1 ${victory ? 'neon-cyan' : 'text-red-400'}`}>
          {victory ? '[ SPELL CONNECTED ]' : '[ ATTACK MISSED ]'}
        </div>
        <div className={`text-3xl font-black mb-3 ${victory ? 'neon-cyan' : 'text-red-400'}`}>
          {victory ? 'CAST SUCCESSFUL' : 'PROMPT FAILED'}
        </div>
        <div className="flex items-center justify-center gap-6">
          <div className="relative">
            <ScoreRing score={result.score} />
            <div className="absolute inset-0 flex items-center justify-center rotate-90">
              <span className={`text-base font-black ${
                result.score >= 80 ? 'neon-cyan' : result.score >= 50 ? 'text-purple-400' : 'text-red-400'
              }`}>{result.score}</span>
            </div>
          </div>
          <div className="text-left">
            <div className={`text-2xl font-black mb-0.5 ${victory ? 'text-white' : 'text-red-300'}`}>
              {result.score} DMG
            </div>
            <div className="text-xs text-game-muted font-mono">dealt to {enemy.name}</div>
            <div className="text-green-400 font-bold text-sm mt-1">+{result.xpEarned} XP</div>
            <div className="text-[10px] text-game-muted font-mono">{result.tokensUsed} tokens</div>
          </div>
        </div>
      </div>

      <div className="bg-game-card rounded-lg p-4">
        <p className="text-[10px] text-game-muted font-mono mb-2 uppercase tracking-widest">&gt; AI Response</p>
        <p className="text-slate-200 text-sm leading-relaxed">{result.aiResponse}</p>
      </div>

      <div className="bg-neon-cyan/5 border border-neon-cyan/20 rounded-lg p-3">
        <p className="text-[10px] neon-cyan font-mono mb-1 uppercase tracking-widest">Judge Feedback</p>
        <p className="text-slate-200 text-sm">{result.feedback}</p>
      </div>

      <div className="bg-neon-purple/5 border border-neon-purple/20 rounded-lg p-3">
        <p className="text-[10px] text-purple-400 font-mono mb-1 uppercase tracking-widest">Pro Tip</p>
        <p className="text-slate-200 text-sm">{result.tip}</p>
      </div>

      <div className="flex gap-3">
        <button onClick={onRetry}
          className="flex-1 bg-game-card hover:bg-game-border text-white font-bold py-3 rounded-xl transition-colors text-sm">
          Retry Battle
        </button>
        <button onClick={onBack}
          className="flex-1 bg-neon-cyan text-game-bg font-bold py-3 rounded-xl hover:brightness-110 transition-all shadow-neon-cyan text-sm">
          Next Battle →
        </button>
      </div>
    </div>
  );
}

function BattleScreen({ challenge, playerData, onBack }) {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const enemy = ENEMY_MAP[challenge.category] || DEFAULT_ENEMY;
  const enemyMaxHP = ENEMY_MAX_HP[challenge.difficulty] || 50;

  const character = playerData?.character;
  const charName  = character?.name     || 'Adventurer';
  const charHP    = character?.hp       || 36;
  const charMaxHP = character?.max_hp   || 36;
  const charMP    = character?.mp       || 10;
  const charMaxMP = character?.max_mp   || 10;
  const charClass = character?.pf_class || 'Fighter 1';

  async function castPrompt() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.submitChallenge(challenge.id, prompt);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <BattleResults
        result={result}
        challenge={challenge}
        onRetry={() => { setResult(null); setPrompt(''); }}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="space-y-3 slide-up">
      {/* Turn Order Bar */}
      <div className="bg-game-panel border border-game-border rounded-xl px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="text-neon-cyan font-bold">[{charName}]</span>
          <span className="text-game-muted">→</span>
          <span className={`font-bold ${enemy.color}`}>[{enemy.name}]</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-game-muted">
          <span className={DIFF_COLOR[challenge.difficulty]}>{DIFF_LABEL[challenge.difficulty]}</span>
          <span className="text-game-border">|</span>
          <span className="neon-cyan">+{challenge.xp_reward} XP</span>
        </div>
      </div>

      {/* Main Battle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* Left Column: Enemy + Action Panel */}
        <div className="space-y-3">
          {/* Enemy Card */}
          <div className={`bg-game-panel border rounded-xl p-4 transition-all duration-300 ${
            loading ? 'border-neon-pink/60 shadow-[0_0_20px_rgba(224,64,251,0.15)]' : 'border-game-border'
          }`}>
            <div className="text-[10px] font-mono text-game-muted mb-3 uppercase tracking-widest">ENEMY</div>
            <div className={`text-5xl text-center mb-2 ${enemy.color} ${loading ? 'animate-pulse' : ''}`}>
              {enemy.icon}
            </div>
            <div className={`text-center text-xs font-black font-mono mb-0.5 ${enemy.color}`}>
              {enemy.name}
            </div>
            <div className="text-[10px] text-center text-game-muted font-mono mb-3 uppercase tracking-wide">
              {challenge.category} • {DIFF_LABEL[challenge.difficulty]}
            </div>
            <div className="text-[9px] font-mono text-game-muted mb-1">HP</div>
            <HPBar current={enemyMaxHP} max={enemyMaxHP} color="bg-neon-pink" />
          </div>

          {/* Action Panel */}
          <div className="bg-game-panel border border-game-border rounded-xl p-3">
            <div className="text-[10px] font-mono text-game-muted mb-2 uppercase tracking-widest">ACTION</div>
            <div className="space-y-1.5">
              <button
                onClick={castPrompt}
                disabled={!prompt.trim() || loading}
                className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-black font-mono bg-neon-cyan/15 border border-neon-cyan text-neon-cyan hover:bg-neon-cyan/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ⚡ CAST PROMPT
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg text-xs font-mono bg-game-card border border-game-border text-game-muted opacity-40 cursor-not-allowed" disabled>
                🛡 DEFEND
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg text-xs font-mono bg-game-card border border-game-border text-game-muted opacity-40 cursor-not-allowed" disabled>
                🎒 ITEMS
              </button>
              <button
                onClick={onBack}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-mono bg-game-card border border-red-900/40 text-red-400 hover:bg-red-950/30 transition-colors"
              >
                ✕ FLEE
              </button>
            </div>
          </div>
        </div>

        {/* Right Area: Challenge + Prompt Input */}
        <div className="lg:col-span-2 space-y-3">
          {/* Challenge / Enemy Brief */}
          <div className="circuit-corner bg-game-panel border border-game-border rounded-xl p-4">
            <div className="text-[10px] font-mono text-game-muted mb-1 uppercase tracking-widest">
              {enemy.name} prepares its attack...
            </div>
            <h2 className="font-black text-white text-base mb-2">{challenge.title}</h2>
            <div className="text-slate-300 text-xs leading-relaxed font-mono whitespace-pre-wrap">
              {challenge.description}
            </div>
            <div className="mt-3 pt-3 border-t border-game-border flex gap-4 text-[10px] font-mono text-game-muted">
              <span>Budget: {challenge.token_budget} tokens</span>
              <span className="capitalize">{challenge.category}</span>
            </div>
          </div>

          {/* Prompt Input */}
          <div>
            <label className="text-[10px] font-mono text-neon-cyan mb-1.5 block uppercase tracking-widest">
              &gt; Craft your spell — Ctrl+Enter to cast
            </label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) castPrompt(); }}
              placeholder="Write your prompt here..."
              rows={6}
              disabled={loading}
              className="w-full bg-game-card border border-game-border focus:border-neon-cyan focus:shadow-neon-sm rounded-xl p-4 text-white placeholder-game-muted outline-none font-mono text-sm transition-all resize-none disabled:opacity-50"
            />
          </div>

          {error && (
            <div className="bg-red-950/60 border border-red-700/60 text-red-300 rounded-lg p-3 text-sm font-mono">
              &gt; ERROR: {error}
            </div>
          )}

          <button
            onClick={castPrompt}
            disabled={!prompt.trim() || loading}
            className="w-full bg-neon-cyan text-game-bg font-black py-3.5 rounded-xl hover:brightness-110 transition-all shadow-neon-cyan disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none text-sm tracking-wide"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-pulse">◈</span> CASTING...
              </span>
            ) : '⚡ CAST PROMPT'}
          </button>
        </div>
      </div>

      {/* Player Stats Footer */}
      <div className="bg-game-panel border border-game-border rounded-xl px-4 py-3">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-full bg-game-card border border-neon-cyan/40 flex items-center justify-center text-neon-cyan text-xs font-black">
              {charName[0]}
            </div>
            <div>
              <div className="text-[10px] text-white font-bold font-mono leading-none">{charName}</div>
              <div className="text-[9px] text-game-muted font-mono">{charClass}</div>
            </div>
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-red-400 w-4 shrink-0">HP</span>
              <HPBar current={charHP} max={charMaxHP} color="bg-green-500" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-blue-400 w-4 shrink-0">MP</span>
              <HPBar current={charMP} max={charMaxMP} color="bg-blue-500" />
            </div>
          </div>
          <div className={`text-[10px] font-mono px-2 py-1 rounded shrink-0 ${
            loading ? 'text-neon-pink bg-neon-pink/10' : 'text-neon-cyan bg-neon-cyan/10'
          }`}>
            CT: {loading ? 'CASTING' : 'READY'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Solo() {
  const [challenges, setChallenges] = useState([]);
  const [active, setActive] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  useEffect(() => {
    Promise.all([
      api.getChallenges()
        .then(data => {
          setChallenges(data);
          localStorage.setItem('promtix_challenges', JSON.stringify(data));
        })
        .catch(() => {
          const cached = localStorage.getItem('promtix_challenges');
          if (cached) setChallenges(JSON.parse(cached));
        }),
      api.getWorld().then(setPlayerData).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-[10px] font-mono text-game-muted uppercase tracking-widest mb-0.5">
              {active ? '[ IN BATTLE ]' : 'Mode'}
            </div>
            <h1 className="text-xl font-black text-white">
              {active ? active.title : 'Training Grounds'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {offline && (
              <span className="text-yellow-400 text-xs bg-yellow-950/60 border border-yellow-800/60 px-3 py-1 rounded-lg font-mono">
                offline
              </span>
            )}
            {active && (
              <button
                onClick={() => setActive(null)}
                className="text-xs text-game-muted hover:text-white font-mono px-3 py-1.5 bg-game-card border border-game-border rounded-lg transition-colors"
              >
                ← RETREAT
              </button>
            )}
          </div>
        </div>

        {active ? (
          <BattleScreen
            key={active.id}
            challenge={active}
            playerData={playerData}
            onBack={() => setActive(null)}
          />
        ) : loading ? (
          <div className="text-center text-game-muted py-20 font-mono">
            &gt; Loading encounter data...
          </div>
        ) : challenges.length === 0 ? (
          <div className="text-center text-game-muted py-20 font-mono">
            {offline
              ? '> No cached data. Connect to load challenges.'
              : '> No challenges available yet.'}
          </div>
        ) : (
          <ChallengeList challenges={challenges} onSelect={setActive} />
        )}
      </div>
    </Layout>
  );
}
