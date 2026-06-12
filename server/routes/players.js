import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getDB } from '../db/index.js';
import { calculateLevel } from '../game/scoring.js';

const VALID_CLASSES = ['Fighter 1', 'Wizard 1', 'Oracle 1', 'Rogue 1', 'Druid 1', 'Cleric 1', 'Ranger 1', 'Barbarian 1'];

const router = Router();

router.get('/me', requireAuth, (req, res) => {
  const player = getDB().prepare('SELECT * FROM players WHERE id = ?').get(req.user.id);
  if (!player) return res.status(404).json({ error: 'Player not found' });
  const character = getDB().prepare('SELECT * FROM player_character WHERE player_id = ?').get(req.user.id);
  res.json({ ...player, level: calculateLevel(player.xp), character_set: !!(character && character.name !== 'Adventurer') });
});

router.get('/me/world', requireAuth, (req, res) => {
  const db = getDB();
  const character = db.prepare('SELECT * FROM player_character WHERE player_id = ?').get(req.user.id);
  const world = db.prepare('SELECT * FROM player_world WHERE player_id = ?').get(req.user.id);
  const inventory = db.prepare('SELECT * FROM player_inventory WHERE player_id = ?').all(req.user.id);
  const quests = db.prepare(`
    SELECT pq.status, pq.wins_done, pq.started_at, pq.completed_at,
           q.id, q.title, q.giver, q.objective, q.reward_gold, q.reward_xp, q.wins_needed, q.quest_type
    FROM player_quests pq
    JOIN quests q ON q.id = pq.quest_id
    WHERE pq.player_id = ?
    ORDER BY pq.id DESC
  `).all(req.user.id);
  res.json({ character, world, inventory, quests });
});

router.post('/me/character', requireAuth, (req, res) => {
  const { name, pf_class } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Character name is required' });
  if (!VALID_CLASSES.includes(pf_class)) {
    return res.status(400).json({ error: `Class must be one of: ${VALID_CLASSES.join(', ')}` });
  }

  const db = getDB();
  const existing = db.prepare('SELECT player_id FROM player_character WHERE player_id = ?').get(req.user.id);
  if (existing) {
    db.prepare('UPDATE player_character SET name = ?, pf_class = ?, updated_at = CURRENT_TIMESTAMP WHERE player_id = ?')
      .run(name.trim(), pf_class, req.user.id);
  } else {
    db.prepare('INSERT INTO player_character (player_id, name, pf_class) VALUES (?, ?, ?)').run(req.user.id, name.trim(), pf_class);
  }
  res.json(db.prepare('SELECT * FROM player_character WHERE player_id = ?').get(req.user.id));
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
