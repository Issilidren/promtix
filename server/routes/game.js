import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getChallenges, getChallengeById } from '../game/challenges.js';
import { calculateXP } from '../game/scoring.js';
import { runChallenge, judgeResponse } from '../ai/claude.js';
import { getDB } from '../db/index.js';

const router = Router();

router.get('/challenges', requireAuth, (_req, res) => {
  res.json(getChallenges());
});

router.get('/challenges/:id', requireAuth, (req, res) => {
  const challenge = getChallengeById(req.params.id);
  if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
  res.json(challenge);
});

router.post('/submit', requireAuth, async (req, res) => {
  const { challengeId, prompt } = req.body;
  if (!challengeId || !prompt?.trim()) {
    return res.status(400).json({ error: 'challengeId and prompt are required' });
  }

  const challenge = getChallengeById(challengeId);
  if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

  try {
    const { content: aiResponse, tokensUsed } = await runChallenge(prompt, challenge);
    const judgment = await judgeResponse(prompt, aiResponse, challenge.evaluation.criteria);
    const xpEarned = calculateXP(judgment.score, tokensUsed, challenge.token_budget, challenge.xp_reward);

    const db = getDB();
    db.prepare(`
      INSERT INTO submissions (player_id, challenge_id, prompt, response, score, tokens_used, xp_earned)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, challengeId, prompt, aiResponse, judgment.score, tokensUsed, xpEarned);

    db.prepare('UPDATE players SET xp = xp + ? WHERE id = ?').run(xpEarned, req.user.id);

    res.json({ aiResponse, score: judgment.score, feedback: judgment.feedback, tip: judgment.tip, xpEarned, tokensUsed });
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ error: 'Failed to process challenge' });
  }
});

export default router;
