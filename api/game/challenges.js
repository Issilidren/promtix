import { requireAuth } from '../../lib/auth.js';
import { getChallenges } from '../../lib/challenges.js';

export default requireAuth((_req, res) => {
  res.json(getChallenges());
});
