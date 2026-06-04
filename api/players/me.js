import { requireAuth } from '../../lib/auth.js';
import { getDB, initDB } from '../../lib/db.js';
import { calculateLevel } from '../../lib/scoring.js';

export default requireAuth(async (req, res) => {
  await initDB();
  const result = await getDB().execute({
    sql: 'SELECT * FROM players WHERE id = ?',
    args: [req.user.id]
  });
  if (!result.rows.length) return res.status(404).json({ error: 'Player not found' });
  const player = Object.fromEntries(Object.entries(result.rows[0]));
  res.json({ ...player, level: calculateLevel(player.xp) });
});
