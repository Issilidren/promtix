# Promtix — Game Schema Handoff

**Source reference:** Celestial Shaman build v2 (`/sovereign-project/celestial_shaman_build_v2`)
**Scope:** Game side only. Work/tutor expertise system is NOT included.

---

## What Already Exists (keep as-is)

```
players         — id, github_id, username, display_name, avatar_url, xp, wins, losses
submissions     — challenge runs with score, tokens_used, xp_earned
pvp_matches     — 1v1 match records with winner
coop_matches    — co-op match records (both players earn XP)
coop_submissions — per-player co-op results
```

XP formula: `(score/100 * base_reward) + floor((unused_tokens / budget) * 50)`
Level formula: `1 + sqrt(xp / 100)`

---

## New Tables to Add

### `player_character`
One row per player. Their in-game avatar and stats.

```sql
CREATE TABLE IF NOT EXISTS player_character (
  player_id    INTEGER PRIMARY KEY REFERENCES players(id),
  name         TEXT    DEFAULT 'Adventurer',
  pf_class     TEXT    DEFAULT 'Adventurer 1',
  race         TEXT    DEFAULT 'Human',
  level        INTEGER DEFAULT 1,
  hp           INTEGER DEFAULT 30,
  max_hp       INTEGER DEFAULT 30,
  mp           INTEGER DEFAULT 10,
  max_mp       INTEGER DEFAULT 10,
  gold         INTEGER DEFAULT 50,
  weapon       TEXT    DEFAULT 'Iron Sword',
  skills       TEXT    DEFAULT '["Basic Attack"]',  -- JSON array
  status       TEXT    DEFAULT 'healthy',
  -- RPG stats (from Shaman soul schema)
  vigor        INTEGER DEFAULT 10,   -- physical power
  reflex       INTEGER DEFAULT 10,   -- speed / dodge
  endurance    INTEGER DEFAULT 10,   -- defense / sustain
  insight      INTEGER DEFAULT 10,   -- magic power / puzzle skill
  spirit       INTEGER DEFAULT 10,   -- healing / support
  presence     INTEGER DEFAULT 10,   -- social / luck
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Shaman reference:** `progression.json → profiles[name].game.party[CHARACTER]`
**Starter classes from Shaman:** Fighter, Oracle, Wizard, Rogue, Druid, Cleric

---

### `player_world`
One row per player. Their persistent world state.

```sql
CREATE TABLE IF NOT EXISTS player_world (
  player_id        INTEGER PRIMARY KEY REFERENCES players(id),
  world_name       TEXT    DEFAULT 'Unnamed Realm',  -- generated: e.g. "Debug Forest", "Git Grove", "Stack Cavern"
  biome            TEXT    DEFAULT 'debug_forest',   -- coding-themed: debug_forest | compile_plains | runtime_realm | heap_highlands | stack_caverns | null_void | git_grove
  story_chapter    INTEGER DEFAULT 1,
  story_title      TEXT    DEFAULT 'Hello World',    -- stages: Hello World → First Commit → Debug Mode → Merge Conflict → Code Review → Deploy Day → Final Build
  battles_won      INTEGER DEFAULT 0,
  revives_remaining INTEGER DEFAULT 5,
  party_wiped      INTEGER DEFAULT 0,  -- boolean
  in_home         INTEGER DEFAULT 1,  -- boolean, starts in home base
  active_quest_id  TEXT,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Shaman reference:** `progression.json → profiles[name].game` (top-level fields)

---

### `player_inventory`
Items a player owns.

```sql
CREATE TABLE IF NOT EXISTS player_inventory (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id  INTEGER REFERENCES players(id),
  name       TEXT    NOT NULL,
  qty        INTEGER DEFAULT 1,
  rarity     TEXT    DEFAULT 'common',  -- common | uncommon | rare | epic | legendary
  category   TEXT    DEFAULT 'misc',    -- potions | crystals | tomes | misc
  UNIQUE(player_id, name)
)
```

**Shaman reference:** `progression.json → profiles[name].game.inventory`
**Starter items:** 2x Healing Potion (common), 1x Phoenix Down (rare)

---

### `quests`
Quest definitions (like challenge JSON files, but for world quests).

```sql
CREATE TABLE IF NOT EXISTS quests (
  id           TEXT    PRIMARY KEY,
  title        TEXT    NOT NULL,
  giver        TEXT    DEFAULT 'Sage Rowan',
  objective    TEXT    NOT NULL,
  reward_gold  INTEGER DEFAULT 40,
  reward_xp    INTEGER DEFAULT 60,
  wins_needed  INTEGER DEFAULT 0,  -- 0 = no battle requirement
  quest_type   TEXT    DEFAULT 'main'  -- main | side | event
)
```

---

### `player_quests`
Per-player quest progress.

```sql
CREATE TABLE IF NOT EXISTS player_quests (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id   INTEGER REFERENCES players(id),
  quest_id    TEXT    REFERENCES quests(id),
  status      TEXT    DEFAULT 'available',  -- available | active | completed
  wins_done   INTEGER DEFAULT 0,
  started_at  DATETIME,
  completed_at DATETIME,
  UNIQUE(player_id, quest_id)
)
```

**Shaman reference:** `world_data.quests` + `active_quest_id`

---

### `world_events`
Timed global events (visible to all players).  *will be rotated to reflect progress challenges for players*

```sql
CREATE TABLE IF NOT EXISTS world_events (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  name     TEXT    NOT NULL,
  ends_at  DATETIME NOT NULL,
  active   INTEGER DEFAULT 1
)
```

**Coding-themed examples:** Hackathon, Bug Hunt, Refactor Storm, Code Sprint, Deploy Day, Zero-Day, Pull Request

---

## Schema Relationships (plain English)

```
players (1) ──── (1) player_character   ← their RPG avatar
players (1) ──── (1) player_world       ← their persistent save
players (1) ──── (N) player_inventory   ← their items
players (1) ──── (N) player_quests      ← their quest log
quests  (1) ──── (N) player_quests      ← the quest definitions
```

---

## Characters from Shaman (starter roster)   

| Name       | Class        | Archetype         | Element   |
|------------|--------------|-------------------|-----------|
| IRONCLAD   | Fighter      | Tank / Warrior    | earth     |
| BYNXI      | Oracle       | Time Mage         | lightning |
| AZIZA      | Wizard       | Arcane Scholar    | void      |
| BELLADONNA | Rogue        | Shadow Striker    | shadow    |
| OMEGA_MOM  | Druid        | Nature Healer     | nature    |
| AUNTIE_GEM | Cleric (99)  | Celestial Warden  | light     |

These appear as **NPCs** (quest givers and shop owners) in the game world. Players create their own character with a D&D class (Fighter, Wizard, Oracle, Rogue, Druid, Cleric) and name it themselves — like IronClad.
---

## What to Build Next (in order)

1. **Add tables** — run the `CREATE TABLE` statements above in `server/db/index.js → initDB()`
2. **Starter data** — when a new player registers, seed: player_character defaults, player_world with random seed, 2x Healing Potion + 1x Phoenix Down in inventory
3. **Player route** — `GET /api/players/me/world` returns character + world + inventory + active quests in one response
4. **Quest system** — seed the `quests` table with 3 starter quests (main_1, event_faerie, side_bandit)
5. **Gold rewards** — add gold to the `/api/game/submit` response when challenges are completed
6. **World events** — simple endpoint `GET /api/world/events` returns active timed events

---

## What NOT to Port from Shaman

- `work_expertise` system (coding/art/ui_ux XP per character) — not for Promtix
- Tile map / world_data decorations — too complex for now, skip
- NPC pathfinding (`home_col`, `target_x`, `speed`, `wander_timer`) — skip
- `memory_retention_policy`, `conversation_log` on souls — Shaman-specific
- `translator` block — Shaman-specific
