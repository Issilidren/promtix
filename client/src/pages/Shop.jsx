import { useState, useEffect } from 'react';
import { api } from '../utils/api.js';
import Layout from '../components/Layout.jsx';

const RARITY_COLOR = {
  common:   'rarity-common',
  uncommon: 'rarity-uncommon',
  rare:     'rarity-rare',
  epic:     'rarity-epic',
  legendary:'rarity-legendary',
};

const CAT_ICON = {
  potions:  '⚗',
  crystals: '◈',
  misc:     '⋄',
};

export default function Shop() {
  const [catalog, setCatalog]     = useState([]);
  const [inventory, setInventory] = useState([]);
  const [gold, setGold]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [buying, setBuying]       = useState(null);
  const [message, setMessage]     = useState(null);

  useEffect(() => {
    Promise.all([api.getShop(), api.getWorld()])
      .then(([shop, world]) => {
        setCatalog(shop);
        setInventory(world.inventory ?? []);
        setGold(world.character?.gold ?? 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function buy(itemName) {
    setBuying(itemName);
    setMessage(null);
    try {
      const res = await api.buyItem(itemName);
      setGold(res.gold);
      setInventory(res.inventory);
      setMessage({ type: 'ok', text: `Purchased ${itemName}!` });
    } catch (err) {
      setMessage({ type: 'err', text: err.message });
    } finally {
      setBuying(null);
    }
  }

  return (
    <Layout gold={gold}>
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="text-[10px] font-mono text-game-muted uppercase tracking-widest mb-1">Vendor</div>
            <h1 className="text-xl font-black text-white">Shop</h1>
            <p className="text-game-muted text-xs font-mono mt-1">Bynxi · Shopkeeper</p>
          </div>
          {gold != null && (
            <div className="text-right">
              <div className="text-[10px] text-game-muted font-mono uppercase tracking-widest">Balance</div>
              <div className="neon-gold text-lg font-bold font-mono">{gold}g</div>
            </div>
          )}
        </div>

        {message && (
          <div className={`mb-4 rounded-lg p-3 text-sm font-mono border ${
            message.type === 'ok'
              ? 'bg-green-950/40 border-green-700/40 text-green-300'
              : 'bg-red-950/40 border-red-700/40 text-red-300'
          }`}>
            &gt; {message.text}
          </div>
        )}

        {loading ? (
          <div className="text-center text-game-muted py-20 font-mono">&gt; Loading shop...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {catalog.map(item => {
              const owned = inventory.find(i => i.name === item.name);
              return (
                <div
                  key={item.name}
                  className="bg-game-panel border border-game-border rounded-xl p-4 flex flex-col gap-3 hover:border-game-muted transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xl mb-1">{CAT_ICON[item.category] ?? '⋄'}</div>
                      <div className={`font-bold text-sm ${RARITY_COLOR[item.rarity] ?? 'text-white'}`}>
                        {item.name}
                      </div>
                      <div className={`text-[10px] font-mono capitalize ${RARITY_COLOR[item.rarity] ?? 'text-game-muted'}`}>
                        {item.rarity}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="neon-gold font-bold text-sm font-mono">{item.price}g</div>
                      {owned && (
                        <div className="text-[10px] text-game-muted font-mono">own ×{owned.qty}</div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => buy(item.name)}
                    disabled={buying === item.name || gold < item.price}
                    className="w-full py-2 rounded-lg font-bold text-xs transition-all
                      bg-neon-cyan text-game-bg hover:brightness-110 shadow-neon-sm
                      disabled:opacity-25 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {buying === item.name ? 'Buying...' : `Buy · ${item.price}g`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
