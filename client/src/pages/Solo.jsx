import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api.js';

const DIFFICULTY = ['', 'Novice', 'Apprentice', 'Adept', 'Master'];
const DIFFICULTY_COLOR = ['', 'text-green-400', 'text-yellow-400', 'text-orange-400', 'text-red-400'];

function ChallengeList({ challenges, onSelect }) {
  return (
    <div className="space-y-3">
      {challenges.map(c => (
        <button
          key={c.id}
          onClick={() => onSelect(c)}
          className="w-full bg-slate-900 border border-slate-700 hover:border-cyan-500 rounded-xl p-5 text-left transition-all hover:bg-slate-800"
        >
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-bold">{c.title}</h3>
            <span className={`text-xs font-mono ml-2 shrink-0 ${DIFFICULTY_COLOR[c.difficulty]}`}>
              {DIFFICULTY[c.difficulty]}
            </span>
          </div>
          <p className="text-slate-400 text-sm mb-3">{c.description}</p>
          <div className="flex gap-4 text-xs text-slate-500">
            <span className="text-cyan-400 font-mono">+{c.xp_reward} XP</span>
            <span>{c.token_budget} token budget</span>
            <span className="text-slate-600 capitalize">{c.category}</span>
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
      <div className="space-y-4">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-5xl font-black text-cyan-400">{result.score}</div>
              <div className="text-slate-400 text-sm">/ 100</div>
            </div>
            <div className="flex-1">
              <div className="text-green-400 font-bold">+{result.xpEarned} XP</div>
              <div className="text-slate-500 text-xs">{result.tokensUsed} tokens used</div>
            </div>
            <div className="h-16 w-16">
              <svg viewBox="0 0 36 36" className="rotate-[-90deg]">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke={result.score >= 80 ? '#22d3ee' : result.score >= 50 ? '#a78bfa' : '#f87171'}
                  strokeWidth="3"
                  strokeDasharray={`${result.score} 100`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-2">AI Response</p>
            <p className="text-slate-200 text-sm leading-relaxed">{result.aiResponse}</p>
          </div>

          <div className="bg-cyan-950 border border-cyan-800 rounded-xl p-4">
            <p className="text-xs text-cyan-400 mb-1">Feedback</p>
            <p className="text-slate-200 text-sm">{result.feedback}</p>
          </div>

          <div className="bg-purple-950 border border-purple-800 rounded-xl p-4">
            <p className="text-xs text-purple-400 mb-1">Pro Tip</p>
            <p className="text-slate-200 text-sm">{result.tip}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setResult(null)}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={onBack}
            className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-xl transition-colors"
          >
            Next Challenge
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
        <h2 className="font-bold text-lg mb-1">{challenge.title}</h2>
        <p className="text-slate-300 text-sm mb-3">{challenge.description}</p>
        <div className="flex gap-4 text-xs text-slate-500">
          <span className="text-cyan-400">+{challenge.xp_reward} XP</span>
          <span>Budget: {challenge.token_budget} tokens</span>
        </div>
      </div>

      <div>
        <label className="text-sm text-slate-400 mb-2 block">Your Prompt</label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit(); }}
          placeholder="Cast your spell here... (Ctrl+Enter to submit)"
          rows={7}
          className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl p-4 text-white placeholder-slate-600 resize-none outline-none font-mono text-sm transition-colors"
        />
      </div>

      {error && (
        <div className="bg-red-950 border border-red-700 text-red-300 rounded-xl p-3 text-sm">{error}</div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors">
          Back
        </button>
        <button
          onClick={submit}
          disabled={!prompt.trim() || loading}
          className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold py-3 rounded-xl transition-colors"
        >
          {loading ? 'Casting...' : 'Cast Prompt →'}
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
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">← Dashboard</Link>
        <h1 className="font-bold">Training Grounds</h1>
        {offline && (
          <span className="text-yellow-400 text-xs bg-yellow-950 border border-yellow-800 px-2 py-1 rounded-lg">
            Offline
          </span>
        )}
        {!offline && <div className="w-16" />}
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        {active ? (
          <ActiveChallenge challenge={active} onBack={() => setActive(null)} />
        ) : loading ? (
          <div className="text-center text-slate-400 py-20">Loading challenges...</div>
        ) : challenges.length === 0 ? (
          <div className="text-center text-slate-400 py-20">
            {offline ? 'No cached challenges. Connect to load them.' : 'No challenges available yet.'}
          </div>
        ) : (
          <ChallengeList challenges={challenges} onSelect={setActive} />
        )}
      </main>
    </div>
  );
}
