-- PROMTIX: Game-Only Schema
-- Simplified from full schema - removes work features, consolidates admin/user tables
-- Focus: Player accounts, characters, combat, inventory, leaderboard

-- Users (Core identity)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Player Profiles (Game identity)
CREATE TABLE player_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  bio TEXT,
  level INT DEFAULT 1,
  experience INT DEFAULT 0,
  total_wins INT DEFAULT 0,
  total_losses INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Characters (Player's game character)
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  class VARCHAR(50) NOT NULL, -- warrior, mage, rogue, etc.
  level INT DEFAULT 1,
  experience INT DEFAULT 0,
  health INT DEFAULT 100,
  max_health INT DEFAULT 100,
  mana INT DEFAULT 50,
  max_mana INT DEFAULT 50,
  strength INT DEFAULT 10,
  agility INT DEFAULT 10,
  intelligence INT DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Skills (Learnable combat abilities)
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  skill_type VARCHAR(50) NOT NULL, -- attack, defend, magic
  mana_cost INT DEFAULT 0,
  cooldown_seconds INT DEFAULT 0,
  damage_min INT,
  damage_max INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Character Skills (What skills does this character know?)
CREATE TABLE character_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  learned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(character_id, skill_id)
);

-- Items (Weapons, armor, consumables)
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  item_type VARCHAR(50) NOT NULL, -- weapon, armor, consumable
  rarity VARCHAR(50) DEFAULT 'common', -- common, uncommon, rare, epic
  level_required INT DEFAULT 1,
  attack_bonus INT DEFAULT 0,
  defense_bonus INT DEFAULT 0,
  health_bonus INT DEFAULT 0,
  price INT DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Character Inventory
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  quantity INT DEFAULT 1,
  slot INT, -- 0-9 for equipment slots, null for general inventory
  equipped BOOLEAN DEFAULT FALSE,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(character_id, item_id, slot)
);

-- Battles/Matches (PvP and PvE)
CREATE TABLE battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_type VARCHAR(50) NOT NULL, -- pvp, solo_challenge
  player1_id UUID REFERENCES users(id) ON DELETE SET NULL,
  player2_id UUID REFERENCES users(id) ON DELETE SET NULL,
  player1_character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
  player2_character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
  winner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  loser_id UUID REFERENCES users(id) ON DELETE SET NULL,
  battle_log JSONB, -- stores turn-by-turn combat data
  duration_seconds INT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Challenges (Solo/PvE content)
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  difficulty VARCHAR(50) NOT NULL, -- beginner, intermediate, advanced
  level_required INT DEFAULT 1,
  reward_exp INT DEFAULT 100,
  reward_gold INT DEFAULT 50,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Challenge Attempts (Track player progress)
CREATE TABLE challenge_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  attempts INT DEFAULT 0,
  best_time_seconds INT,
  rewards_claimed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Leaderboard (Cached for performance)
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(255) NOT NULL,
  level INT DEFAULT 1,
  total_wins INT DEFAULT 0,
  win_rate FLOAT DEFAULT 0.0,
  total_battles INT DEFAULT 0,
  rating INT DEFAULT 1600, -- ELO rating
  last_battle_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Shop Inventory (What items are available for sale?)
CREATE TABLE shop_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  town VARCHAR(100) NOT NULL, -- different shops in different towns
  stock INT DEFAULT 99,
  price_multiplier FLOAT DEFAULT 1.0,
  refresh_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_restocked TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS disabled for now — policies will be added once app is wired up

-- Indexes for performance
CREATE INDEX idx_characters_user_id ON characters(user_id);
CREATE INDEX idx_inventory_character_id ON inventory(character_id);
CREATE INDEX idx_character_skills_character_id ON character_skills(character_id);
CREATE INDEX idx_battles_player1_id ON battles(player1_id);
CREATE INDEX idx_battles_player2_id ON battles(player2_id);
CREATE INDEX idx_battles_created_at ON battles(created_at DESC);
CREATE INDEX idx_leaderboard_rating ON leaderboard(rating DESC);
CREATE INDEX idx_leaderboard_level ON leaderboard(level DESC);
CREATE INDEX idx_challenges_difficulty ON challenges(difficulty);
CREATE INDEX idx_shop_inventory_town ON shop_inventory(town);
