import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { seedStatic } from './seed.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
let db;

const WORLD_PREFIXES = ['Debug','Compile','Runtime','Stack','Null','Git','Loop','Fork','Branch','Merge'];
const WORLD_SUFFIXES = ['Forest','Plains','Cavern','Grove','Hollow','Vale','Realm','Rift','Keep','Vault'];

function seedNewPlayer(playerId) {
  const worldName = `${WORLD_PREFIXES[Math.floor(Math.random() * WORLD_PREFIXES.length)]} ${WORLD_SUFFIXES[Math.floor(Math.random() * WORLD_SUFFIXES.length)]}`;
  db.prepare('INSERT OR IGNORE INTO player_character (player_id) VALUES (?)').run(playerId);
  db.prepare('INSERT OR IGNORE INTO player_world (player_id, world_name) VALUES (?, ?)').run(playerId, worldName);
  db.prepare('INSERT OR IGNORE INTO player_inventory (player_id, name, qty, rarity, category) VALUES (?, ?, ?, ?, ?)').run(playerId, 'Healing Potion', 2, 'common', 'potions');
  db.prepare('INSERT OR IGNORE INTO player_inventory (player_id, name, qty, rarity, category) VALUES (?, ?, ?, ?, ?)').run(playerId, 'Phoenix Down', 1, 'rare', 'misc');
  db.prepare('INSERT OR IGNORE INTO player_quests (player_id, quest_id, status) VALUES (?, ?, ?)').run(playerId, 'main_hello_world', 'active');
}

export function initDB() {
  db = new Database(join(__dirname, '../../promtix.db'));
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      supabase_id   TEXT    UNIQUE NOT NULL,
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

    CREATE TABLE IF NOT EXISTS player_character (
      player_id   INTEGER PRIMARY KEY REFERENCES players(id),
      name        TEXT    DEFAULT 'Adventurer',
      pf_class    TEXT    DEFAULT 'Fighter 1',
      race        TEXT    DEFAULT 'Human',
      level       INTEGER DEFAULT 1,
      hp          INTEGER DEFAULT 30,
      max_hp      INTEGER DEFAULT 30,
      mp          INTEGER DEFAULT 10,
      max_mp      INTEGER DEFAULT 10,
      gold        INTEGER DEFAULT 50,
      weapon      TEXT    DEFAULT 'Iron Sword',
      skills      TEXT    DEFAULT '["Basic Attack"]',
      status      TEXT    DEFAULT 'healthy',
      vigor       INTEGER DEFAULT 10,
      reflex      INTEGER DEFAULT 10,
      endurance   INTEGER DEFAULT 10,
      insight     INTEGER DEFAULT 10,
      spirit      INTEGER DEFAULT 10,
      presence    INTEGER DEFAULT 10,
      updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS player_world (
      player_id         INTEGER PRIMARY KEY REFERENCES players(id),
      world_name        TEXT    DEFAULT 'Unnamed Realm',
      biome             TEXT    DEFAULT 'debug_forest',
      story_chapter     INTEGER DEFAULT 1,
      story_title       TEXT    DEFAULT 'Hello World',
      battles_won       INTEGER DEFAULT 0,
      revives_remaining INTEGER DEFAULT 5,
      party_wiped       INTEGER DEFAULT 0,
      in_home           INTEGER DEFAULT 1,
      active_quest_id   TEXT,
      created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS player_inventory (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id  INTEGER REFERENCES players(id),
      name       TEXT    NOT NULL,
      qty        INTEGER DEFAULT 1,
      rarity     TEXT    DEFAULT 'common',
      category   TEXT    DEFAULT 'misc',
      UNIQUE(player_id, name)
    );

    CREATE TABLE IF NOT EXISTS quests (
      id           TEXT    PRIMARY KEY,
      title        TEXT    NOT NULL,
      giver        TEXT    DEFAULT 'The Terminal',
      objective    TEXT    NOT NULL,
      reward_gold  INTEGER DEFAULT 40,
      reward_xp    INTEGER DEFAULT 60,
      wins_needed  INTEGER DEFAULT 0,
      quest_type   TEXT    DEFAULT 'main'
    );

    CREATE TABLE IF NOT EXISTS player_quests (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id    INTEGER REFERENCES players(id),
      quest_id     TEXT    REFERENCES quests(id),
      status       TEXT    DEFAULT 'available',
      wins_done    INTEGER DEFAULT 0,
      started_at   DATETIME,
      completed_at DATETIME,
      UNIQUE(player_id, quest_id)
    );

    CREATE TABLE IF NOT EXISTS world_events (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      name     TEXT    NOT NULL,
      ends_at  DATETIME NOT NULL,
      active   INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS coop_matches (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      challenge_id TEXT    NOT NULL,
      player1_id   INTEGER REFERENCES players(id),
      player2_id   INTEGER REFERENCES players(id),
      status       TEXT    DEFAULT 'active',
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS coop_submissions (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id     INTEGER REFERENCES coop_matches(id),
      player_id    INTEGER REFERENCES players(id),
      prompt       TEXT    NOT NULL,
      response     TEXT,
      score        INTEGER DEFAULT 0,
      xp_earned    INTEGER DEFAULT 0,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(match_id, player_id)
    );

    CREATE TABLE IF NOT EXISTS npcs (
      id        TEXT PRIMARY KEY,
      name      TEXT NOT NULL,
      role      TEXT NOT NULL,
      soul_ref  TEXT,
      element   TEXT,
      archetype TEXT,
      lines     TEXT DEFAULT '[]'
    );
  `);

  seedStatic(db);
  return Promise.resolve();
}

export function getOrCreatePlayer({ supabase_id, username, avatar_url, display_name }) {
  const existing = db.prepare('SELECT * FROM players WHERE supabase_id = ?').get(supabase_id);
  if (existing) {
    db.prepare('UPDATE players SET username = ?, avatar_url = ?, display_name = ? WHERE supabase_id = ?')
      .run(username, avatar_url, display_name, supabase_id);
    return { ...existing, username, avatar_url, display_name };
  }

  const result = db.prepare(
    'INSERT INTO players (supabase_id, username, avatar_url, display_name) VALUES (?, ?, ?, ?)'
  ).run(supabase_id, username, avatar_url, display_name);

  const newPlayer = db.prepare('SELECT * FROM players WHERE id = ?').get(result.lastInsertRowid);
  seedNewPlayer(newPlayer.id);
  return newPlayer;
}

export function getDB() {
  return db;
}
