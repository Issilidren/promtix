import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api.js';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Leaderboard() {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLeaderboard()
      .then(data => { setPlayers(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm">← Dashboard</Link>
        <h1 className="font-bold">Leaderboard</h1>
        <div className="w-20" />
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <p className="text-slate-500 text-xs font-mono mb-4">DAKOTA COHORT · CODE PLATOON</p>

        {loading ? (
          <div className="text-center text-slate-400 py-20">Loading...</div>
        ) : players.length === 0 ? (
          <div className="text-center text-slate-400 py-20">
            No players yet. Be the first to cast a prompt.
          </div>
        ) : (
          <div className="space-y-2">
            {players.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center gap-4 rounded-xl px-5 py-4 border ${
                  p.username === user?.username
                    ? 'bg-cyan-950 border-cyan-600'
                    : 'bg-slate-900 border-slate-700'
                }`}
              >
                <div className="w-8 text-center text-lg shrink-0">
                  {medals[i] ?? <span className="text-slate-500 text-sm font-mono">#{i + 1}</span>}
                </div>
                <img src={p.avatar_url} className="w-9 h-9 rounded-full shrink-0" alt={p.username} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">
                    {p.username}
                    {p.username === user?.username && <span className="text-cyan-400 ml-1 text-xs">(you)</span>}
                  </p>
                  <p className="text-slate-500 text-xs">Level {p.level}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-cyan-400 font-mono font-bold">{p.xp} XP</p>
                  <p className="text-slate-500 text-xs">{p.wins}W · {p.losses}L</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
