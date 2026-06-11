import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

const API_BASE = import.meta.env.VITE_API_URL || '';

const BOOT_LINES = [
  '> sys.init()          ...',
  '> loading modules     ...',
  '> verifying identity  ...',
  '> LOCK STATUS: RESTRICTED',
  '> tools detected: [lockpick, keycard, social_engineering]',
  '> awaiting operator credentials',
];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const error = new URLSearchParams(window.location.search).get('error');
  const [bootStep, setBootStep] = useState(0);

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  // Boot sequence — reveal lines one by one
  useEffect(() => {
    if (bootStep >= BOOT_LINES.length) return;
    const t = setTimeout(() => setBootStep(s => s + 1), bootStep === 0 ? 200 : 380);
    return () => clearTimeout(t);
  }, [bootStep]);

  return (
    <div className="min-h-screen bg-game-bg text-white flex flex-col items-center justify-center p-6 overflow-hidden relative">

      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#e040fb 1px, transparent 1px), linear-gradient(90deg, #e040fb 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Purple radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(224,64,251,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-md space-y-8 slide-up">

        {/* Lock-Pick Protocol header */}
        <div className="text-center space-y-1">
          <div className="text-[10px] font-mono text-neon-pink tracking-[0.3em] uppercase mb-3">
            ◈ Lock-Pick Protocol ◈
          </div>
          <h1 className="text-6xl font-black tracking-tight flicker">
            <span className="text-white">Prom</span>
            <span className="neon-pink">tix</span>
          </h1>
          <div className="text-[10px] font-mono text-game-muted tracking-widest mt-1">
            &lt;/&gt; &nbsp; prompt engine &nbsp; &lt;/&gt;
          </div>
        </div>

        {/* Terminal boot log */}
        <div
          className="rounded-xl border border-neon-pink/20 bg-game-panel p-4 font-mono text-xs space-y-1 min-h-[120px]"
          style={{ boxShadow: '0 0 20px rgba(224,64,251,0.08)' }}
        >
          {BOOT_LINES.slice(0, bootStep).map((line, i) => (
            <div
              key={i}
              className={`leading-relaxed ${
                line.includes('RESTRICTED')
                  ? 'text-red-400'
                  : line.includes('awaiting')
                  ? 'neon-pink'
                  : 'text-slate-500'
              }`}
            >
              {line}
            </div>
          ))}
          {bootStep < BOOT_LINES.length && (
            <div className="text-slate-600 animate-pulse">█</div>
          )}
          {bootStep >= BOOT_LINES.length && (
            <div className="neon-pink animate-pulse">
              &gt; awaiting credentials_
            </div>
          )}
        </div>

        {/* Stats row — like the class card panels */}
        <div className="grid grid-cols-3 gap-3 text-xs font-mono">
          {[
            { label: 'TARGET',     value: 'Secure Door'     },
            { label: 'DIFFICULTY', value: '★★★☆☆'          },
            { label: 'ACCESS',     value: 'RESTRICTED'      },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-game-panel border border-neon-pink/15 rounded-lg p-3 text-center"
            >
              <div className="text-[9px] text-game-muted uppercase tracking-widest mb-1">{label}</div>
              <div className={`text-[11px] font-bold ${value === 'RESTRICTED' ? 'text-red-400' : 'neon-pink'}`}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Error states */}
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

        {/* GitHub login — the "lock pick" */}
        <a
          href={`${API_BASE}/auth/github`}
          className="group flex items-center justify-center gap-3 w-full py-4 rounded-xl font-bold text-sm transition-all duration-200 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #3a0060, #1a0030)',
            border: '1px solid rgba(224,64,251,0.4)',
            boxShadow: '0 0 20px rgba(224,64,251,0.15)',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(224,64,251,0.35)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(224,64,251,0.15)'; }}
        >
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
          </svg>
          <span className="neon-pink font-mono tracking-widest text-xs uppercase">
            &gt; Initiate GitHub Auth
          </span>
        </a>

        <p className="text-center text-game-muted text-[11px] font-mono">
          Dakota Cohort · Code Platoon members only
        </p>
      </div>
    </div>
  );
}
