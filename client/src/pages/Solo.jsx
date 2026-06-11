import { useState, useEffect } from 'react';
import { api } from '../utils/api.js';
import Layout from '../components/Layout.jsx';

const DIFF_LABEL = ['', 'Novice', 'Apprentice', 'Adept', 'Master'];
const DIFF_COLOR = ['', 'text-green-400', 'text-yellow-400', 'text-orange-400', 'text-red-400'];

function ScoreRing({ score }) {
  const color = score >= 80 ? '#00e5ff' : score >= 50 ? '#a78bfa' : '#f87171';
  return (
    <svg viewBox="0 0 36 36" className="w-16 h-16 rotate-[-90deg]">
      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e1e40" strokeWidth="3" />
      <circle
        cx="18" cy="18" r="15.9" fill="none"
        stroke={color} strokeWidth="3"
        strokeDasharray={`${score} 100`} strokeLinecap="round"
      />
    </svg>
  );
}

function ChallengeList({ challenges, onSelect }) {
  return (
    <div className="space-y-3">
      {challenges.map(c => (
        <button
          key={c.id}
          onClick={() => onSelect(c)}
          className="w-full bg-game-panel border border-game-border hover:border-neon-cyan/40 rounded-xl p-5 text-left transition-all group"
        >
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-bold text-white group-hover:text-neon-cyan transition-colors">{c.title}</h3>
            <span className={`text-xs font-mono ml-2 shrink-0 ${DIFF_COLOR[c.difficulty]}`}>
              {DIFF_LABEL[c.difficulty]}
            </span>
          </div>
          <p className="text-slate-400 text-sm mb-3">{c.description}</p>
          <div className="flex gap-4 text-xs text-game-muted font-mono">
            <span className="neon-cyan">+{c.xp_reward} XP</span>
            <span>{c.token_budget} token budget</span>
            <span className="capitalize">{c.category}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function ActiveChallenge({ challenge, onBack }) {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function submit() {
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
      <div className="space-y-4 slide-up">
        <div className="bg-game-panel border border-game-border rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <ScoreRing score={result.score} />
            <div>
              <div className="text-4xl font-black neon-cyan">{result.score}</div>
              <div className="text-game-muted text-xs font-mono">/ 100</div>
              <div className="text-green-400 font-bold text-sm mt-1">+{result.xpEarned} XP</div>
            </div>
            <div className="ml-auto text-right text-xs text-game-muted font-mono">
              {result.tokensUsed} tokens
            </div>
          </div>

          <div className="bg-game-card rounded-lg p-4 mb-3">
            <p className="text-[10px] text-game-muted font-mono mb-2 uppercase tracking-widest">AI Response</p>
            <p className="text-slate-200 text-sm leading-relaxed">{result.aiResponse}</p>
          </div>

          <div className="bg-neon-cyan/5 border border-neon-cyan/20 rounded-lg p-3 mb-3">
            <p className="text-[10px] neon-cyan font-mono mb-1 uppercase tracking-widest">Feedback</p>
            <p className="text-slate-200 text-sm">{result.feedback}</p>
          </div>

          <div className="bg-neon-purple/5 border border-neon-purple/20 rounded-lg p-3">
            <p className="text-[10px] text-purple-400 font-mono mb-1 uppercase tracking-widest">Pro Tip</p>
            <p className="text-slate-200 text-sm">{result.tip}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setResult(null)}
            className="flex-1 bg-game-card hover:bg-game-border text-white font-bold py-3 rounded-xl transition-colors text-sm"
          >
            Try Again
          </button>
          <button
            onClick={onBack}
            className="flex-1 bg-neon-cyan text-game-bg font-bold py-3 rounded-xl hover:brightness-110 transition-all shadow-neon-cyan text-sm"
          >
            Next Challenge →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 slide-up">
      <div className="circuit-corner bg-game-panel border border-game-border rounded-xl p-5">
        <h2 className="font-bold text-lg text-white mb-1">{challenge.title}</h2>
        <p className="text-slate-300 text-sm mb-3">{challenge.description}</p>
        <div className="flex gap-4 text-xs text-game-muted font-mono">
          <span className="neon-cyan">+{challenge.xp_reward} XP</span>
          <span>Budget: {challenge.token_budget} tokens</span>
        </div>
      </div>

      <div>
        <label className="text-xs text-game-muted font-mono mb-2 block uppercase tracking-widest">
          &gt; Your Prompt
        </label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit(); }}
          placeholder="Cast your spell here... (Ctrl+Enter to submit)"
          rows={7}
          className="w-full bg-game-card border border-game-border focus:border-neon-cyan focus:shadow-neon-sm rounded-xl p-4 text-white placeholder-game-muted outline-none font-mono text-sm transition-all"
        />
      </div>

      {error && (
        <div className="bg-red-950/60 border border-red-700/60 text-red-300 rounded-lg p-3 text-sm font-mono">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-5 py-3 bg-game-card hover:bg-game-border text-slate-300 rounded-xl transition-colors text-sm"
        >
          ← Back
        </button>
        <button
          onClick={submit}
          disabled={!prompt.trim() || loading}
          className="flex-1 bg-neon-cyan text-game-bg font-bold py-3 rounded-xl hover:brightness-110 transition-all shadow-neon-cyan disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none text-sm"
        >
          {loading ? '> Casting...' : '> Cast Prompt'}
        </button>
      </div>
    </div>
  );
}

export default function Solo() {
  const [challenges, setChallenges] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  useEffect(() => {
    api.getChallenges()
      .then(data => {
        setChallenges(data);
        localStorage.setItem('promtix_challenges', JSON.stringify(data));
        setLoading(false);
      })
      .catch(() => {
        const cached = localStorage.getItem('promtix_challenges');
        if (cached) setChallenges(JSON.parse(cached));
        setLoading(false);
      });
  }, []);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-[10px] font-mono text-game-muted uppercase tracking-widest mb-1">Mode</div>
            <h1 className="text-xl font-black text-white">Training Grounds</h1>
          </div>
          {offline && (
            <span className="text-yellow-400 text-xs bg-yellow-950/60 border border-yellow-800/60 px-3 py-1 rounded-lg font-mono">
              offline
            </span>
          )}
        </div>

        {active ? (
          <ActiveChallenge challenge={active} onBack={() => setActive(null)} />
        ) : loading ? (
          <div className="text-center text-game-muted py-20 font-mono">&gt; Loading challenges...</div>
        ) : challenges.length === 0 ? (
          <div className="text-center text-game-muted py-20 font-mono">
            {offline ? '> No cached data. Connect to load challenges.' : '> No challenges available yet.'}
          </div>
        ) : (
          <ChallengeList challenges={challenges} onSelect={setActive} />
        )}
      </div>
    </Layout>
  );
}
