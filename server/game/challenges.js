import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CHALLENGES_DIR = join(__dirname, '../../challenges');

let challenges = null;

function loadChallenges() {
  const all = [];
  for (const folder of ['solo']) {
    const dir = join(CHALLENGES_DIR, folder);
    try {
      const files = readdirSync(dir).filter(f => f.endsWith('.json'));
      for (const file of files) {
        const data = JSON.parse(readFileSync(join(dir, file), 'utf-8'));
        all.push(...(Array.isArray(data) ? data : [data]));
      }
    } catch {
      // folder may not exist yet during development
    }
  }
  return all;
}

export function getChallenges() {
  if (!challenges) challenges = loadChallenges();
  return challenges.map(({ id, title, description, difficulty, category, xp_reward, token_budget }) => ({
    id, title, description, difficulty, category, xp_reward, token_budget
  }));
}

export function getChallengeById(id) {
  if (!challenges) challenges = loadChallenges();
  return challenges.find(c => c.id === id) || null;
}
