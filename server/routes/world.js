import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getDB } from '../db/index.js';

const router = Router();

const SHOP_CATALOG = [
  { name: 'Healing Potion',       price: 25,  rarity: 'common',   category: 'potions' },
  { name: 'Greater Healing Potion', price: 60, rarity: 'uncommon', category: 'potions' },
  { name: 'Phoenix Down',         price: 120, rarity: 'rare',     category: 'misc'    },
  { name: 'Void Shard',           price: 50,  rarity: 'uncommon', category: 'crystals'},
  { name: 'Chrono Restoration Flask', price: 100, rarity: 'rare', category: 'potions' },
  { name: 'Copper Grove Token',   price: 20,  rarity: 'common',   category: 'crystals'},
];

router.get('/events', (_req, res) => {
  const now = new Date().toISOString();
  const events = getDB().prepare(
    'SELECT id, name, ends_at FROM world_events WHERE active = 1 AND ends_at > ? ORDER BY ends_at ASC'
  ).all(now);
  res.json(events);
});

router.get('/npcs', (_req, res) => {
  const npcs = getDB().prepare('SELECT * FROM npcs').all();
  res.json(npcs.map(n => ({ ...n, lines: JSON.parse(n.lines) })));
});

router.get('/shop', (_req, res) => {
  res.json(SHOP_CATALOG);
});

router.post('/shop/buy', requireAuth, (req, res) => {
  const { item_name, qty = 1 } = req.body;
  if (!item_name || qty < 1) return res.status(400).json({ error: 'item_name and qty (>= 1) are required' });

  const item = SHOP_CATALOG.find(i => i.name === item_name);
  if (!item) return res.status(404).json({ error: 'Item not in shop' });

  const db = getDB();
  const character = db.prepare('SELECT gold FROM player_character WHERE player_id = ?').get(req.user.id);
  if (!character) return res.status(404).json({ error: 'Character not found — create your character first' });

  const cost = item.price * qty;
  if (character.gold < cost) {
    return res.status(400).json({ error: `Not enough gold. Need ${cost}, have ${character.gold}` });
  }

  db.prepare('UPDATE player_character SET gold = gold - ? WHERE player_id = ?').run(cost, req.user.id);

  const existing = db.prepare('SELECT qty FROM player_inventory WHERE player_id = ? AND name = ?').get(req.user.id, item_name);
  if (existing) {
    db.prepare('UPDATE player_inventory SET qty = qty + ? WHERE player_id = ? AND name = ?').run(qty, req.user.id, item_name);
  } else {
    db.prepare('INSERT INTO player_inventory (player_id, name, qty, rarity, category) VALUES (?, ?, ?, ?, ?)').run(req.user.id, item_name, qty, item.rarity, item.category);
  }

  const updatedCharacter = db.prepare('SELECT gold FROM player_character WHERE player_id = ?').get(req.user.id);
  const inventory = db.prepare('SELECT * FROM player_inventory WHERE player_id = ?').all(req.user.id);
  res.json({ gold: updatedCharacter.gold, inventory });
});

export default router;
