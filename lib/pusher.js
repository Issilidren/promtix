import Pusher from 'pusher';

let _pusher;

export function getPusher() {
  if (!_pusher) {
    _pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER,
      useTLS: true
    });
  }
  return _pusher;
}

export function triggerPlayer(userId, event, data) {
  return getPusher().trigger(`player-${userId}`, event, data);
}
