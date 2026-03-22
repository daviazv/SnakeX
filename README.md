# 🐍 SnakeX — Cyberpunk Snake Game

Jogo da cobrinha moderno com visual neon/cyberpunk, mecânicas avançadas, sistema de progressão e ranking.

## 🚀 Como rodar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000

### Build de produção

```bash
npm run build
npm start
```

---

## 🎮 Controles

| Tecla | Ação |
|-------|------|
| `↑↓←→` ou `WASD` | Mover a cobra |
| `SPACE` ou `1` | Habilidade: BOOST (velocidade) |
| `X` ou `2` | Habilidade: WALL (criar parede) |
| `C` ou `3` | Habilidade: EXPLODE (explosão) |
| `ESC` | Voltar ao menu |

---

## ⚡ Habilidades

- **BOOST** — Aumenta velocidade por 3 segundos. Cooldown: 8s
- **WALL** — Cria uma parede na frente da cobra. Cooldown: 10s
- **EXPLODE** — Explosão ao redor da cobra, remove comida próxima. Cooldown: 12s

---

## 🧬 Sistema de Progressão

- Cada ponto de score = 10 XP
- Níveis desbloqueiam novas skins
- Recorde salvo localmente

## 🎨 Skins disponíveis

| Skin | Nível |
|------|-------|
| Matrix | 0 |
| Neon | 2 |
| Cyber | 4 |
| Inferno | 6 |
| Glacier | 8 |
| Void | 10 |
| Aurum | 15 |
| Plasma | 20 |

---

## 🏗️ Estrutura

```
src/
  app/
    layout.tsx        — Root layout Next.js
    page.tsx          — Máquina de estados de tela
    globals.css       — Estilos globais + fontes
  components/
    game/
      GameCanvas.tsx  — Loop principal do jogo
      HUD.tsx         — Pontuação, nível, cooldowns
      DeathScreen.tsx — Tela de game over
    ui/
      MenuScreen.tsx       — Menu principal animado
      LeaderboardScreen.tsx — Ranking global
      SkinsScreen.tsx      — Seleção de skins
  lib/
    constants.ts  — Configurações e skins
    engine.ts     — Lógica completa do jogo
    renderer.ts   — Renderizador Canvas com efeitos neon
    sound.ts      — Sons via Web Audio API
    store.ts      — Estado global (Zustand + persist)
  services/
    leaderboard.ts — Ranking com localStorage
  types/
    index.ts — Tipos TypeScript
```

---

## 🛠️ Tecnologias

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **TailwindCSS**
- **Canvas API** (renderização do jogo)
- **Zustand** (estado global)
- **Web Audio API** (sons procedurais)
- **@tabler/icons-react** (ícones)
- **Orbitron + Share Tech Mono** (fontes)

---

## 📦 Futuras melhorias

- WebSocket multiplayer com Socket.io
- Backend Node.js + Express para ranking global
- Sistema de replay
- Integração Discord OAuth
- PWA para mobile
# SnakeX
