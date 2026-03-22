const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const PORT = parseInt(process.env.PORT || '3000', 10)

const COLS = 30
const ROWS = 25
const BASE_SPEED = 140
const BOOST_SPEED = 65
const BOOST_DURATION = 3000
const BOOST_COOLDOWN = 8000
const WALL_DURATION = 6000
const WALL_COOLDOWN = 10000
const EXPLODE_COOLDOWN = 12000
const EXPLODE_RADIUS = 3
const MAX_PLAYERS = 8
const COUNTDOWN_SECS = 3
const MIN_PLAYERS_TO_START = 1

const SKIN_COLORS = {
  default: '#00ff88',
  neon:    '#00e5ff',
  cyber:   '#ff0080',
  fire:    '#ff6600',
  ice:     '#88ccff',
  void:    '#8000ff',
  gold:    '#ffee00',
  plasma:  '#ffffff',
}

function rnd(min, max) { return Math.floor(Math.random() * (max - min)) + min }

function spawnFood(occupied) {
  let x, y, tries = 0
  do {
    x = rnd(0, COLS); y = rnd(0, ROWS); tries++
  } while (tries < 200 && occupied.some(o => o.x === x && o.y === y))
  const roll = Math.random()
  const type = roll < 0.7 ? 'normal' : roll < 0.9 ? 'bonus' : 'mega'
  const value = type === 'normal' ? 10 : type === 'bonus' ? 25 : 50
  return { x, y, type, value, spawnTime: Date.now() }
}

function spawnPositions(count) {
  const positions = [
    { x: 4,          y: Math.floor(ROWS/2), dir: 'RIGHT' },
    { x: COLS - 5,   y: Math.floor(ROWS/2), dir: 'LEFT'  },
    { x: Math.floor(COLS/2), y: 4,          dir: 'DOWN'  },
    { x: Math.floor(COLS/2), y: ROWS - 5,   dir: 'UP'    },
    { x: 4,          y: 4,                  dir: 'RIGHT' },
    { x: COLS - 5,   y: 4,                  dir: 'LEFT'  },
    { x: 4,          y: ROWS - 5,           dir: 'RIGHT' },
    { x: COLS - 5,   y: ROWS - 5,           dir: 'LEFT'  },
  ]
  return positions.slice(0, count)
}

function createSnake(x, y, dir) {
  const offsets = { RIGHT: [-1,0], LEFT: [1,0], UP: [0,1], DOWN: [0,-1] }
  const [ox, oy] = offsets[dir]
  return [
    { x, y, direction: dir },
    { x: x + ox, y: y + oy, direction: dir },
    { x: x + ox*2, y: y + oy*2, direction: dir },
  ]
}

function moveHead(seg, dir) {
  const o = { UP:{x:0,y:-1}, DOWN:{x:0,y:1}, LEFT:{x:-1,y:0}, RIGHT:{x:1,y:0} }[dir]
  return { x: seg.x + o.x, y: seg.y + o.y, direction: dir }
}

function oob(p) { return p.x < 0 || p.x >= COLS || p.y < 0 || p.y >= ROWS }

function makeAbilities() {
  return {
    BOOST:   { type:'BOOST',   cooldown:BOOST_COOLDOWN,   duration:BOOST_DURATION, active:false, lastUsed:0 },
    WALL:    { type:'WALL',    cooldown:WALL_COOLDOWN,     duration:WALL_DURATION,  active:false, lastUsed:0 },
    EXPLODE: { type:'EXPLODE', cooldown:EXPLODE_COOLDOWN,  duration:500,            active:false, lastUsed:0 },
  }
}

const rooms = new Map()

function createRoom(id, isPublic) {
  return {
    id,
    isPublic,
    phase: 'WAITING',
    players: new Map(),
    food: [],
    walls: [],
    tick: 0,
    interval: null,
    countdown: null,
  }
}

function getAllOccupied(room) {
  const pts = [...room.food, ...room.walls]
  for (const p of room.players.values()) pts.push(...p.snake)
  return pts
}

function startCountdown(room, io) {
  let count = COUNTDOWN_SECS
  room.phase = 'COUNTDOWN'
  io.to(room.id).emit('countdown', count)
  room.countdown = setInterval(() => {
    count--
    if (count > 0) {
      io.to(room.id).emit('countdown', count)
    } else {
      clearInterval(room.countdown)
      startGame(room, io)
    }
  }, 1000)
}

function startGame(room, io) {
  room.phase = 'PLAYING'
  room.tick = 0
  room.food = []
  room.walls = []

  const playerList = [...room.players.values()]
  const positions = spawnPositions(playerList.length)

  playerList.forEach((p, i) => {
    const pos = positions[i]
    p.snake = createSnake(pos.x, pos.y, pos.dir)
    p.direction = pos.dir
    p.nextDirection = pos.dir
    p.score = 0
    p.alive = true
    p.abilities = makeAbilities()
    p.boostActive = false
    p.boostEnd = 0
  })

  for (let i = 0; i < 3; i++) {
    room.food.push(spawnFood(getAllOccupied(room)))
  }

  io.to(room.id).emit('gameStart', buildSnapshot(room))

  const speed = BASE_SPEED
  room.interval = setInterval(() => tickRoom(room, io), speed)
}

