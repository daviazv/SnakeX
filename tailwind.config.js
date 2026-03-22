/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'monospace'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        neon: {
          green: '#00ff88',
          cyan: '#00e5ff',
          pink: '#ff0080',
          orange: '#ff6600',
          purple: '#8000ff',
          yellow: '#ffee00',
        },
        dark: {
          900: '#020408',
          800: '#050c12',
          700: '#081018',
          600: '#0d1a24',
          500: '#122030',
          400: '#1a2d3d',
          300: '#243d52',
        },
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'flicker': 'flicker 3s linear infinite',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'glow-pulse': 'glow-pulse 1.5s ease-in-out infinite',
        'scan-line': 'scan-line 4s linear infinite',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.8', filter: 'brightness(1.3)' },
        },
        'flicker': {
          '0%, 95%, 100%': { opacity: '1' },
          '96%': { opacity: '0.8' },
          '97%': { opacity: '1' },
          '98%': { opacity: '0.6' },
          '99%': { opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          from: { transform: 'translateY(-20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          from: { transform: 'scale(0.9)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px currentColor, 0 0 20px currentColor' },
          '50%': { boxShadow: '0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
      boxShadow: {
        'neon-green': '0 0 10px #00ff88, 0 0 20px #00ff88, 0 0 40px #00ff8840',
        'neon-cyan': '0 0 10px #00e5ff, 0 0 20px #00e5ff, 0 0 40px #00e5ff40',
        'neon-pink': '0 0 10px #ff0080, 0 0 20px #ff0080, 0 0 40px #ff008040',
        'neon-orange': '0 0 10px #ff6600, 0 0 20px #ff6600, 0 0 40px #ff660040',
        'neon-purple': '0 0 10px #8000ff, 0 0 20px #8000ff, 0 0 40px #8000ff40',
      },
    },
  },
  plugins: [],
}
