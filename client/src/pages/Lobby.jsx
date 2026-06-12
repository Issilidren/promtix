import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api.js';

const CLASS_ICON = {
  'Fighter 1': '⚔',
  'Wizard 1':  '✦',
  'Oracle 1':  '◎',
  'Rogue 1':   '◈',
  'Druid 1':   '❈',
  'Cleric 1':  '⊕',
  'Ranger 1':  '⟁',
};

export default function Lobby() {
  const navigate = useNavigate();
  const [player, setPlayer]   = useState(null);
  const [char,   setChar]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getMe(), api.getWorld()])
      .then(([me, world]) => {
        setPlayer(me);
        setChar(world?.character ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-game-bg flex items-center justify-center">
        <div className="neon-cyan text-sm font-mono animate-pulse">&gt; sys.loading...</div>
      </div>
    );
  }

  const hasCharacter = player?.character_set && char;

  return (
    <div className="min-h-screen bg-game-bg text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#00e5ff 1px, transparent 1px), linear-gradient(90deg, #00e5ff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(0,229,255,0.05) 0%, transparent 70%)' }}
      />

      <div className="relative w-full max-w-md space-y-8 slide-up">

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="text-[10px] font-mono text-neon-cyan tracking-[0.3em] uppercase mb-3">
            ◈ Operator Ready ◈
          </div>
          <h1 className="text-5xl font-black tracking-tight flicker">
            <span className="text-white">Prom</span>
            <span className="neon-cyan">tix</span>
          </h1>
          <div className="text-[10px] font-mono text-game-muted tracking-widest mt-1">
            &lt;/&gt; &nbsp; prompt engine &nbsp; &lt;/&gt;
          </div>
        </div>

        {hasCharacter ? (
          /* ── Existing character ── */
          <div className="space-y-4">
            <div
              className="rounded-xl border border-neon-cyan/20 bg-game-panel p-5 space-y-3"
              style={{ boxShadow: '0 0 24px rgba(0,229,255,0.08)' }}
            >
              <div className="text-[10px] font-mono text-game-muted uppercase tracking-widest">
                Operator on file
              </div>
              <div className="flex items-center gap-4">
                <div className="text-4xl">{CLASS_ICON[char.pf_class] ?? '◈'}</div>
                <div>
                  <div className="text-lg font-black text-white">{char.name}</div>
                  <div className="text-xs font-mono neon-cyan">{char.pf_class}</div>
                  <div className="text-[11px] font-mono text-game-muted mt-0.5">
                    HP {char.hp}/{char.max_hp} · MP {char.mp}/{char.max_mp} · {char.gold}g
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {[['VIG', char.vigor], ['REF', char.reflex], ['END', char.endurance],
                  ['INS', char.insight], ['SPI', char.spirit], ['PRE', char.presence]].map(([k, v]) => (
                  <div key={k} className="bg-game-card rounded px-2 py-1 text-center">
                    <div className="text-[9px] text-game-muted font-mono">{k}</div>
                    <div className="text-xs font-bold neon-cyan">{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-4 rounded-xl font-black text-sm tracking-widest uppercase transition-all duration-200 bg-neon-cyan text-game-bg hover:brightness-110 shadow-neon-cyan"
            >
              &gt; Enter the Grid
            </button>

            <button
              onClick={() => navigate('/character-creation')}
              className="w-full py-3 rounded-xl font-mono text-xs tracking-widest uppercase transition-all duration-200 border border-game-border hover:border-neon-cyan/40 text-game-muted hover:text-white"
            >
              ✎ Edit Character
            </button>
          </div>
        ) : (
          /* ── No character yet ── */
          <div className="space-y-4">
            <div
              className="rounded-xl border border-neon-pink/20 bg-game-panel p-5 font-mono text-xs space-y-2"
              style={{ boxShadow: '0 0 20px rgba(224,64,251,0.06)' }}
            >
              <div className="text-slate-500">&gt; No operator profile found</div>
              <div className="text-slate-500">&gt; Designation required before entering the grid</div>
              <div className="neon-pink animate-pulse">&gt; awaiting character initialization_</div>
            </div>

            <button
              onClick={() => navigate('/character-creation')}
              className="w-full py-4 rounded-xl font-black text-sm tracking-widest uppercase transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #3a0060, #1a0030)',
                border: '1px solid rgba(224,64,251,0.4)',
                boxShadow: '0 0 20px rgba(224,64,251,0.15)',
              }}
            >
              <span className="neon-pink">&gt; Create Character</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
