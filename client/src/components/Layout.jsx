import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

const NAV = [
  { path: '/dashboard',  icon: '⌂',  label: 'Home'       },
  { path: '/solo',       icon: '⚡', label: 'Training'   },
  { path: '/pvp',        icon: '⚔',  label: 'Arena'      },
  { path: '/coop',       icon: '◈',  label: 'Co-op'      },
  { path: '/leaderboard',icon: '◆',  label: 'Board'      },
  { path: '/shop',       icon: '⋄',  label: 'Shop'       },
];

export default function Layout({ children, gold, characterName }) {
  const { user, logout } = useAuth();
  const loc = useLocation();

  return (
    <div className="flex h-screen bg-game-bg text-white overflow-hidden">
      {/* ── Left sidebar ───────────────────────────────────────────── */}
      <aside className="w-16 md:w-52 bg-game-panel border-r border-game-border flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-3 md:px-4 py-4 border-b border-game-border">
          <div className="text-lg md:text-xl font-black tracking-wider flicker">
            <span className="text-white">Prom</span>
            <span className="neon-cyan">tix</span>
          </div>
          <div className="hidden md:block text-[10px] text-game-muted font-mono mt-0.5">&lt;/&gt; prompt engine</div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV.map(({ path, icon, label }) => {
            const active = loc.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-2 md:px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 shadow-neon-sm'
                    : 'text-slate-400 hover:bg-game-card hover:text-white border border-transparent'
                }`}
              >
                <span className={`text-base w-5 text-center shrink-0 ${active ? 'neon-cyan' : ''}`}>{icon}</span>
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
              <img
                src={user.avatar_url}
                alt=""
                className="w-7 h-7 rounded-full border border-neon-cyan/30 shrink-0"
              />
              <span className="hidden md:block text-slate-400 text-xs truncate">
                {characterName || user.username}
              </span>
            </div>
          )}
          <button
            onClick={logout}
            className="hidden md:block text-game-muted hover:text-slate-400 text-xs transition-colors font-mono"
          >
            logout
          </button>
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto min-w-0">
        {children}
      </div>
    </div>
  );
}
