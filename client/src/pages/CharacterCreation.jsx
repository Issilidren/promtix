import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api.js';

const CLASSES = [
  {
    id: 'Fighter 1',
    name: 'Fighter',
    title: 'The Debugger',
    icon: '⚔',
    color: 'neon-cyan',
    border: 'cyber-cyan',
    desc: 'Brute-force your way through every challenge. High HP. Low drama.',
  },
  {
    id: 'Wizard 1',
    name: 'Wizard',
    title: 'The Architect',
    icon: '✦',
    color: 'text-blue-400',
    border: 'border-blue-500/40',
    desc: 'Designs elegant solutions from scratch. High MP. Powerful casts.',
  },
  {
    id: 'Oracle 1',
    name: 'Oracle',
    title: 'The Visionary',
    icon: '◎',
    color: 'neon-pink',
    border: 'cyber-pink',
    desc: 'Reads the prompt before it\'s written. High Insight. Rarely wrong.',
  },
  {
    id: 'Rogue 1',
    name: 'Rogue',
    title: 'The Hacker',
    icon: '◈',
    color: 'text-green-400',
    border: 'border-green-500/40',
    desc: 'Creative misdirection. Unconventional angles. Breaks the meta.',
  },
  {
    id: 'Druid 1',
    name: 'Druid',
    title: 'The Refactorer',
    icon: '❈',
    color: 'text-emerald-400',
    border: 'border-emerald-500/40',
    desc: 'Clean code is clean magic. Balanced stats. Never leaves technical debt.',
  },
  {
    id: 'Cleric 1',
    name: 'Cleric',
    title: 'The DevOps',
    icon: '⊕',
    color: 'text-purple-400',
    border: 'border-purple-500/40',
    desc: 'Keeps the party alive. High Spirit. Thrives in Co-op mode.',
  },
  {
    id: 'Ranger 1',
    name: 'Ranger',
    title: 'The Hunter',
    icon: '⟁',
    color: 'text-green-400',
    border: 'border-green-500/40',
    desc: 'Nature/Tech affinity. Marks targets, commands beasts. Never misses.',
  },
];

export default function CharacterCreation() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    api.getWorld()
      .then(({ character }) => {
        if (character && character.name !== 'Adventurer') {
          setName(character.name);
          setSelectedClass(character.pf_class);
          setIsEditing(true);
        }
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !selectedClass) return;
    setSaving(true);
    setError(null);
    try {
      await api.setCharacter(name.trim(), selectedClass);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-game-bg text-white flex flex-col items-center justify-center p-6 overflow-y-auto">
      <div className="w-full max-w-2xl space-y-8 slide-up">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-4xl font-black tracking-wider flicker">
            <span className="text-white">Prom</span>
            <span className="neon-cyan">tix</span>
          </div>
          <h1 className="text-xl font-bold text-slate-300 font-mono tracking-widest uppercase">
            {isEditing ? 'Edit Your Designation' : 'Enter Your Designation'}
          </h1>
          <p className="text-game-muted text-sm font-mono">
            {isEditing
              ? '> sys.update(player) — change your identity'
              : '> sys.init(player) — choose wisely, traveler'}
          </p>
          {isEditing && (
            <Link to="/dashboard"
              className="inline-block text-xs font-mono text-game-muted hover:text-neon-cyan transition-colors mt-1">
              ← back to dashboard
            </Link>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name input */}
          <div className="circuit-corner">
            <label className="block text-xs text-neon-cyan font-mono mb-2 tracking-widest uppercase">
              Designation (your character's name)
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. IronClad, Vexor, Null..."
              maxLength={24}
              className="w-full bg-game-card border border-game-border focus:border-neon-cyan outline-none rounded-lg px-4 py-3 text-white placeholder-game-muted font-mono text-sm transition-colors"
            />
          </div>

          {/* Class selection */}
          <div>
            <label className="block text-xs text-neon-cyan font-mono mb-3 tracking-widest uppercase">
              Class — your code archetype
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CLASSES.map(cls => {
                const selected = selectedClass === cls.id;
                return (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => setSelectedClass(cls.id)}
                    className={`relative text-left p-4 rounded-lg border transition-all duration-200 ${
                      selected
                        ? `bg-game-card border-neon-cyan shadow-neon-sm`
                        : 'bg-game-panel border-game-border hover:border-game-muted hover:bg-game-card'
                    }`}
                  >
                    {selected && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-neon-cyan animate-glow" />
                    )}
                    <div className={`text-2xl mb-2 ${selected ? 'neon-cyan' : 'text-slate-400'}`}>
                      {cls.icon}
                    </div>
                    <div className={`font-bold text-sm ${selected ? 'text-white' : 'text-slate-300'}`}>
                      {cls.name}
                    </div>
                    <div className={`text-xs font-mono mb-2 ${selected ? 'neon-cyan' : 'text-game-muted'}`}>
                      {cls.title}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{cls.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="bg-red-950 border border-red-700 text-red-300 rounded-lg p-3 text-sm font-mono">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!name.trim() || !selectedClass || saving}
            className="w-full py-4 rounded-lg font-black text-sm tracking-widest uppercase transition-all duration-200
              bg-neon-cyan text-game-bg hover:brightness-110 shadow-neon-cyan
              disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {saving ? '> Processing...' : isEditing ? '> Update Character' : '> Enter the Grid'}
          </button>
        </form>
      </div>
    </div>
  );
}
