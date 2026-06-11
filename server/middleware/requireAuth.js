import { supabaseAdmin } from '../lib/supabase.js';
import { getOrCreatePlayer } from '../db/index.js';

export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid or expired token' });

  const player = getOrCreatePlayer({
    supabase_id: user.id,
    username: user.user_metadata?.user_name || user.email,
    avatar_url: user.user_metadata?.avatar_url,
    display_name: user.user_metadata?.full_name || user.user_metadata?.user_name,
  });

  req.user = { ...user, id: player.id };
  next();
}
