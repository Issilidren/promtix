import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CHALLENGES_DIR = join(__dirname, '../challenges');

let _challenges = null;

function load() {
  const all = [];
  for (const folder of ['solo']) {
    const dir = join(CHALLENGES_DIR, folder);
    try {
      for (const file of readdirSync(dir).filter(f => f.endsWith('.json'))) {
        const data = JSON.parse(readFileSync(join(dir, file), 'utf-8'));
        all.push(...(Array.isArray(data) ? data : [data]));
      }
    } catch { /* folder may not exist */ }
  }
  return all;
}

export function getChallenges() {
  if (!_challenges) _challenges = load();
  return _challenges.map(({ id, title, description, difficulty, category, xp_reward, token_budget }) => ({
    id, title, description, difficulty, category, xp_reward, token_budget
  }));
}

export function getChallengeById(id) {
  if (!_challenges) _challenges = load();
  return _challenges.find(c => c.id === id) || null;
}
