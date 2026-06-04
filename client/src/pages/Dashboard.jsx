import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../utils/api.js';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [playerData, setPlayerData] = useState(null);

  useEffect(() => {
    api.getMe().then(setPlayerData).catch(console.error);
  }, []);

  const xpToNext = playerData ? Math.ceil(Math.pow(playerData.level, 2) * 100) : 100;
  const xpProgress = playerData ? Math.min(100, Math.floor((playerData.xp / xpToNext) * 100)) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-black">
          <span className="text-white">Prom</span>
          <span className="text-cyan-400">tix</span>
        </h1>
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3">
              <img src={user.avatar_url} alt={user.username} className="w-8 h-8 rounded-full border-2 border-cyan-400" />
              <span className="text-slate-300 text-sm hidden sm:block">{user.username}</span>
            </div>
          )}
          <button onClick={logout} className="text-slate-500 hover:text-white text-sm transition-colors">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {playerData && (
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <img src={user?.avatar_url} className="w-14 h-14 rounded-full border-2 border-cyan-400" alt={user?.username} />
              <div>
                <h2 className="text-xl font-bold">{user?.username}</h2>
                <p className="text-cyan-400 font-mono text-sm">Level {playerData.level} Caster</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-2xl font-black text-cyan-400">{playerData.xp} XP</p>
                <p className="text-slate-500 text-xs">{playerData.wins}W · {playerData.losses}L</p>
              </div>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-700"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <p className="text-slate-600 text-xs mt-1">{playerData.xp} / {xpToNext} XP to level {playerData.level + 1}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/solo"
            className="bg-slate-900 border border-slate-700 hover:border-cyan-500 rounded-2xl p-6 transition-all hover:bg-slate-800 group"
          >
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-bold text-lg mb-1 group-hover:text-cyan-400 transition-colors">Training Grounds</h3>
            <p className="text-slate-400 text-sm">Solo challenges. Learn the craft at your own pace. Works offline.</p>
          </Link>

          <Link
            to="/pvp"
            className="bg-slate-900 border border-slate-700 hover:border-purple-500 rounded-2xl p-6 transition-all hover:bg-slate-800 group"
          >
            <div className="text-3xl mb-3">⚔️</div>
            <h3 className="font-bold text-lg mb-1 group-hover:text-purple-400 transition-colors">PvP Arena</h3>
            <p className="text-slate-400 text-sm">Challenge cohort members. Same challenge, best prompt wins.</p>
          </Link>

          <Link
            to="/leaderboard"
            className="bg-slate-900 border border-slate-700 hover:border-yellow-500 rounded-2xl p-6 transition-all hover:bg-slate-800 group"
          >
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="font-bold text-lg mb-1 group-hover:text-yellow-400 transition-colors">Leaderboard</h3>
            <p className="text-slate-400 text-sm">Where does the Dakota Cohort stand?</p>
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5">
          <p className="text-slate-500 text-xs font-mono mb-1">SYSTEM MESSAGE</p>
          <p className="text-slate-300 text-sm">
            Welcome to Promtix. Start in Training Grounds to learn the basics, then step into the Arena when you're ready. Every prompt you cast teaches you something — even the bad ones.
          </p>
        </div>
      </main>
    </div>
  );
}