function tickRoom(room, io) {
  if (room.phase !== 'PLAYING') return
  room.tick++
  const now = Date.now()

  const alivePlayers = [...room.players.values()].filter(p => p.alive)
  if (alivePlayers.length === 0) {
    endGame(room, io)
    return
  }
  if (alivePlayers.length === 1 && room.players.size > 1) {
    endGame(room, io)
    return
  }

  for (const p of alivePlayers) {
    p.direction = p.nextDirection
    if (p.boostActive && now > p.boostEnd) {
      p.boostActive = false
      p.abilities.BOOST.active = false
    }
  }

  const newHeads = new Map()
  for (const p of alivePlayers) {
    const head = moveHead(p.snake[0], p.direction)
    newHeads.set(p.id, head)
  }

  const toKill = new Set()
  for (const [id, head] of newHeads) {
    if (oob(head)) { toKill.add(id); continue }

    for (const p2 of room.players.values()) {
      if (!p2.alive) continue
      const bodyToCheck = p2.id === id ? p2.snake.slice(1) : p2.snake
      if (bodyToCheck.some(s => s.x === head.x && s.y === head.y)) {
        toKill.add(id); break
      }
    }

    if (room.walls.some(w => w.x === head.x && w.y === head.y)) {
      toKill.add(id)
    }
  }

  for (const id of toKill) {
    const p = room.players.get(id)
    if (p) {
      p.alive = false
      io.to(room.id).emit('playerDied', { playerId: id, score: p.score })
    }
  }

  for (const p of alivePlayers) {
    if (toKill.has(p.id)) continue
    const head = newHeads.get(p.id)

    const foodIdx = room.food.findIndex(f => f.x === head.x && f.y === head.y)
    let grew = false
    if (foodIdx >= 0) {
      const eaten = room.food[foodIdx]
      p.score += eaten.value
      room.food.splice(foodIdx, 1)
      room.food.push(spawnFood(getAllOccupied(room)))
      grew = true
    }

    p.snake = [head, ...p.snake.slice(0, grew ? undefined : -1)]
  }

  room.walls = room.walls.filter(w => now - w.spawnTime < w.duration)

  io.to(room.id).emit('tick', buildSnapshot(room))
}

function endGame(room, io) {
  clearInterval(room.interval)
  room.interval = null
  room.phase = 'ENDED'

  const scores = [...room.players.values()].map(p => ({ id: p.id, name: p.name, score: p.score, skin: p.skin }))
  scores.sort((a, b) => b.score - a.score)
  io.to(room.id).emit('gameOver', { scores })

  setTimeout(() => {
    room.phase = 'WAITING'
    for (const p of room.players.values()) {
      p.ready = false
    }
    io.to(room.id).emit('backToLobby', buildLobbyState(room))
  }, 8000)
}

function buildSnapshot(room) {
  const players = {}
  for (const [id, p] of room.players) {
    players[id] = {
      id: p.id,
      name: p.name,
      skin: p.skin,
      snake: p.snake,
      direction: p.direction,
      score: p.score,
      alive: p.alive,
      boostActive: p.boostActive,
      abilities: p.abilities,
    }
  }
  return {
    tick: room.tick,
    phase: room.phase,
    players,
    food: room.food,
    walls: room.walls,
  }
}

function buildLobbyState(room) {
  const players = [...room.players.values()].map(p => ({
    id: p.id, name: p.name, skin: p.skin, ready: p.ready,
  }))
  return { roomId: room.id, isPublic: room.isPublic, phase: room.phase, players }
}

function generateRoomId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

