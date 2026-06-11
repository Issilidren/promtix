const API_BASE = import.meta.env.VITE_API_URL || '';

function getToken() {
  return localStorage.getItem('promtix_token');
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }

  return res.json();
}

export const api = {
  // ── Auth ────────────────────────────────────────────────────────
  getMe:           ()             => apiFetch('/players/me'),
  getLeaderboard:  ()             => apiFetch('/players/leaderboard'),
  getPlayer:       (u)            => apiFetch(`/players/${u}`),

  // ── Character ────────────────────────────────────────────────────
  setCharacter:    (name, pf_class) =>
    apiFetch('/players/me/character', { method: 'POST', body: JSON.stringify({ name, pf_class }) }),
  getWorld:        ()             => apiFetch('/players/me/world'),

  // ── Game ─────────────────────────────────────────────────────────
  getChallenges:   ()             => apiFetch('/game/challenges'),
  submitChallenge: (id, prompt)   =>
    apiFetch('/game/submit', { method: 'POST', body: JSON.stringify({ challengeId: id, prompt }) }),

  // ── PvP ──────────────────────────────────────────────────────────
  pvpQueue:        ()             => apiFetch('/pvp/queue', { method: 'POST' }),
  pvpLeave:        ()             => apiFetch('/pvp/queue', { method: 'DELETE' }),
  pvpSubmit:       (matchId, p)   =>
    apiFetch('/pvp/submit', { method: 'POST', body: JSON.stringify({ matchId, prompt: p }) }),

  // ── World ────────────────────────────────────────────────────────
  getWorldEvents:  ()             => apiFetch('/world/events'),
  getNpcs:         ()             => apiFetch('/world/npcs'),
  getShop:         ()             => apiFetch('/world/shop'),
  buyItem:         (item_name, qty = 1) =>
    apiFetch('/world/shop/buy', { method: 'POST', body: JSON.stringify({ item_name, qty }) }),
};
