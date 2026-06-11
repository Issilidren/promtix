import { Router } from 'express';
import { getSupabaseAdmin } from '../lib/supabase.js';

const router = Router();

router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  const { data: { user }, error } = await getSupabaseAdmin().auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  res.json({
    id: user.id,
    username: user.user_metadata?.user_name || user.email,
    avatar_url: user.user_metadata?.avatar_url,
    display_name: user.user_metadata?.full_name || user.user_metadata?.user_name,
  });
});

export default router;
