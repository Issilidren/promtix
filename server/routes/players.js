import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getDB } from '../db/index.js';
import { calculateLevel } from '../game/scoring.js';

const router = Router();

router.get('/me', requireAuth, (req, res) => {
  const player = getDB().prepare('SELECT * FROM players WHERE id = ?').get(req.user.id);
  if (!player) return res.status(404).json({ error: 'Player not found' });
  res.json({ ...player, level: calculateLevel(player.xp) });
});

router.get('/leaderboard', requireAuth, (_req, res) => {
  const players = getDB().prepare(
    'SELECT id, username, display_name, avatar_url, xp, wins, losses FROM players ORDER BY xp DESC LIMIT 50'
  ).all();
  res.json(players.map(p => ({ ...p, level: calculateLevel(p.xp) })));
});

router.get('/:username', requireAuth, (req, res) => {
  const db = getDB();
  const player = db.prepare(
    'SELECT id, username, display_name, avatar_url, xp, wins, losses FROM players WHERE username = ?'
  ).get(req.params.username);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const recentSubmissions = db.prepare(
    'SELECT challenge_id, score, xp_earned, completed_at FROM submissions WHERE player_id = ? ORDER BY completed_at DESC LIMIT 10'
  ).all(player.id);

  res.json({ ...player, level: calculateLevel(player.xp), recentSubmissions });
});

export default router;
