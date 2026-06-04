import Pusher from 'pusher-js';

let _pusher;

function getPusher() {
  if (!_pusher) {
    _pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER
    });
  }
  return _pusher;
}

export function subscribeToPlayer(userId, handlers) {
  const channel = getPusher().subscribe(`player-${userId}`);
  for (const [event, fn] of Object.entries(handlers)) {
    channel.bind(event, fn);
  }
  return () => getPusher().unsubscribe(`player-${userId}`);
}
