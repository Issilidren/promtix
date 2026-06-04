import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
let db;

export function initDB() {
  db = new Database(join(__dirname, '../../promtix.db'));
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      github_id     INTEGER UNIQUE NOT NULL,
      username      TEXT    UNIQUE NOT NULL,
      display_name  TEXT,
      avatar_url    TEXT,
      xp            INTEGER DEFAULT 0,
      wins          INTEGER DEFAULT 0,
      losses        INTEGER DEFAULT 0,
      created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id     INTEGER REFERENCES players(id),
      challenge_id  TEXT    NOT NULL,
      prompt        TEXT    NOT NULL,
      response      TEXT,
      score         INTEGER DEFAULT 0,
      tokens_used   INTEGER DEFAULT 0,
      xp_earned     INTEGER DEFAULT 0,
      completed_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pvp_matches (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      challenge_id  TEXT    NOT NULL,
      player1_id    INTEGER REFERENCES players(id),
      player2_id    INTEGER REFERENCES players(id),
      winner_id     INTEGER REFERENCES players(id),
      status        TEXT    DEFAULT 'waiting',
      created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at  DATETIME
    );
  `);

  return Promise.resolve();
}

export function getOrCreatePlayer({ github_id, username, avatar_url, display_name }) {
  const existing = db.prepare('SELECT * FROM players WHERE github_id = ?').get(github_id);
  if (existing) {
    db.prepare('UPDATE players SET username = ?, avatar_url = ?, display_name = ? WHERE github_id = ?')
      .run(username, avatar_url, display_name, github_id);
    return { ...existing, username, avatar_url, display_name };
  }

  const result = db.prepare(
    'INSERT INTO players (github_id, username, avatar_url, display_name) VALUES (?, ?, ?, ?)'
  ).run(github_id, username, avatar_url, display_name);

  return db.prepare('SELECT * FROM players WHERE id = ?').get(result.lastInsertRowid);
}

export function getDB() {
  return db;
}
