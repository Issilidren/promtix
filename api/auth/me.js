import { verifyToken } from '../../lib/auth.js';

export default function handler(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    res.json(verifyToken(token));
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
