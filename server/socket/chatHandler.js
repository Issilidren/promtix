import { getSupabaseAdmin } from '../lib/supabase.js';
import { getOrCreatePlayer } from '../db/index.js';

export function initChat(io) {
  const chatNs = io.of('/chat');

  chatNs.use(async (socket, next) => {
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
    socket.user = {
      id: player.id,
      username: user.user_metadata?.user_name || user.email,
      avatar_url: user.user_metadata?.avatar_url,
    };
    next();
  });

  chatNs.on('connection', (socket) => {
    socket.on('chat:send', ({ message }) => {
      if (!message?.trim() || message.length > 200) return;
      chatNs.emit('chat:message', {
        from: socket.user.username,
        avatar: socket.user.avatar_url,
        text: message.trim(),
        ts: Date.now(),
      });
    });
  });
}
