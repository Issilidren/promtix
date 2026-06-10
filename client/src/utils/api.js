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
      ...options.headers
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }

  return res.json();
}

export const api = {
  getChallenges: () => apiFetch('/game/challenges'),
  submitChallenge: (challengeId, prompt) =>
    apiFetch('/game/submit', { method: 'POST', body: JSON.stringify({ challengeId, prompt }) }),
  getLeaderboard: () => apiFetch('/players/leaderboard'),
  getMe: () => apiFetch('/players/me'),
  getPlayer: (username) => apiFetch(`/players/${username}`),
  pvpQueue: () => apiFetch('/pvp/queue', { method: 'POST' }),
  pvpLeave: () => apiFetch('/pvp/queue', { method: 'DELETE' }),
  pvpSubmit: (matchId, prompt) =>
    apiFetch('/pvp/submit', { method: 'POST', body: JSON.stringify({ matchId, prompt }) })
};
