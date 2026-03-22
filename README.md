# 🐍 SnakeX v3.0 — Cyberpunk Snake Game

Jogo da cobrinha moderno com autenticação, ranking global real, multiplayer e visual neon/cyberpunk.

---

## 🚀 Setup rápido

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```env
MONGODB_URI=mongodb+srv://SEU_USER:SUA_SENHA@cluster0.xxxxx.mongodb.net/snakex?retryWrites=true&w=majority
JWT_SECRET=uma_string_aleatoria_longa_aqui_minimo_32_chars
PORT=3000
```

#### Como obter o MONGODB_URI:
1. Acesse https://cloud.mongodb.com
2. Crie um cluster gratuito (M0)
3. Em **Database Access** → crie um usuário com senha
4. Em **Network Access** → adicione `0.0.0.0/0` (permite qualquer IP)
5. Em **Connect** → escolha "Connect your application" → copie a string e substitua `<password>`

### 3. Rodar
```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 🎮 Controles

| Tecla | Ação |
|-------|------|
| `↑↓←→` ou `WASD` | Mover |
| `SPACE` ou `1` | BOOST |
| `X` ou `2` | WALL |
| `C` ou `3` | EXPLODE |
| `ESC` | Menu |

Mobile: swipe + D-pad virtual

---

## 🏗️ Arquitetura

```
src/
  app/
    api/
      auth/
        register/   POST - cria conta
        login/      POST - faz login (JWT em cookie HttpOnly)
        logout/     POST - remove cookie
        me/         GET  - retorna usuário logado
      leaderboard/  GET  - top 20 global do MongoDB
      user/sync/    POST - salva score/level/skin após partida
    layout.tsx
    page.tsx        máquina de estados principal
    globals.css
  components/
    game/           GameCanvas, HUD, DeathScreen, TouchControls
    multi/          MultiplayerPage, LobbyMenu, WaitingRoom,
                    MultiGameCanvas, MultiHUD, MultiGameOver
    ui/             AuthGate, MenuScreen, LeaderboardScreen, SkinsScreen
  lib/
    auth.ts         JWT sign/verify, cookie helpers
    authStore.ts    Zustand store do usuário logado
    constants.ts    Skins, grid, velocidade, XP
    db.ts           Mongoose connection singleton
    engine.ts       Lógica do jogo solo
    multiRenderer.ts Renderer Canvas multiplayer
    renderer.ts     Renderer Canvas solo
    sound.ts        Web Audio API
    store.ts        (legado - mantido para compatibilidade)
  models/
    User.ts         Schema MongoDB: username, email, hash, score, skins
  hooks/
    useMultiplayer.ts Socket.io client hook
  services/
    leaderboard.ts  (legado localStorage - substituído pela API)
  types/
    index.ts        Tipos base
    multi.ts        Tipos multiplayer
```

---

## 🔐 Auth flow

1. Usuário cria conta (`POST /api/auth/register`) ou faz login (`POST /api/auth/login`)
2. Servidor retorna JWT em cookie `HttpOnly` (não acessível via JS)
3. `AuthGate` chama `GET /api/auth/me` ao montar — hidrata o estado global
4. Ao morrer no jogo, `POST /api/user/sync` salva o score no MongoDB
5. Ranking lê diretamente do MongoDB via `GET /api/leaderboard`

---

## 🌐 Multiplayer

- Socket.io no mesmo processo Node.js que o Next.js (`server.js`)
- Sala pública: entra em qualquer sala aberta, ou cria uma nova
- Sala privada: gera código de 6 letras para compartilhar
- Colisão clássica: quem bate na outra cobra morre
- Máx 8 jogadores por sala
- Habilidades funcionam no multi (BOOST, WALL, EXPLODE)

---

## 🛠️ Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **MongoDB Atlas** + **Mongoose** (dados persistentes)
- **JWT** em cookies HttpOnly (auth segura)
- **Socket.io** (multiplayer em tempo real)
- **TailwindCSS** + **Canvas API**
- **Zustand** (estado global)
- **Web Audio API** (sons sem arquivos externos)
- **@tabler/icons-react**
- Fontes: **Orbitron** + **Share Tech Mono**
