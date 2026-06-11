import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../utils/api.js';

const NAV = [
  { path: '/dashboard',   icon: '⌂',  label: 'Home'     },
  { path: '/solo',        icon: '⚡', label: 'Training' },
  { path: '/pvp',         icon: '⚔',  label: 'Arena'    },
  { path: '/coop',        icon: '◈',  label: 'Co-op'    },
  { path: '/leaderboard', icon: '◆',  label: 'Board'    },
  { path: '/shop',        icon: '⋄',  label: 'Shop'     },
];

function EventCard({ event }) {
  const msLeft = new Date(event.ends_at) - Date.now();
  const hLeft  = Math.max(0, Math.floor(msLeft / 3600000));
  const mLeft  = Math.max(0, Math.floor((msLeft % 3600000) / 60000));
  return (
    <div className="bg-game-card border border-game-border rounded-lg p-2.5 space-y-1.5">
      <div className="flex items-start justify-between gap-1">
        <span className="text-white text-[11px] font-bold leading-tight">{event.name}</span>
        <span className="text-neon-cyan text-[9px] font-mono shrink-0">{hLeft}h {mLeft}m</span>
      </div>
      <div className="h-1 bg-game-border rounded-full overflow-hidden">
        <div className="h-full bar-pink w-2/3 rounded-full" />
      </div>
    </div>
  );
}

export default function Layout({ children, gold, characterName }) {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.getWorldEvents().then(setEvents).catch(() => {});
  }, []);

  return (
    <div className="flex h-screen bg-game-bg text-white overflow-hidden">

      {/* ── Left Sidebar — 14% ─────────────────────────────────────── */}
      <aside className="w-14 md:w-[14%] md:min-w-[10rem] md:max-w-[13rem] bg-game-panel border-r border-game-border flex flex-col shrink-0">

        {/* Logo */}
        <div className="px-3 md:px-4 py-4 border-b border-game-border">
          <div className="text-lg md:text-xl font-black tracking-wider flicker">
            <span className="text-white">Prom</span>
            <span className="neon-cyan">tix</span>
          </div>
          <div className="hidden md:block text-[10px] text-game-muted font-mono mt-0.5">
            &lt;/&gt; prompt engine
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 px-1.5 md:px-2 space-y-0.5 overflow-y-auto">
          {NAV.map(({ path, icon, label }) => {
            const active = loc.pathname === path;
            return (
              <Link key={path} to={path}
                className={`flex items-center gap-3 px-2 md:px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 shadow-neon-sm'
                    : 'text-slate-400 hover:bg-game-card hover:text-white border border-transparent'
                }`}
              >
                <span className={`text-base w-5 text-center shrink-0 ${active ? 'neon-cyan' : ''}`}>
                  {icon}
                </span>
                <span className="hidden md:block">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Player footer */}
        <div className="border-t border-game-border p-2 md:p-3 space-y-2">
          {gold != null && (
            <div className="hidden md:flex items-center gap-1.5 text-yellow-400 text-xs font-mono">
              <span>◈</span>
              <span className="neon-gold">{gold}g</span>
            </div>
          )}
          {user && (
            <div className="flex items-center gap-2 min-w-0">
              <img src={user.avatar_url} alt=""
                className="w-7 h-7 rounded-full border border-neon-cyan/30 shrink-0" />
              <span className="hidden md:block text-slate-400 text-xs truncate">
                {characterName || user.username}
              </span>
            </div>
          )}
          <button onClick={logout}
            className="hidden md:block text-game-muted hover:text-slate-400 text-xs transition-colors font-mono">
            logout
          </button>
        </div>
      </aside>

      {/* ── Center content — 72% ───────────────────────────────────── */}
      <div className="flex-1 overflow-auto min-w-0">
        {children}
      </div>

      {/* ── Right Rail — 14% ───────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-[14%] min-w-[10rem] max-w-[13rem] shrink-0 bg-game-panel border-l border-game-border overflow-hidden">

        {/* World Events Rail (top ~58% per spec) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          <div className="text-[9px] font-mono text-game-muted uppercase tracking-widest pt-1 pb-0.5">
            World Events
          </div>
          {events.length === 0 ? (
            <p className="text-game-muted text-[10px] font-mono leading-relaxed">
              &gt; No active events
            </p>
          ) : (
            events.map(e => <EventCard key={e.id} event={e} />)
          )}

          {/* Sys message */}
          <div className="mt-4 bg-game-card border border-game-border rounded-lg p-2.5">
            <div className="text-[9px] font-mono neon-cyan mb-1 uppercase tracking-widest">
              sys.msg
            </div>
            <p className="text-slate-600 text-[10px] leading-relaxed font-mono">
              &gt; Every prompt you cast teaches you something.
            </p>
          </div>
        </div>

        {/* Quick Rail (bottom ~23% per spec) */}
        <div className="border-t border-game-border p-3 space-y-1">
          <div className="text-[9px] font-mono text-game-muted uppercase tracking-widest mb-1.5">
            Quick Rail
          </div>
          {NAV.slice(1).map(({ path, icon, label }) => {
            const active = loc.pathname === path;
            return (
              <Link key={path} to={path}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-mono transition-all ${
                  active
                    ? 'text-neon-cyan bg-neon-cyan/10'
                    : 'text-slate-600 hover:text-neon-cyan hover:bg-game-card'
                }`}
              >
                <span className="text-xs w-4 text-center">{icon}</span>
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </aside>

    </div>
  );
}
