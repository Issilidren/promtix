import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import Layout from '../components/Layout.jsx';
import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function Coop() {
  const { user } = useAuth();
  const [status, setStatus] = useState('idle');
  const [match, setMatch] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState(null);
  const [sharedAvailable, setSharedAvailable] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('promtix_token');
    if (!token) return;

    const socket = io(`${API_BASE}/coop`, {
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('coop:waiting',     ()     => setStatus('waiting'));
    socket.on('coop:match_found', (data) => {
      setMatch(data);
      setSharedAvailable(!!data.shared_mode_available);
      setStatus('matched');
      setPrompt('');
    });
    socket.on('coop:processing',  ()     => setStatus('processing'));
    socket.on('coop:results',     (data) => { setResults(data); setStatus('results'); });

    return () => { socket.disconnect(); };
  }, []);

  function joinQueue() {
    socketRef.current?.emit('coop:queue');
    setStatus('joining');
  }

  function leaveQueue() {
    socketRef.current?.emit('coop:leave');
    setStatus('idle');
  }

  function submitPrompt() {
    if (!prompt.trim() || !match) return;
    socketRef.current?.emit('coop:submit', { roomId: match.roomId, prompt });
    setStatus('submitted');
  }

  function reset() { setStatus('idle'); setMatch(null); setResults(null); setPrompt(''); }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-6">
          <div className="text-[10px] font-mono text-game-muted uppercase tracking-widest mb-1">Mode</div>
          <h1 className="text-xl font-black text-white">Co-op Mode</h1>
          <p className="text-game-muted text-xs font-mono mt-1">
            Same challenge, separate prompts — both players earn XP.
          </p>
        </div>

        {/* IDLE / JOINING */}
        {(status === 'idle' || status === 'joining') && (
          <div className="text-center space-y-6 py-12 slide-up">
            <div className="text-5xl">◈</div>
            <h2 className="text-2xl font-bold text-white">Learn Together</h2>
            <p className="text-slate-400 max-w-sm mx-auto text-sm">
              You and a partner tackle the same challenge. Each casts their own prompt. Both see results. Both earn XP.
            </p>
            {sharedAvailable && (
              <div className="inline-block bg-neon-purple/10 border border-neon-purple/30 text-purple-300 rounded-lg px-4 py-2 text-xs font-mono">
                ◆ Shared Prompt Mode available — coming soon
              </div>
            )}
            <button
              onClick={joinQueue}
              disabled={status === 'joining'}
              className="bg-neon-purple/80 text-white font-bold px-10 py-4 rounded-xl transition-all hover:brightness-110 text-sm disabled:opacity-50"
              style={{ boxShadow: '0 0 15px rgba(124,58,237,0.3)' }}
            >
              {status === 'joining' ? '> Connecting...' : '> Find Co-op Partner →'}
            </button>
          </div>
        )}

        {/* WAITING */}
        {status === 'waiting' && (
          <div className="text-center space-y-6 py-12 slide-up">
            <div className="text-4xl animate-pulse text-purple-400">◈</div>
            <h2 className="text-lg font-bold text-white">Searching for a partner...</h2>
            <p className="text-game-muted text-sm font-mono">&gt; Waiting for another Caster to co-op.</p>
            <button onClick={leaveQueue} className="text-game-muted hover:text-slate-400 text-xs font-mono underline">
              leave queue
            </button>
          </div>
        )}

        {/* MATCHED */}
        {status === 'matched' && match && (
          <div className="space-y-4 slide-up">
            <div className="bg-neon-purple/5 border border-neon-purple/30 rounded-xl p-4 text-center">
              <p className="text-purple-300 font-bold">Partner Found ◈</p>
              <p className="text-slate-400 text-sm mt-1">
                Submit your own take on the challenge. You'll both see each other's results.
              </p>
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
                placeholder="Cast your approach... (Ctrl+Enter to submit)"
                rows={7}
                className="w-full bg-game-card border border-game-border focus:border-purple-500 outline-none rounded-xl p-4 text-white placeholder-game-muted font-mono text-sm transition-colors"
              />
            </div>

            <button
              onClick={submitPrompt}
              disabled={!prompt.trim()}
              className="w-full text-white font-bold py-3 rounded-xl transition-all text-sm disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #e040fb)', boxShadow: '0 0 15px rgba(124,58,237,0.3)' }}
            >
              Submit Prompt →
            </button>
          </div>
        )}

        {/* SUBMITTED / PROCESSING */}
        {(status === 'submitted' || status === 'processing') && (
          <div className="text-center space-y-4 py-20">
            <div className="text-4xl text-purple-400 animate-pulse">◈</div>
            <p className="text-white font-bold">Prompt submitted!</p>
            <p className="text-game-muted text-sm font-mono">&gt; Waiting for partner's submission...</p>
          </div>
        )}

        {/* RESULTS */}
        {status === 'results' && results && (
          <div className="space-y-4 slide-up">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-neon-cyan/5 border border-neon-cyan/30 rounded-xl p-4 text-center">
                <div className="text-[10px] neon-cyan font-mono mb-2 uppercase tracking-widest">You</div>
                <div className="text-4xl font-black neon-cyan">{results.yourScore}</div>
                <div className="text-xs text-green-400 font-mono mt-1">+{results.xpEarned} XP</div>
              </div>
              <div className="bg-game-panel border border-game-border rounded-xl p-4 text-center">
                <div className="text-[10px] text-slate-400 font-mono mb-2 uppercase tracking-widest">Partner</div>
                <div className="text-4xl font-black text-slate-300">{results.partnerScore}</div>
                <div className="text-xs text-game-muted font-mono mt-1">+{results.partnerXp ?? results.xpEarned} XP</div>
              </div>
            </div>

            {results.partnerPrompt && (
              <div className="bg-game-panel border border-game-border rounded-lg p-4">
                <p className="text-[10px] text-game-muted font-mono mb-2 uppercase tracking-widest">Partner's Prompt</p>
                <p className="text-slate-300 text-sm font-mono leading-relaxed">{results.partnerPrompt}</p>
              </div>
            )}

            {results.feedback && (
              <div className="bg-neon-cyan/5 border border-neon-cyan/20 rounded-lg p-3">
                <p className="text-[10px] neon-cyan font-mono mb-1 uppercase tracking-widest">Feedback</p>
                <p className="text-slate-200 text-sm">{results.feedback}</p>
              </div>
            )}

            <button
              onClick={reset}
              className="w-full text-white font-bold py-3 rounded-xl transition-all text-sm"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #e040fb)', boxShadow: '0 0 15px rgba(124,58,237,0.3)' }}
            >
              Play Again →
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
