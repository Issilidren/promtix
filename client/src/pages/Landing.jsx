import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const error = new URLSearchParams(window.location.search).get('error');

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-game-bg flex flex-col items-center justify-center p-6 overflow-hidden relative">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#00e5ff 1px, transparent 1px), linear-gradient(90deg, #00e5ff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-md text-center space-y-10 slide-up">

        {/* Logo */}
        <div className="space-y-3">
          <div className="inline-block circuit-corner px-6 py-2">
            <h1 className="text-7xl font-black tracking-tight flicker">
              <span className="text-white">Prom</span>
              <span className="neon-cyan">tix</span>
            </h1>
          </div>
          <div className="text-[10px] font-mono text-neon-cyan tracking-widest uppercase">
            &lt;/&gt; &nbsp; prompt engine &nbsp; &lt;/&gt;
          </div>
          <p className="text-slate-400 text-base">
            Master the art of AI. Outprompt your rivals.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          {[
            { icon: '⚡', label: 'Craft Prompts',  color: 'neon-cyan'    },
            { icon: '🤖', label: 'Command AI',     color: 'text-slate-300' },
            { icon: '⚔',  label: 'Defeat Rivals', color: 'neon-pink'    },
          ].map(({ icon, label, color }) => (
            <div
              key={label}
              className="bg-game-panel border border-game-border rounded-xl p-3 space-y-1"
            >
              <div className="text-2xl">{icon}</div>
              <div className={`text-[11px] font-mono ${color}`}>{label}</div>
            </div>
          ))}
        </div>

        {/* Errors */}
        {error === 'not_org_member' && (
          <div className="bg-red-950/60 border border-red-700/60 text-red-300 rounded-lg p-3 text-sm font-mono">
            &gt; Access denied — Code Platoon members only.
          </div>
        )}
        {error === 'auth_failed' && (
          <div className="bg-red-950/60 border border-red-700/60 text-red-300 rounded-lg p-3 text-sm font-mono">
            &gt; Authentication failed. Try again.
          </div>
        )}

        {/* GitHub login */}
        <a
          href={`${API_BASE}/auth/github`}
          className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-white text-game-bg font-bold text-base hover:brightness-95 transition-all shadow-neon-cyan"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
          </svg>
          Sign in with GitHub
        </a>

        <p className="text-game-muted text-xs font-mono">
          Dakota Cohort · Code Platoon members only
        </p>
      </div>
    </div>
  );
}