function findOrCreatePublicRoom() {
  for (const room of rooms.values()) {
    if (room.isPublic && room.phase === 'WAITING' && room.players.size < MAX_PLAYERS) {
      return room
    }
  }
  const id = generateRoomId()
  const room = createRoom(id, true)
  rooms.set(id, room)
  return room
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    path: '/api/socket',
  })

  io.on('connection', (socket) => {
    let currentRoom = null
    let playerId = null

    socket.on('joinPublic', ({ name, skin, id }) => {
      playerId = id
      const room = findOrCreatePublicRoom()
      currentRoom = room

      room.players.set(id, {
        id, name, skin,
        snake: [],
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
        score: 0,
        alive: true,
        ready: false,
        abilities: makeAbilities(),
        boostActive: false,
        boostEnd: 0,
        socketId: socket.id,
      })

      socket.join(room.id)
      socket.emit('joinedRoom', { roomId: room.id, isPublic: true })
      io.to(room.id).emit('lobbyUpdate', buildLobbyState(room))
    })

    socket.on('createPrivate', ({ name, skin, id }) => {
      playerId = id
      const roomId = generateRoomId()
      const room = createRoom(roomId, false)
      rooms.set(roomId, room)
      currentRoom = room

      room.players.set(id, {
        id, name, skin,
        snake: [],
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
        score: 0,
        alive: true,
        ready: false,
        abilities: makeAbilities(),
        boostActive: false,
        boostEnd: 0,
        socketId: socket.id,
      })

      socket.join(roomId)
      socket.emit('joinedRoom', { roomId, isPublic: false })
      io.to(roomId).emit('lobbyUpdate', buildLobbyState(room))
    })

    socket.on('joinPrivate', ({ roomId, name, skin, id }) => {
      playerId = id
      const room = rooms.get(roomId.toUpperCase())
      if (!room) { socket.emit('error', 'Sala não encontrada'); return }
      if (room.players.size >= MAX_PLAYERS) { socket.emit('error', 'Sala cheia'); return }
      if (room.phase !== 'WAITING') { socket.emit('error', 'Partida já em andamento'); return }

      currentRoom = room
      room.players.set(id, {
        id, name, skin,
        snake: [],
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
        score: 0,
        alive: true,
        ready: false,
        abilities: makeAbilities(),
        boostActive: false,
        boostEnd: 0,
        socketId: socket.id,
      })

      socket.join(room.id)
      socket.emit('joinedRoom', { roomId: room.id, isPublic: false })
      io.to(room.id).emit('lobbyUpdate', buildLobbyState(room))
    })

    socket.on('setReady', ({ ready }) => {
      if (!currentRoom || !playerId) return
      const p = currentRoom.players.get(playerId)
      if (p) p.ready = ready
      io.to(currentRoom.id).emit('lobbyUpdate', buildLobbyState(currentRoom))

      const all = [...currentRoom.players.values()]
      const allReady = all.length >= MIN_PLAYERS_TO_START && all.every(p => p.ready)
      if (allReady && currentRoom.phase === 'WAITING') {
        startCountdown(currentRoom, io)
      }
    })

    socket.on('direction', ({ dir }) => {
      if (!currentRoom || !playerId) return
      const p = currentRoom.players.get(playerId)
      if (!p || !p.alive) return
      const opposite = { UP:'DOWN', DOWN:'UP', LEFT:'RIGHT', RIGHT:'LEFT' }
      if (opposite[dir] !== p.direction) p.nextDirection = dir
    })

    socket.on('ability', ({ ability }) => {
      if (!currentRoom || !playerId) return
      const p = currentRoom.players.get(playerId)
      if (!p || !p.alive) return
      const now = Date.now()
      const ab = p.abilities[ability]
      if (!ab || (ab.lastUsed > 0 && now - ab.lastUsed < ab.cooldown)) return

      if (ability === 'BOOST') {
        p.boostActive = true
        p.boostEnd = now + BOOST_DURATION
        p.abilities.BOOST = { ...ab, active: true, lastUsed: now }
      }

      if (ability === 'WALL') {
        const head = p.snake[0]
        const o = { UP:{x:0,y:-1}, DOWN:{x:0,y:1}, LEFT:{x:-1,y:0}, RIGHT:{x:1,y:0} }[p.direction]
        const wx = head.x + o.x * 2, wy = head.y + o.y * 2
        if (!oob({ x:wx, y:wy })) {
          currentRoom.walls.push({ x:wx, y:wy, duration:WALL_DURATION, spawnTime:now })
        }
        p.abilities.WALL = { ...ab, active: true, lastUsed: now }
      }

      if (ability === 'EXPLODE') {
        const head = p.snake[0]
        currentRoom.food = currentRoom.food.filter(f => {
          return Math.sqrt((f.x-head.x)**2 + (f.y-head.y)**2) > EXPLODE_RADIUS
        })
        currentRoom.food.push(spawnFood(getAllOccupied(currentRoom)))
        p.score += 5
        p.abilities.EXPLODE = { ...ab, active: true, lastUsed: now }
        io.to(currentRoom.id).emit('explosion', { x: head.x, y: head.y, playerId })
      }

      io.to(currentRoom.id).emit('abilityUsed', { playerId, ability, abilities: p.abilities })
    })

    socket.on('leaveRoom', () => {
      handleLeave()
    })

    socket.on('disconnect', () => {
      handleLeave()
    })

    function handleLeave() {
      if (!currentRoom || !playerId) return
      currentRoom.players.delete(playerId)
      socket.leave(currentRoom.id)
      io.to(currentRoom.id).emit('lobbyUpdate', buildLobbyState(currentRoom))

      if (currentRoom.players.size === 0) {
        clearInterval(currentRoom.interval)
        clearInterval(currentRoom.countdown)
        rooms.delete(currentRoom.id)
      } else if (currentRoom.phase === 'PLAYING') {
        const alive = [...currentRoom.players.values()].filter(p => p.alive)
        if (alive.length <= 1) endGame(currentRoom, io)
      }

      currentRoom = null
      playerId = null
    }
  })

  httpServer.listen(PORT, () => {
    console.log(`> SnakeX rodando em http://localhost:${PORT}`)
  })
})
