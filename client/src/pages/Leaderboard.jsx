import { useState, useEffect } from 'react';
import { api } from '../utils/api.js';
import { useAuth } from '../hooks/useAuth.jsx';
import Layout from '../components/Layout.jsx';

const MEDALS = ['◆', '◈', '⋄'];

export default function Leaderboard() {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLeaderboard()
      .then(data => { setPlayers(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-6">
          <div className="text-[10px] font-mono text-game-muted uppercase tracking-widest mb-1">Rankings</div>
          <h1 className="text-xl font-black text-white">Leaderboard</h1>
          <p className="text-game-muted text-xs font-mono mt-1">Dakota Cohort · Code Platoon</p>
        </div>

        {loading ? (
          <div className="text-center text-game-muted py-20 font-mono">&gt; Loading rankings...</div>
        ) : players.length === 0 ? (
          <div className="text-center text-game-muted py-20 font-mono">
            &gt; No players yet. Be the first to cast a prompt.
          </div>
        ) : (
          <div className="space-y-2">
            {players.map((p, i) => {
              const isMe = p.username === user?.username;
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-4 rounded-xl px-5 py-4 border transition-all ${
                    isMe
                      ? 'bg-neon-cyan/5 border-neon-cyan/30'
                      : 'bg-game-panel border-game-border'
                  }`}
                >
                  <div className={`w-7 text-center shrink-0 ${i < 3 ? 'neon-cyan' : 'text-game-muted'}`}>
                    {i < 3 ? MEDALS[i] : <span className="text-xs font-mono">#{i + 1}</span>}
                  </div>
                  <img src={p.avatar_url} className="w-9 h-9 rounded-full shrink-0 border border-game-border" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate text-white">
                      {p.username}
                      {isMe && <span className="neon-cyan ml-1 text-[10px] font-mono">(you)</span>}
                    </p>
                    <p className="text-game-muted text-xs font-mono">Level {p.level}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="neon-cyan font-mono font-bold text-sm">{p.xp} XP</p>
                    <p className="text-game-muted text-xs font-mono">{p.wins}W · {p.losses}L</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
