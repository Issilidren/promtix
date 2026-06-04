import { requireAuth } from '../../lib/auth.js';
import { getDB, initDB } from '../../lib/db.js';
import { getChallenges } from '../../lib/challenges.js';
import { triggerPlayer } from '../../lib/pusher.js';

export default requireAuth(async (req, res) => {
  await initDB();
  const db = getDB();

  if (req.method === 'DELETE') {
    await db.execute({ sql: 'DELETE FROM pvp_queue WHERE player_id = ?', args: [req.user.id] });
    return res.json({ status: 'left' });
  }

  if (req.method !== 'POST') return res.status(405).end();

  // Look for someone already waiting (not us)
  const waiting = await db.execute({
    sql: 'SELECT player_id FROM pvp_queue WHERE player_id != ? ORDER BY created_at LIMIT 1',
    args: [req.user.id]
  });

  if (!waiting.rows.length) {
    // Nobody waiting — join the queue
    await db.execute({
      sql: 'INSERT OR REPLACE INTO pvp_queue (player_id) VALUES (?)',
      args: [req.user.id]
    });
    return res.json({ status: 'waiting' });
  }

  // Match found — pull opponent out of queue
  const opponentId = Number(waiting.rows[0].player_id);
  await db.execute({ sql: 'DELETE FROM pvp_queue WHERE player_id = ?', args: [opponentId] });

  const challenges = getChallenges();
  const challenge = challenges[Math.floor(Math.random() * Math.min(5, challenges.length))];

  const matchResult = await db.execute({
    sql: 'INSERT INTO pvp_matches (challenge_id, player1_id, player2_id) VALUES (?, ?, ?)',
    args: [challenge.id, req.user.id, opponentId]
  });
  const matchId = Number(matchResult.lastInsertRowid);

  const matchData = {
    matchId,
    challenge: {
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      token_budget: challenge.token_budget
    }
  };

  // Notify the waiting opponent via Pusher
  await triggerPlayer(opponentId, 'pvp:match_found', matchData);

  // Current player gets the match data directly in the response
  res.json({ status: 'matched', ...matchData });
});
