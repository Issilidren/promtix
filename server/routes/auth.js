import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { getOrCreatePlayer } from '../db/index.js';

const router = Router();

const {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_ORG = 'CodePlatoon',
  JWT_SECRET
} = process.env;

// SERVER_URL = Railway backend (handles OAuth callback)
// CLIENT_URL = Vercel frontend (receives the token after login)
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

router.get('/github', (_req, res) => {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    scope: 'read:org user:email',
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

router.get('/github/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: GITHUB_CLIENT_ID, client_secret: GITHUB_CLIENT_SECRET, code })
    });
    const { access_token } = await tokenRes.json();
    if (!access_token) throw new Error('No access token');

    const headers = { Authorization: `Bearer ${access_token}`, 'User-Agent': 'Promtix' };

    const ghUser = await fetch('https://api.github.com/user', { headers }).then(r => r.json());


    const player = getOrCreatePlayer({
      github_id: ghUser.id,
      username: ghUser.login,
      avatar_url: ghUser.avatar_url,
      display_name: ghUser.name || ghUser.login
    });

    const token = jwt.sign(
      { id: player.id, username: player.username, avatar_url: player.avatar_url },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.redirect(`${CLIENT_URL}/auth/callback?token=${token}`);
  } catch (err) {
    console.error('Auth error:', err);
    res.redirect(`${CLIENT_URL}?error=auth_failed`);
  }
});

router.get('/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    res.json(jwt.verify(token, JWT_SECRET));
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
