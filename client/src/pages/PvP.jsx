import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../utils/api.js';
import { subscribeToPlayer } from '../utils/pusher.js';
import Layout from '../components/Layout.jsx';

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
      'pvp:results': (data) => { setResults(data); setStatus('results'); },
    });
    return () => unsubRef.current?.();
  }, [user?.id]);

  async function joinQueue() {
    try {
      const data = await api.pvpQueue();
      if (data.status === 'matched') { setMatch(data); setStatus('matched'); }
      else setStatus('waiting');
    } catch (err) { alert(err.message); }
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

  function reset() { setStatus('idle'); setMatch(null); setResults(null); setPrompt(''); }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-6">
          <div className="text-[10px] font-mono text-game-muted uppercase tracking-widest mb-1">Mode</div>
          <h1 className="text-xl font-black text-white">PvP Arena</h1>
        </div>

        {/* IDLE */}
        {status === 'idle' && (
          <div className="text-center space-y-6 py-12 slide-up">
            <div className="text-5xl">⚔</div>
            <h2 className="text-2xl font-bold text-white">Ready to battle?</h2>
            <p className="text-slate-400 max-w-sm mx-auto text-sm">
              You and a cohort member get the same challenge simultaneously. Best prompt wins.
            </p>
            <button
              onClick={joinQueue}
              className="bg-neon-pink text-white font-bold px-10 py-4 rounded-xl transition-all hover:brightness-110 shadow-neon-pink text-sm"
            >
              Find Opponent →
            </button>
          </div>
        )}

        {/* WAITING */}
        {status === 'waiting' && (
          <div className="text-center space-y-6 py-12 slide-up">
            <div className="text-4xl animate-pulse">◈</div>
            <h2 className="text-lg font-bold text-white">Scanning for opponents...</h2>
            <p className="text-game-muted text-sm font-mono">
              &gt; Waiting for another Caster to enter the Arena.
            </p>
            <button
              onClick={leaveQueue}
              className="text-game-muted hover:text-slate-400 text-xs font-mono transition-colors underline"
            >
              leave queue
            </button>
          </div>
        )}

        {/* MATCHED */}
        {status === 'matched' && match && (
          <div className="space-y-4 slide-up">
            <div className="bg-neon-pink/5 border border-neon-pink/30 rounded-xl p-4 text-center">
              <p className="neon-pink font-bold">Match Found ⚔</p>
              <p className="text-slate-400 text-sm mt-1">Cast your best prompt before your opponent does</p>
            </div>

            <div className="circuit-corner bg-game-panel border border-game-border rounded-xl p-5">
              <h3 className="font-bold text-lg text-white mb-1">{match.challenge.title}</h3>
              <p className="text-slate-300 text-sm mb-3">{match.challenge.description}</p>
              <span className="text-xs text-game-muted font-mono">Budget: {match.challenge.token_budget} tokens</span>
            </div>

            <div>
              <label className="text-xs text-game-muted font-mono mb-2 block uppercase tracking-widest">
                &gt; Your Prompt
              </label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submitPrompt(); }}
                placeholder="Cast your spell... (Ctrl+Enter to submit)"
                rows={7}
                className="w-full bg-game-card border border-game-border focus:border-neon-pink outline-none rounded-xl p-4 text-white placeholder-game-muted font-mono text-sm transition-colors"
              />
            </div>

            <button
              onClick={submitPrompt}
              disabled={!prompt.trim()}
              className="w-full bg-neon-pink text-white font-bold py-3 rounded-xl hover:brightness-110 transition-all shadow-neon-pink disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none text-sm"
            >
              Submit Prompt →
            </button>
          </div>
        )}

        {/* SUBMITTING */}
        {status === 'submitting' && (
          <div className="text-center space-y-4 py-20">
            <div className="text-4xl neon-pink animate-pulse">⚡</div>
            <p className="text-white font-bold">Prompt submitted!</p>
            <p className="text-game-muted text-sm font-mono">&gt; Waiting for opponent...</p>
          </div>
        )}

        {/* RESULTS */}
        {status === 'results' && results && (
          <div className="space-y-4 slide-up">
            <div className={`rounded-xl p-6 text-center border ${
              results.won
                ? 'bg-neon-cyan/5 border-neon-cyan/30'
                : 'bg-game-panel border-game-border'
            }`}>
              <div className="text-5xl mb-2">{results.won ? '◆' : '○'}</div>
              <h2 className={`text-2xl font-black mb-1 ${results.won ? 'neon-cyan' : 'text-slate-400'}`}>
                {results.won ? 'Victory!' : 'Defeated'}
              </h2>
              <p className="text-slate-400 text-sm">
                You: <span className="text-white font-bold">{results.yourScore}</span>
                {' · '}
                Opponent: <span className="text-white font-bold">{results.opponentScore}</span>
              </p>
              <p className="neon-cyan font-bold mt-2">+{results.xpEarned} XP</p>
            </div>

            <div className="bg-neon-cyan/5 border border-neon-cyan/20 rounded-lg p-3">
              <p className="text-[10px] neon-cyan font-mono mb-1 uppercase tracking-widest">Feedback</p>
              <p className="text-slate-200 text-sm">{results.feedback}</p>
            </div>

            <div className="bg-neon-purple/5 border border-neon-purple/20 rounded-lg p-3">
              <p className="text-[10px] text-purple-400 font-mono mb-1 uppercase tracking-widest">Pro Tip</p>
              <p className="text-slate-200 text-sm">{results.tip}</p>
            </div>

            <button
              onClick={reset}
              className="w-full bg-neon-pink text-white font-bold py-3 rounded-xl hover:brightness-110 transition-all shadow-neon-pink text-sm"
            >
              Play Again →
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
