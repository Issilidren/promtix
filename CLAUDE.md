# Promtix — Claude Code Context

## What This Is
Promtix is an AI prompt-engineering game built by Kenny Abadia (IronClad). Players write prompts to solve challenges, earn XP, level up, and battle each other. It's Kenny's first real project, second week of coding.

## Stack
- **Client:** React + Vite + Tailwind CSS → deployed on **Vercel** (root dir: `client/`)
- **Server:** Node.js + Express + better-sqlite3 (synchronous) → deployed on **Railway**
- **Auth:** Supabase (GitHub OAuth, implicit flow, `persistSession: false`)
- **Realtime:** Socket.IO for PvP and Co-op modes
- **AI:** Anthropic Claude API (challenges + judging)

## Repo Layout
```
promtix/
  client/          # React/Vite frontend
    src/
      pages/       # Landing, Lobby, Dashboard, CharacterCreation, AuthCallback, Solo, PvP, Coop
      components/  # Layout (sidebar nav), shared UI
      hooks/       # useAuth (Supabase session)
      utils/       # api.js (all Railway API calls)
      lib/         # supabase.js (Supabase client)
      data/        # biomes.js
  server/          # Express backend
    routes/        # auth.js, game.js, players.js, world.js
    middleware/    # requireAuth.js (validates Supabase JWT)
    db/            # index.js (SQLite init + seed), seed.js
    lib/           # supabase.js (admin client for JWT verification)
    socket/        # pvpHandler.js, coopHandler.js
    game/          # scoring.js
```

## Auth Flow
1. User visits `/` → **Landing** page (login prompt)
2. Clicks "Initiate GitHub Auth" → Supabase OAuth → GitHub → redirects to `/auth/callback`
3. **AuthCallback** plays animation → navigates to `/lobby`
4. **Lobby** fetches player + character → shows character card or "create character" prompt
5. **Dashboard** is the main game hub (reached via "Enter the Grid")

`persistSession: false` + `flowType: 'implicit'` = users must log in every browser session (intentional design decision). Session lives in memory only.

## Env Vars

### Railway (server service variables — NOT project shared variables)
| Var | Purpose |
|-----|---------|
| `SUPABASE_URL` | Supabase project URL (`https://xxxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (secret, for JWT verification) |
| `ANTHROPIC_API_KEY` | Claude API key |
| `PORT` | Set automatically by Railway |

### Vercel (environment variables)
| Var | Purpose |
|-----|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_API_URL` | Railway server URL (`https://web-production-5904b.up.railway.app`) |

## CORS
Server uses `cors({ origin: '*' })` — open to all origins. All endpoints are protected by `requireAuth` (Supabase JWT validation), so origin restriction is not needed.

## Database
better-sqlite3, synchronous. File: `promtix.db` at project root.
**Railway filesystem is ephemeral** — DB wipes on every redeploy. Player data is lost on redeployment. This is a known issue; migration to Supabase Postgres is a future task.

Key tables: `players`, `player_character`, `player_world`, `player_inventory`, `quests`, `player_quests`, `npcs`, `pvp_matches`, `coop_matches`, `submissions`, `world_events`

## Game Classes (all valid in `VALID_CLASSES`)
| ID | Display | Title | Icon |
|----|---------|-------|------|
| `Fighter 1` | Fighter | Soldier | ⚔ |
| `Wizard 1` | Wizard | Arcanist | ✦ |
| `Oracle 1` | Oracle | Seer | ◎ |
| `Rogue 1` | Rogue | Phantom | ◈ |
| `Druid 1` | Druid | Warden | ❈ |
| `Cleric 1` | Cleric | Invoker | ⊕ |
| `Ranger 1` | Ranger | Hunter | ⟁ |
| `Barbarian 1` | Barbarian | IronClad | ⚡ |

Kenny plays as IronClad (Barbarian).

## Visual Design
Dark cyber-fantasy. Non-negotiable palette:
- Background: `#05050f` (near-black)
- Primary accent: `#00e5ff` neon cyan (`neon-cyan` class)
- Secondary accent: `#e040fb` magenta/pink (`neon-pink` class)
- Circuit-border ornaments, font-mono for terminal text, `flicker` animation on titles
- No light themes, no pastel, no flat design

Custom Tailwind classes: `neon-cyan`, `neon-pink`, `bg-game-bg`, `bg-game-panel`, `bg-game-card`, `game-border`, `game-muted`, `bar-hp`, `bar-mp`, `bar-xp`, `circuit-corner`, `flicker`, `slide-up`

## API Reference (`client/src/utils/api.js`)
All calls go to `${VITE_API_URL}/api/...` with `Authorization: Bearer <token>` from localStorage key `promtix_token`.

Key endpoints:
- `GET /api/players/me` → player row + `character_set` flag
- `GET /api/players/me/world` → character + world + inventory + quests
- `POST /api/players/me/character` → create/update character `{ name, pf_class }`
- `GET /api/world/npcs` → NPC companions
- `POST /api/game/submit` → submit challenge prompt

## Known Issues / Future Work
- **Ephemeral SQLite on Railway** — world name shows "Unnamed Realm" after every redeploy. Fix: migrate to Supabase Postgres or add a Railway persistent volume.
- **Avatar image** — bottom-left circle sometimes blank (low priority).
- **DEFEND/ITEMS** buttons greyed out in battle UI — not yet implemented.
- **Visual style** — wispy cyber-fantasy neon overhaul (reference: chibi characters with multi-color neon auras on dark hexagonal grid) not yet fully applied to all screens.
