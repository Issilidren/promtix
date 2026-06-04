# Promtix

> Master the art of AI prompting. Outprompt your rivals.

A tactical game for the Code Platoon Dakota Cohort that teaches AI prompting, tool use, and LLM thinking through competitive play.

---

## Features

- **Solo Training Grounds** — escalating prompt-craft challenges, works offline (PWA)
- **PvP Arena** — real-time head-to-head prompt battles against cohort members
- **GitHub Auth gate** — Code Platoon org members only, no passwords
- **XP + Leveling** — earn XP for every challenge, ranked leaderboard
- **Offline mode** — install as a PWA, solo challenges cache locally

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite + Tailwind (PWA) |
| Backend | Express + Socket.io |
| Auth | GitHub OAuth (org-gated) |
| Database | SQLite (better-sqlite3) |
| AI | Anthropic SDK (Claude) |

---

## Setup

### 1. Create a GitHub OAuth App

Go to **github.com/settings/developers → OAuth Apps → New OAuth App**

| Field | Value |
|-------|-------|
| Homepage URL | `http://localhost:5173` |
| Callback URL | `http://localhost:3001/auth/github/callback` |

Copy the **Client ID** and generate a **Client Secret**.

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in `.env`:
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — from step 1
- `GITHUB_ORG` — your GitHub org name (e.g. `CodePlatoon`)
- `JWT_SECRET` — run `openssl rand -hex 32`
- `ANTHROPIC_API_KEY` — your team's Anthropic key

### 3. Install and run

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`

---

## Cohort Members — Getting Started

1. Fork this repo to your GitHub account
2. Go to the shared Promtix URL (pinned in Discord/Slack)
3. Click **Sign in with GitHub**
4. You're in — no local setup required to play

To run locally or contribute, follow the full setup above.

---

## Deploying

**Frontend** → [Vercel](https://vercel.com) (connect the repo, deploy `client/`)

**Backend** → [Railway](https://railway.app) (deploy `server/`, add env vars)

Update `SERVER_URL` and `CLIENT_URL` in your `.env` to match production URLs.
Also update the GitHub OAuth App callback URL to your production server URL.

---

## Game Mechanics

### XP Formula
```
XP = (score/100 × base_reward) + token_efficiency_bonus
```
Token efficiency bonus: up to +50 XP for using fewer tokens than the budget.

### Levels
```
Level = floor(1 + sqrt(XP / 100))
```

### Challenge Types
- **prompt-craft** — write a prompt that makes Claude achieve a specific goal
- **meta-prompt** — write system prompts and instructions
- **efficiency** — get the job done with as few tokens as possible
- **reasoning** — guide Claude through multi-step thinking

---

Built with Claude Code × Dakota Cohort
