import { createClient } from '@libsql/client';

let _db;

export function getDB() {
  if (!_db) {
    _db = createClient({
      url: process.env.TURSO_DATABASE_URL || 'file:local.db',
      authToken: process.env.TURSO_AUTH_TOKEN || undefined
    });
  }
  return _db;
}

export async function initDB() {
  const db = getDB();
  const tables = [
    `CREATE TABLE IF NOT EXISTS players (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      github_id    INTEGER UNIQUE NOT NULL,
      username     TEXT    UNIQUE NOT NULL,
      display_name TEXT,
      avatar_url   TEXT,
      xp           INTEGER DEFAULT 0,
      wins         INTEGER DEFAULT 0,
      losses       INTEGER DEFAULT 0,
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS submissions (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id    INTEGER REFERENCES players(id),
      challenge_id TEXT    NOT NULL,
      prompt       TEXT    NOT NULL,
      response     TEXT,
      score        INTEGER DEFAULT 0,
      tokens_used  INTEGER DEFAULT 0,
      xp_earned    INTEGER DEFAULT 0,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS pvp_queue (
      player_id    INTEGER PRIMARY KEY REFERENCES players(id),
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS pvp_matches (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      challenge_id TEXT    NOT NULL,
      player1_id   INTEGER REFERENCES players(id),
      player2_id   INTEGER REFERENCES players(id),
      winner_id    INTEGER REFERENCES players(id),
      status       TEXT    DEFAULT 'active',
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME
    )`,
    `CREATE TABLE IF NOT EXISTS pvp_submissions (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id     INTEGER REFERENCES pvp_matches(id),
      player_id    INTEGER REFERENCES players(id),
      prompt       TEXT    NOT NULL,
      response     TEXT,
      score        INTEGER DEFAULT 0,
      xp_earned    INTEGER DEFAULT 0,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(match_id, player_id)
    )`
  ];
  for (const sql of tables) {
    await db.execute(sql);
  }
}

export async function getOrCreatePlayer({ github_id, username, avatar_url, display_name }) {
  const db = getDB();
  const existing = await db.execute({
    sql: 'SELECT * FROM players WHERE github_id = ?',
    args: [github_id]
  });

  if (existing.rows.length > 0) {
    await db.execute({
      sql: 'UPDATE players SET username = ?, avatar_url = ?, display_name = ? WHERE github_id = ?',
      args: [username, avatar_url, display_name, github_id]
    });
    return { ...Object.fromEntries(Object.entries(existing.rows[0])), username, avatar_url, display_name };
  }

  const result = await db.execute({
    sql: 'INSERT INTO players (github_id, username, avatar_url, display_name) VALUES (?, ?, ?, ?)',
    args: [github_id, username, avatar_url, display_name]
  });

  const newPlayer = await db.execute({
    sql: 'SELECT * FROM players WHERE id = ?',
    args: [result.lastInsertRowid]
  });
  return Object.fromEntries(Object.entries(newPlayer.rows[0]));
}
