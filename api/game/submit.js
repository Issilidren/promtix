import { requireAuth } from '../../lib/auth.js';
import { getDB, initDB } from '../../lib/db.js';
import { getChallengeById } from '../../lib/challenges.js';
import { runChallenge, judgeResponse } from '../../lib/claude.js';
import { calculateXP } from '../../lib/scoring.js';

export default requireAuth(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { challengeId, prompt } = req.body;
  if (!challengeId || !prompt?.trim()) {
    return res.status(400).json({ error: 'challengeId and prompt are required' });
  }

  const challenge = getChallengeById(challengeId);
  if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

  await initDB();
  const db = getDB();

  try {
    const { content: aiResponse, tokensUsed } = await runChallenge(prompt, challenge);
    const judgment = await judgeResponse(prompt, aiResponse, challenge.evaluation.criteria);
    const xpEarned = calculateXP(judgment.score, tokensUsed, challenge.token_budget, challenge.xp_reward);

    await db.execute({
      sql: 'INSERT INTO submissions (player_id, challenge_id, prompt, response, score, tokens_used, xp_earned) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [req.user.id, challengeId, prompt, aiResponse, judgment.score, tokensUsed, xpEarned]
    });
    await db.execute({
      sql: 'UPDATE players SET xp = xp + ? WHERE id = ?',
      args: [xpEarned, req.user.id]
    });

    res.json({ aiResponse, score: judgment.score, feedback: judgment.feedback, tip: judgment.tip, xpEarned, tokensUsed });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ error: 'Failed to process challenge' });
  }
});
