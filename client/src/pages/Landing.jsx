import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const error = new URLSearchParams(window.location.search).get('error');

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full text-center space-y-8">

        <div className="space-y-2">
          <h1 className="text-7xl font-black tracking-tight">
            <span className="text-white">Prom</span>
            <span className="text-cyan-400">tix</span>
          </h1>
          <p className="text-slate-400 text-lg">Master the art of AI. Outprompt your rivals.</p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          {[
            { icon: '⚡', label: 'Craft Prompts' },
            { icon: '🤖', label: 'Command AI' },
            { icon: '⚔️', label: 'Defeat Rivals' }
          ].map(({ icon, label }) => (
            <div key={label} className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-300">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-xs">{label}</div>
            </div>
          ))}
        </div>

        {error === 'not_org_member' && (
          <div className="bg-red-950 border border-red-700 text-red-300 rounded-xl p-4 text-sm">
            Access is limited to Code Platoon members. Ask your instructor to add you to the org.
          </div>
        )}

        {error === 'auth_failed' && (
          <div className="bg-red-950 border border-red-700 text-red-300 rounded-xl p-4 text-sm">
            Authentication failed. Try again or contact your instructor.
          </div>
        )}

        <a
          href="/auth/github"
          className="inline-flex items-center gap-3 bg-white text-slate-900 font-bold px-8 py-4 rounded-xl hover:bg-slate-100 transition-colors text-lg w-full justify-center"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
          </svg>
          Sign in with GitHub
        </a>

        <p className="text-slate-600 text-sm">Dakota Cohort · Code Platoon members only</p>
      </div>
    </div>
  );
}
