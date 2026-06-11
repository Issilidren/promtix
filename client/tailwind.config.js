/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        game: {
          bg:     '#05050f',
          panel:  '#090920',
          card:   '#0f0f2a',
          border: '#1e1e40',
          muted:  '#3a3a5a',
        },
        neon: {
          cyan:   '#00e5ff',
          pink:   '#e040fb',
          purple: '#7c3aed',
        },
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0,229,255,0.25), 0 0 30px rgba(0,229,255,0.1)',
        'neon-pink': '0 0 15px rgba(224,64,251,0.25), 0 0 30px rgba(224,64,251,0.1)',
        'neon-sm':   '0 0 8px rgba(0,229,255,0.35)',
      },
    },
  },
  plugins: [],
};
