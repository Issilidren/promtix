const STARTER_QUESTS = [
  {
    id: 'main_hello_world',
    title: 'Hello World',
    giver: 'The Terminal',
    objective: 'Complete your first solo prompt challenge.',
    reward_gold: 80,
    reward_xp: 120,
    wins_needed: 1,
    quest_type: 'main'
  },
  {
    id: 'side_bug_hunt',
    title: 'Bug Hunt',
    giver: 'The Debugger',
    objective: 'Win 2 PvP matches.',
    reward_gold: 50,
    reward_xp: 60,
    wins_needed: 2,
    quest_type: 'side'
  },
  {
    id: 'event_code_sprint',
    title: 'Code Sprint',
    giver: 'The Compiler',
    objective: 'Submit 3 prompts during the Code Sprint event.',
    reward_gold: 60,
    reward_xp: 80,
    wins_needed: 3,
    quest_type: 'event'
  },
  {
    id: 'main_first_commit',
    title: 'First Commit',
    giver: 'The Terminal',
    objective: 'Complete 5 solo challenges with a score of 70 or higher.',
    reward_gold: 100,
    reward_xp: 200,
    wins_needed: 5,
    quest_type: 'main'
  },
  {
    id: 'side_coop_learner',
    title: 'Pair Programmer',
    giver: 'The Compiler',
    objective: 'Complete 3 co-op matches with a partner.',
    reward_gold: 70,
    reward_xp: 90,
    wins_needed: 3,
    quest_type: 'side'
  }
];

const NPCS = [
  {
    id: 'bynxi',
    name: 'Bynxi',
    role: 'shopkeeper',
    soul_ref: 'bynxi',
    element: 'lightning',
    archetype: 'Time Mage',
    lines: JSON.stringify([
      "Ohhh! ✨ Welcome to the Faerie Exchange! Time is money, so let's make it quick~",
      "I reorganized everything by shimmer level. Don't ask.",
      "Psst — the Chrono Flask is on sale. Because I said so. ✨"
    ])
  },
  {
    id: 'aziza',
    name: 'Aziza',
    role: 'quest_giver',
    soul_ref: 'aziza',
    element: 'void',
    archetype: 'Arcane Scholar',
    lines: JSON.stringify([
      "Every great coder started with a single line. Yours begins now.",
      "The void between bugs is where understanding lives.",
      "I have a task for you — if you're ready to learn."
    ])
  },
  {
    id: 'belladonna',
    name: 'Belladonna',
    role: 'quest_giver',
    soul_ref: 'belladonna',
    element: 'shadow',
    archetype: 'Shadow Striker',
    lines: JSON.stringify([
      "Not every problem needs a direct solution. Sometimes you route around it.",
      "I've got work that needs doing. Discreet work.",
      "The best code leaves no trace of the struggle it took to write it."
    ])
  },
  {
    id: 'auntie_gem',
    name: 'Auntie Gem',
    role: 'innkeeper',
    soul_ref: 'auntie_gem',
    element: 'light',
    archetype: 'Celestial Warden',
    lines: JSON.stringify([
      "Rest here, child. A clear mind writes better code than a tired one.",
      "I've seen a thousand adventurers pass through. The ones who rest always go further.",
      "Your progress is saved. Go on — you've earned it."
    ])
  },
  {
    id: 'omega_mom',
    name: 'Omega Mom',
    role: 'innkeeper',
    soul_ref: 'omega_mom',
    element: 'nature',
    archetype: 'Nature Healer',
    lines: JSON.stringify([
      "Come in, come in. Everyone's welcome at the grove inn.",
      "I'll restore your party. You just focus on the next challenge.",
      "Nature heals what code cannot. Take a breath."
    ])
  }
];

const WORLD_EVENTS = [
  { name: 'Hackathon', hours: 48 },
  { name: 'Bug Hunt', hours: 24 },
  { name: 'Refactor Storm', hours: 36 },
  { name: 'Code Sprint', hours: 12 },
  { name: 'Deploy Day', hours: 6 }
];

export function seedStatic(db) {
  const insertQuest = db.prepare(`
    INSERT OR IGNORE INTO quests (id, title, giver, objective, reward_gold, reward_xp, wins_needed, quest_type)
    VALUES (@id, @title, @giver, @objective, @reward_gold, @reward_xp, @wins_needed, @quest_type)
  `);
  for (const q of STARTER_QUESTS) insertQuest.run(q);

  const insertNpc = db.prepare(`
    INSERT OR IGNORE INTO npcs (id, name, role, soul_ref, element, archetype, lines)
    VALUES (@id, @name, @role, @soul_ref, @element, @archetype, @lines)
  `);
  for (const n of NPCS) insertNpc.run(n);

  const activeEventCount = db.prepare('SELECT COUNT(*) as cnt FROM world_events WHERE active = 1').get();
  if (activeEventCount.cnt === 0) {
    const event = WORLD_EVENTS[Math.floor(Math.random() * WORLD_EVENTS.length)];
    const endsAt = new Date(Date.now() + event.hours * 60 * 60 * 1000).toISOString();
    db.prepare('INSERT INTO world_events (name, ends_at, active) VALUES (?, ?, 1)').run(event.name, endsAt);
  }
}
