import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  '> credential received     ...',
  '> decrypting token        ...',
  '> validating identity     ...',
  '> LOCK STATUS: VERIFYING  ...',
];

export default function AuthCallback() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setStep(i);
      if (i >= STEPS.length) {
        clearInterval(interval);
        setGranted(true);
        setTimeout(() => navigate('/lobby'), 900);
      }
    }, 320);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-game-bg flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6 slide-up">

        <div className="text-center">
          <div className="text-[10px] font-mono text-neon-pink tracking-[0.3em] uppercase mb-2">
            ◈ Lock-Pick Protocol ◈
          </div>
          <h1 className="text-3xl font-black flicker">
            <span className="text-white">Prom</span>
            <span className="neon-pink">tix</span>
          </h1>
        </div>

        <div
          className="rounded-xl border border-neon-pink/20 bg-game-panel p-5 font-mono text-xs space-y-1.5"
          style={{ boxShadow: '0 0 20px rgba(224,64,251,0.08)' }}
        >
          {STEPS.slice(0, step).map((line, i) => (
            <div
              key={i}
              className={line.includes('VERIFYING') ? 'text-yellow-400' : 'text-slate-500'}
            >
              {line}
            </div>
          ))}
          {!granted && step < STEPS.length && (
            <div className="text-slate-600 animate-pulse">█</div>
          )}
          {granted && (
            <div className="neon-pink font-bold animate-glow">
              &gt; ACCESS GRANTED ◈
            </div>
          )}
        </div>

        {granted && (
          <div className="text-center text-[11px] font-mono text-game-muted animate-pulse">
            &gt; Redirecting to grid...
          </div>
        )}
      </div>
    </div>
  );
}
