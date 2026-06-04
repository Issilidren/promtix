import { requireAuth } from '../../lib/auth.js';
import { getDB, initDB } from '../../lib/db.js';
import { calculateLevel } from '../../lib/scoring.js';

export default requireAuth(async (_req, res) => {
  await initDB();
  const result = await getDB().execute(
    'SELECT id, username, display_name, avatar_url, xp, wins, losses FROM players ORDER BY xp DESC LIMIT 50'
  );
  res.json(result.rows.map(p => ({
    ...Object.fromEntries(Object.entries(p)),
    level: calculateLevel(p.xp)
  })));
});
