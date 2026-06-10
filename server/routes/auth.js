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

// On Railway, server and client are the same URL
const APP_URL = process.env.RAILWAY_STATIC_URL
  ? `https://${process.env.RAILWAY_STATIC_URL}`
  : process.env.APP_URL || 'http://localhost:3001';

router.get('/github', (_req, res) => {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    scope: 'read:org user:email',
    redirect_uri: `${APP_URL}/auth/github/callback`
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

    const memberRes = await fetch(
      `https://api.github.com/orgs/${GITHUB_ORG}/members/${ghUser.login}`,
      { headers }
    );

    if (memberRes.status !== 204) {
      return res.redirect(`${APP_URL}?error=not_org_member`);
    }

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

    res.redirect(`${APP_URL}/auth/callback?token=${token}`);
  } catch (err) {
    console.error('Auth error:', err);
    res.redirect(`${APP_URL}?error=auth_failed`);
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
