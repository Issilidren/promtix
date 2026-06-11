import { supabaseAdmin } from '../lib/supabase.js';
import { getChallenges } from '../game/challenges.js';
import { runChallenge, judgeResponse } from '../ai/claude.js';
import { calculateXP } from '../game/scoring.js';
import { getDB, getOrCreatePlayer } from '../db/index.js';

const waitingPlayers = new Map();
const activeMatches = new Map();

export function initPvP(io) {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Auth required'));
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
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

  io.on('connection', (socket) => {
    socket.on('pvp:queue', () => {
      if (waitingPlayers.size > 0) {
        const [[opponentId, opponent]] = waitingPlayers.entries();
        waitingPlayers.delete(opponentId);

        const challenges = getChallenges();
        const challenge = challenges[Math.floor(Math.random() * Math.min(5, challenges.length))];
        const roomId = `match_${socket.user.id}_${opponentId}_${Date.now()}`;

        socket.join(roomId);
        opponent.join(roomId);

        activeMatches.set(roomId, {
          roomId,
          challengeId: challenge.id,
          players: {
            [socket.user.id]: { socket, submitted: false },
            [opponent.user.id]: { socket: opponent, submitted: false }
          }
        });

        io.to(roomId).emit('pvp:match_found', {
          roomId,
          challenge: { id: challenge.id, title: challenge.title, description: challenge.description, token_budget: challenge.token_budget }
        });
      } else {
        waitingPlayers.set(socket.user.id, socket);
        socket.emit('pvp:waiting');
      }
    });

    socket.on('pvp:submit', async ({ roomId, prompt }) => {
      const match = activeMatches.get(roomId);
      if (!match) return;

      const playerData = match.players[socket.user.id];
      if (!playerData || playerData.submitted) return;

      playerData.submitted = true;
      playerData.prompt = prompt;
      playerData.submitTime = Date.now();
      socket.emit('pvp:processing');

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
            return { playerId: Number(pid), socket: pdata.socket, score: judgment.score, xpEarned, feedback: judgment.feedback, tip: judgment.tip };
          })
        );

        const [p1, p2] = results;
        const winnerId = p1.score >= p2.score ? p1.playerId : p2.playerId;

        const db = getDB();
        db.prepare('UPDATE players SET wins = wins + 1, xp = xp + ? WHERE id = ?').run(p1.score >= p2.score ? p1.xpEarned : p2.xpEarned, winnerId);
        db.prepare('UPDATE players SET losses = losses + 1 WHERE id = ?').run(winnerId === p1.playerId ? p2.playerId : p1.playerId);

        for (const result of results) {
          const isWinner = result.playerId === winnerId;
          result.socket.emit('pvp:results', {
            won: isWinner,
            yourScore: result.score,
            opponentScore: results.find(r => r.playerId !== result.playerId)?.score,
            xpEarned: result.xpEarned,
            feedback: result.feedback,
            tip: result.tip
          });
        }
      } catch (err) {
        console.error('PvP scoring error:', err);
        io.to(roomId).emit('pvp:error', { message: 'Match scoring failed. Try again.' });
      }
    });

    socket.on('pvp:leave_queue', () => waitingPlayers.delete(socket.user.id));
    socket.on('disconnect', () => waitingPlayers.delete(socket.user.id));
  });
}
