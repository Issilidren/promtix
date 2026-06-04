import { getOrCreatePlayer, initDB } from '../../lib/db.js';
import { signToken } from '../../lib/auth.js';

const CLIENT_URL = process.env.CLIENT_URL || '';
const GITHUB_ORG = process.env.GITHUB_ORG || 'CodePlatoon';

export default async function handler(req, res) {
  const { code } = req.query;

  try {
    await initDB();

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
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
      return res.redirect(`${CLIENT_URL}/?error=not_org_member`);
    }

    const player = await getOrCreatePlayer({
      github_id: ghUser.id,
      username: ghUser.login,
      avatar_url: ghUser.avatar_url,
      display_name: ghUser.name || ghUser.login
    });

    const token = signToken({ id: player.id, username: player.username, avatar_url: player.avatar_url });
    res.redirect(`${CLIENT_URL}/auth/callback?token=${token}`);
  } catch (err) {
    console.error('Auth error:', err);
    res.redirect(`${CLIENT_URL}/?error=auth_failed`);
  }
}
