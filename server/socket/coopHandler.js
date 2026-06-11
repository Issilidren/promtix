import { getSupabaseAdmin } from '../lib/supabase.js';
import { getChallenges } from '../game/challenges.js';
import { runChallenge, judgeResponse } from '../ai/claude.js';
import { calculateXP } from '../game/scoring.js';
import { getDB, getOrCreatePlayer } from '../db/index.js';

const COOP_SHARED_UNLOCK_LEVEL = 10;

const waitingPlayers = new Map();
const activeMatches = new Map();

export function initCoop(io) {
  const coopNs = io.of('/coop');

  coopNs.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Auth required'));
    const { data: { user }, error } = await getSupabaseAdmin().auth.getUser(token);
    if (error || !user) return next(new Error('Invalid token'));
    const player = getOrCreatePlayer({
      supabase_id: user.id,
      username: user.user_metadata?.user_name || user.email,
      avatar_url: user.user_metadata?.avatar_url,
      display_name: user.user_metadata?.full_name || user.user_metadata?.user_name,
    });
    socket.user = { ...user, id: player.id };
    next();
  });

  coopNs.on('connection', (socket) => {
    socket.on('coop:queue', () => {
      if (waitingPlayers.size > 0) {
        const [[partnerId, partner]] = waitingPlayers.entries();
        waitingPlayers.delete(partnerId);

        const challenges = getChallenges();
        const challenge = challenges[Math.floor(Math.random() * Math.min(5, challenges.length))];
        const roomId = `coop_${socket.user.id}_${partnerId}_${Date.now()}`;

        socket.join(roomId);
        partner.join(roomId);

        const db = getDB();
        const matchResult = db.prepare(
          'INSERT INTO coop_matches (challenge_id, player1_id, player2_id) VALUES (?, ?, ?)'
        ).run(challenge.id, socket.user.id, partnerId);

        const p1Level = db.prepare('SELECT xp FROM players WHERE id = ?').get(socket.user.id);
        const p2Level = db.prepare('SELECT xp FROM players WHERE id = ?').get(partnerId);
        const sharedModeAvailable =
          Math.floor(1 + Math.sqrt((p1Level?.xp || 0) / 100)) >= COOP_SHARED_UNLOCK_LEVEL &&
          Math.floor(1 + Math.sqrt((p2Level?.xp || 0) / 100)) >= COOP_SHARED_UNLOCK_LEVEL;

        activeMatches.set(roomId, {
          roomId,
          matchId: matchResult.lastInsertRowid,
          challengeId: challenge.id,
          players: {
            [socket.user.id]: { socket, submitted: false },
            [partnerId]: { socket: partner, submitted: false }
          }
        });

        coopNs.to(roomId).emit('coop:match_found', {
          roomId,
          challenge: { id: challenge.id, title: challenge.title, description: challenge.description, token_budget: challenge.token_budget },
          shared_mode_available: sharedModeAvailable
        });
      } else {
        waitingPlayers.set(socket.user.id, socket);
        socket.emit('coop:waiting');
      }
    });

    socket.on('coop:submit', async ({ roomId, prompt }) => {
      const match = activeMatches.get(roomId);
      if (!match) return;

      const playerData = match.players[socket.user.id];
      if (!playerData || playerData.submitted) return;

      playerData.submitted = true;
      playerData.prompt = prompt;
      socket.emit('coop:processing');

      const allSubmitted = Object.values(match.players).every(p => p.submitted);
      if (!allSubmitted) return;

      activeMatches.delete(roomId);

      const challenge = getChallenges().find(c => c.id === match.challengeId) ||
        { systemPrompt: '', evaluation: { criteria: ['Quality response'] }, token_budget: 300, xp_reward: 150, id: match.challengeId };

      try {
        const playerEntries = Object.entries(match.players);
        const results = await Promise.all(
          playerEntries.map(async ([pid, pdata]) => {
            const { content, tokensUsed } = await runChallenge(pdata.prompt, challenge);
            const judgment = await judgeResponse(pdata.prompt, content, challenge.evaluation?.criteria || []);
            const xpEarned = calculateXP(judgment.score, tokensUsed, challenge.token_budget, challenge.xp_reward);
            return { playerId: Number(pid), socket: pdata.socket, prompt: pdata.prompt, response: content, score: judgment.score, xpEarned, feedback: judgment.feedback, tip: judgment.tip };
          })
        );

        const db = getDB();
        for (const result of results) {
          db.prepare('UPDATE players SET xp = xp + ? WHERE id = ?').run(result.xpEarned, result.playerId);
          db.prepare('INSERT INTO coop_submissions (match_id, player_id, prompt, response, score, xp_earned) VALUES (?, ?, ?, ?, ?, ?)')
            .run(match.matchId, result.playerId, result.prompt, result.response, result.score, result.xpEarned);
        }

        db.prepare('UPDATE coop_matches SET status = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?')
          .run('completed', match.matchId);

        const [p1, p2] = results;
        p1.socket.emit('coop:results', {
          yourPrompt: p1.prompt, yourResponse: p1.response, yourScore: p1.score,
          partnerPrompt: p2.prompt, partnerResponse: p2.response, partnerScore: p2.score,
          xpEarned: p1.xpEarned, feedback: p1.feedback, tip: p1.tip
        });
        p2.socket.emit('coop:results', {
          yourPrompt: p2.prompt, yourResponse: p2.response, yourScore: p2.score,
          partnerPrompt: p1.prompt, partnerResponse: p1.response, partnerScore: p1.score,
          xpEarned: p2.xpEarned, feedback: p2.feedback, tip: p2.tip
        });
      } catch (err) {
        console.error('Co-op scoring error:', err);
        coopNs.to(roomId).emit('coop:error', { message: 'Match scoring failed. Try again.' });
      }
    });

    socket.on('coop:leave', () => waitingPlayers.delete(socket.user.id));
    socket.on('disconnect', () => waitingPlayers.delete(socket.user.id));
  });
}
