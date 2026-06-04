export default function handler(req, res) {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    scope: 'read:org user:email',
    redirect_uri: `${process.env.SERVER_URL || ''}/api/auth/callback`
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
}
