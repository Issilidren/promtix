import { requireAuth } from '../../lib/auth.js';
import { getDB, initDB } from '../../lib/db.js';
import { getChallengeById } from '../../lib/challenges.js';
import { runChallenge, judgeResponse } from '../../lib/claude.js';
import { calculateXP } from '../../lib/scoring.js';
import { triggerPlayer } from '../../lib/pusher.js';

export default requireAuth(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { matchId, prompt } = req.body;
  await initDB();
  const db = getDB();

  const matchResult = await db.execute({
    sql: 'SELECT * FROM pvp_matches WHERE id = ?',
    args: [matchId]
  });
  const match = matchResult.rows[0];
  if (!match || match.status === 'completed') {
    return res.status(400).json({ error: 'Invalid or already completed match' });
  }

  // Store this player's submission (UNIQUE constraint prevents duplicates)
  try {
    await db.execute({
      sql: 'INSERT INTO pvp_submissions (match_id, player_id, prompt) VALUES (?, ?, ?)',
      args: [matchId, req.user.id, prompt]
    });
  } catch {
    return res.status(400).json({ error: 'Already submitted for this match' });
  }

  // Check if both players have submitted
  const subsResult = await db.execute({
    sql: 'SELECT * FROM pvp_submissions WHERE match_id = ?',
    args: [matchId]
  });

  if (subsResult.rows.length < 2) {
    return res.json({ status: 'waiting_for_opponent' });
  }

  // Atomically claim scoring — only one request wins this race
  const claimed = await db.execute({
    sql: "UPDATE pvp_matches SET status = 'scoring' WHERE id = ? AND status = 'active'",
    args: [matchId]
  });
  if (!claimed.rowsAffected) {
    return res.json({ status: 'processing' });
  }

  // Score both submissions
  const challenge = getChallengeById(String(match.challenge_id));
  const subs = subsResult.rows;

  const results = await Promise.all(subs.map(async sub => {
    const { content, tokensUsed } = await runChallenge(String(sub.prompt), challenge);
    const judgment = await judgeResponse(String(sub.prompt), content, challenge.evaluation.criteria);
    const xpEarned = calculateXP(judgment.score, tokensUsed, challenge.token_budget, challenge.xp_reward);
    return { playerId: Number(sub.player_id), score: judgment.score, xpEarned, feedback: judgment.feedback, tip: judgment.tip };
  }));

  const [r1, r2] = results;
  const winnerId = r1.score >= r2.score ? r1.playerId : r2.playerId;
  const loserId = winnerId === r1.playerId ? r2.playerId : r1.playerId;

  await db.execute({
    sql: "UPDATE pvp_matches SET status = 'completed', winner_id = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?",
    args: [winnerId, matchId]
  });
  await db.execute({ sql: 'UPDATE players SET wins = wins + 1, xp = xp + ? WHERE id = ?', args: [results.find(r => r.playerId === winnerId).xpEarned, winnerId] });
  await db.execute({ sql: 'UPDATE players SET losses = losses + 1 WHERE id = ?', args: [loserId] });

  // Push results to both players
  for (const result of results) {
    const opp = results.find(r => r.playerId !== result.playerId);
    await triggerPlayer(result.playerId, 'pvp:results', {
      won: result.playerId === winnerId,
      yourScore: result.score,
      opponentScore: opp?.score,
      xpEarned: result.xpEarned,
      feedback: result.feedback,
      tip: result.tip
    });
  }

  res.json({ status: 'complete' });
});
