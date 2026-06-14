import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../utils/api.js';
import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL || '';

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

function StatBar({ value, max, className }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="h-1 bg-game-border rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${className}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function ChatPanel({ user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const listRef   = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('promtix_token');
    if (!token) return;

    const socket = io(`${API_BASE}/chat`, {
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect',    () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('chat:message', (msg) => {
      setMessages(prev => [...prev.slice(-49), msg]);
    });

    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  function send() {
    if (!input.trim()) return;
    socketRef.current?.emit('chat:send', { message: input.trim() });
    setInput('');
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        <div className="text-[9px] font-mono text-game-muted uppercase tracking-widest">
          Global Chat
        </div>
        <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500' : 'bg-slate-600'}`} />
      </div>

      {/* Message list */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-3 space-y-1.5 pb-2">
        {messages.length === 0 ? (
          <p className="text-game-muted text-[10px] font-mono leading-relaxed pt-1">
            &gt; No messages yet
          </p>
        ) : (
          messages.map((m, i) => (
            <div key={i} className="group">
              <div className="flex items-start gap-1.5">
                {m.avatar ? (
                  <img src={m.avatar} alt=""
                    className="w-4 h-4 rounded-full border border-game-border shrink-0 mt-0.5" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-game-border shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <span className="text-[9px] font-mono neon-cyan">{m.from} </span>
                  <span className="text-[10px] text-slate-300 break-words">{m.text}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="px-2 pb-2">
        <div className="flex gap-1">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send(); }}
            placeholder="say something..."
            maxLength={200}
            className="flex-1 bg-game-card border border-game-border rounded px-2 py-1 text-[10px] font-mono text-white placeholder-game-muted outline-none focus:border-neon-cyan/40 transition-colors"
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className="text-[10px] font-mono neon-cyan border border-neon-cyan/30 rounded px-1.5 hover:bg-neon-cyan/10 transition-colors disabled:opacity-30"
          >
            ⏎
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Layout({ children, gold, characterName }) {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const [events, setEvents] = useState([]);
  const [char,   setChar]   = useState(null);

  useEffect(() => {
    api.getWorldEvents().then(setEvents).catch(() => {});
    api.getWorld()
      .then(w => setChar(w?.character ?? null))
      .catch(() => {});
  }, []);

  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <div className="flex h-screen bg-game-bg text-white overflow-hidden">

      {/* ── Left Sidebar ──────────────────────────────────────────── */}
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
          {(gold ?? char?.gold) != null && (
            <div className="hidden md:flex items-center gap-1.5 text-yellow-400 text-xs font-mono">
              <span>◈</span>
              <span className="neon-gold">{gold ?? char?.gold}g</span>
            </div>
          )}
          {user && (
            <div className="flex items-center gap-2 min-w-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt=""
                  className="w-7 h-7 rounded-full border border-neon-cyan/30 shrink-0" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-game-border border border-neon-cyan/30 shrink-0" />
              )}
              <span className="hidden md:block text-slate-400 text-xs truncate">
                {characterName || char?.name || user.user_metadata?.user_name}
              </span>
            </div>
          )}
          <button onClick={logout}
            className="flex items-center gap-1.5 text-game-muted hover:text-slate-400 text-xs transition-colors font-mono w-full"
            title="Logout"
          >
            <span className="text-base w-5 text-center shrink-0">⇠</span>
            <span className="hidden md:block">logout</span>
          </button>
        </div>
      </aside>

      {/* ── Center content ────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto min-w-0">
        {children}
      </div>

      {/* ── Right Rail ────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-[14%] min-w-[10rem] max-w-[13rem] shrink-0 bg-game-panel border-l border-game-border overflow-hidden">

        {/* Status panel */}
        {char && (
          <div className="p-3 border-b border-game-border space-y-2 shrink-0">
            <div className="text-[9px] font-mono text-game-muted uppercase tracking-widest">
              Status
            </div>
            <div className="flex items-center gap-2">
              {avatarUrl ? (
                <img src={avatarUrl} alt=""
                  className="w-6 h-6 rounded-full border border-neon-cyan/30 shrink-0" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-game-border shrink-0" />
              )}
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-white truncate">{char.name}</div>
                <div className="text-[9px] font-mono neon-cyan">{char.pf_class}</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>HP</span><span>{char.hp}/{char.max_hp}</span>
              </div>
              <StatBar value={char.hp} max={char.max_hp} className="bar-hp" />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>MP</span><span>{char.mp}/{char.max_mp}</span>
              </div>
              <StatBar value={char.mp} max={char.max_mp} className="bar-mp" />
            </div>
            <div className="grid grid-cols-3 gap-1">
              {[['VIG', char.vigor], ['REF', char.reflex], ['END', char.endurance],
                ['INS', char.insight], ['SPI', char.spirit], ['PRE', char.presence]].map(([k, v]) => (
                <div key={k} className="bg-game-card rounded px-1 py-0.5 text-center">
                  <div className="text-[8px] text-game-muted font-mono">{k}</div>
                  <div className="text-[10px] font-bold neon-cyan">{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* World Events */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0">
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
        </div>

        {/* Chat */}
        <div className="border-t border-game-border flex flex-col" style={{ height: '38%' }}>
          <ChatPanel user={user} />
        </div>

      </aside>

    </div>
  );
}
