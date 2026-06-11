// Biome visual themes ported from Celestial Shaman's town-world.js
// Three visual themes: moonfall (dark indigo), canopy (warm amber), whispering (violet)
// Promtix biome IDs map to these three palettes.

export const BIOME_LABEL = {
  debug_forest:   'Debug Forest',
  compile_plains: 'Compile Plains',
  runtime_realm:  'Runtime Realm',
  heap_highlands: 'Heap Highlands',
  stack_caverns:  'Stack Caverns',
  null_void:      'Null Void',
  git_grove:      'Git Grove',
  moonfall:       'Moonfall Eden',
  canopy:         'Canopy Heights',
  whispering:     'Whispering Hollow',
};

// Maps Promtix biome IDs to the three Shaman visual themes
export const BIOME_THEME_KEY = {
  debug_forest:   'moonfall',
  compile_plains: 'canopy',
  runtime_realm:  'moonfall',
  heap_highlands: 'canopy',
  stack_caverns:  'moonfall',
  null_void:      'moonfall',
  git_grove:      'whispering',
  moonfall:       'moonfall',
  canopy:         'canopy',
  whispering:     'whispering',
};

// Color palettes from Shaman's town-world.js BIOMES object
export const THEMES = {
  moonfall: {
    displayName:  'Moonfall Eden',
    // sky gradient colors
    skyFrom:      '#2a1850',
    skyMid:       '#1a1040',
    skyTo:        '#0a0820',
    mist:         'rgba(120,80,180,0.10)',
    // accent (treeGlow)
    accent:       '#80ff60',
    accentText:   'text-green-400',
    accentBorder: 'border-green-500/30',
    accentBg:     'bg-green-950/20',
    // particles
    particle:     '#a0ffc0',
    moon:         '#e8e0ff',
  },
  canopy: {
    displayName:  'Canopy Heights',
    skyFrom:      '#402818',
    skyMid:       '#281808',
    skyTo:        '#180800',
    mist:         'rgba(255,140,60,0.08)',
    accent:       '#ff9040',
    accentText:   'text-orange-400',
    accentBorder: 'border-orange-500/30',
    accentBg:     'bg-orange-950/20',
    particle:     '#ffb060',
    moon:         '#ffd0a0',
  },
  whispering: {
    displayName:  'Whispering Hollow',
    skyFrom:      '#4a2060',
    skyMid:       '#301848',
    skyTo:        '#180828',
    mist:         'rgba(180,80,220,0.12)',
    accent:       '#90ff50',
    accentText:   'text-purple-400',
    accentBorder: 'border-purple-500/30',
    accentBg:     'bg-purple-950/20',
    particle:     '#c080ff',
    moon:         '#f0e0ff',
  },
};

// POI definitions from town-world.js TOWN_LAYOUTS.moonfall.pois
// Mapped to Promtix routes
export const TOWN_POIS = [
  { id: 'training',  label: 'Training Grounds', icon: '⚡', path: '/solo',        grid: [8, 2] },
  { id: 'arena',     label: 'Combat Training',  icon: '⚔',  path: '/pvp',         grid: [4, 4] },
  { id: 'spells',    label: 'Spellcraft',        icon: '✦',  path: '/solo',        grid: [12, 4] },
  { id: 'bazaar',    label: 'Eden Bazaar',       icon: '⋄',  path: '/shop',        grid: [4, 8] },
  { id: 'healing',   label: 'Healing Spring',   icon: '⊕',  path: '/coop',        grid: [12, 8] },
  { id: 'yggdrasil', label: 'Yggdrasil',         icon: '❈',  path: '/dashboard',   grid: [8, 6] },
];

export function getBiomeTheme(biomeId) {
  const key = BIOME_THEME_KEY[biomeId] || 'moonfall';
  return THEMES[key];
}
