import { requireAuth } from '../../lib/auth.js';
import { getDB, initDB } from '../../lib/db.js';
import { calculateLevel } from '../../lib/scoring.js';

export default requireAuth(async (req, res) => {
  await initDB();
  const db = getDB();
  const { username } = req.query;

  const playerResult = await db.execute({
    sql: 'SELECT id, username, display_name, avatar_url, xp, wins, losses FROM players WHERE username = ?',
    args: [username]
  });
  if (!playerResult.rows.length) return res.status(404).json({ error: 'Player not found' });

  const player = Object.fromEntries(Object.entries(playerResult.rows[0]));
  const subsResult = await db.execute({
    sql: 'SELECT challenge_id, score, xp_earned, completed_at FROM submissions WHERE player_id = ? ORDER BY completed_at DESC LIMIT 10',
    args: [player.id]
  });

  res.json({
    ...player,
    level: calculateLevel(player.xp),
    recentSubmissions: subsResult.rows.map(r => Object.fromEntries(Object.entries(r)))
  });
});
