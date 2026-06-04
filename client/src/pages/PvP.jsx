import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../utils/api.js';
import { subscribeToPlayer } from '../utils/pusher.js';

export default function PvP() {
  const { user } = useAuth();
  const [status, setStatus] = useState('idle');
  const [match, setMatch] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState(null);
  const unsubRef = useRef(null);

  useEffect(() => {
    if (!user?.id) return;

    unsubRef.current = subscribeToPlayer(user.id, {
      'pvp:match_found': (data) => { setMatch(data); setStatus('matched'); setPrompt(''); },
      'pvp:results': (data) => { setResults(data); setStatus('results'); }
    });

    return () => unsubRef.current?.();
  }, [user?.id]);

  async function joinQueue() {
    try {
      const data = await api.pvpQueue();
      if (data.status === 'matched') {
        setMatch(data);
        setStatus('matched');
      } else {
        setStatus('waiting');
      }
    } catch (err) {
      alert(err.message);
    }
  }

  async function leaveQueue() {
    await api.pvpLeave().catch(() => {});
    setStatus('idle');
  }

  async function submitPrompt() {
    if (!prompt.trim()) return;
    setStatus('submitting');
    try {
      await api.pvpSubmit(match.matchId, prompt);
    } catch (err) {
      alert(err.message);
      setStatus('matched');
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm">← Dashboard</Link>
        <h1 className="font-bold">PvP Arena</h1>
        <div className="w-20" />
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        {status === 'idle' && (
          <div className="text-center space-y-6 py-10">
            <div className="text-6xl">⚔️</div>
            <h2 className="text-2xl font-bold">Ready to battle?</h2>
            <p className="text-slate-400 max-w-sm mx-auto">
              You and a cohort member get the same challenge simultaneously. Best prompt wins.
            </p>
            <button
              onClick={joinQueue}
              className="bg-purple-500 hover:bg-purple-400 text-white font-bold px-10 py-4 rounded-xl transition-colors text-lg"
            >
              Find Opponent
            </button>
          </div>
        )}

        {status === 'waiting' && (
          <div className="text-center space-y-6 py-10">
            <div className="text-5xl animate-pulse">🔍</div>
            <h2 className="text-xl font-bold">Searching for opponent...</h2>
            <p className="text-slate-400">Waiting for another Caster to enter the Arena.</p>
            <button onClick={leaveQueue} className="text-slate-500 hover:text-white text-sm transition-colors underline">
              Leave queue
            </button>
          </div>
        )}

        {status === 'matched' && match && (
          <div className="space-y-5">
            <div className="bg-purple-950 border border-purple-700 rounded-xl p-4 text-center">
              <p className="text-purple-300 font-bold text-lg">Match Found ⚔️</p>
              <p className="text-purple-400 text-sm">Cast your best prompt before your opponent does</p>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
              <h3 className="font-bold text-lg mb-2">{match.challenge.title}</h3>
              <p className="text-slate-300 text-sm mb-3">{match.challenge.description}</p>
              <span className="text-xs text-slate-500">Budget: {match.challenge.token_budget} tokens</span>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Your Prompt</label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submitPrompt(); }}
                placeholder="Cast your spell... (Ctrl+Enter to submit)"
                rows={7}
                className="w-full bg-slate-900 border border-slate-700 focus:border-purple-500 rounded-xl p-4 text-white placeholder-slate-600 resize-none outline-none font-mono text-sm"
              />
            </div>

            <button
              onClick={submitPrompt}
              disabled={!prompt.trim()}
              className="w-full bg-purple-500 hover:bg-purple-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
            >
              Submit Prompt →
            </button>
          </div>
        )}

        {status === 'submitting' && (
          <div className="text-center space-y-4 py-20">
            <div className="text-5xl animate-pulse">⚡</div>
            <p className="text-slate-300 font-bold">Prompt submitted!</p>
            <p className="text-slate-400 text-sm">Waiting for opponent... results incoming via Pusher</p>
          </div>
        )}

        {status === 'results' && results && (
          <div className="space-y-4">
            <div className={`rounded-2xl p-6 text-center border ${results.won ? 'bg-cyan-950 border-cyan-700' : 'bg-slate-900 border-slate-700'}`}>
              <div className="text-5xl mb-2">{results.won ? '🏆' : '💀'}</div>
              <h2 className="text-2xl font-black mb-1">{results.won ? 'Victory!' : 'Defeated'}</h2>
              <p className="text-slate-400 text-sm">
                Your score: <span className="text-white font-bold">{results.yourScore}</span>
                {' · '}
                Opponent: <span className="text-white font-bold">{results.opponentScore}</span>
              </p>
              <p className="text-cyan-400 font-bold mt-2">+{results.xpEarned} XP</p>
            </div>

            <div className="bg-cyan-950 border border-cyan-800 rounded-xl p-4">
              <p className="text-xs text-cyan-400 mb-1">Feedback</p>
              <p className="text-slate-200 text-sm">{results.feedback}</p>
            </div>

            <div className="bg-purple-950 border border-purple-800 rounded-xl p-4">
              <p className="text-xs text-purple-400 mb-1">Pro Tip</p>
              <p className="text-slate-200 text-sm">{results.tip}</p>
            </div>

            <button
              onClick={() => { setStatus('idle'); setMatch(null); setResults(null); setPrompt(''); }}
              className="w-full bg-purple-500 hover:bg-purple-400 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Play Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
