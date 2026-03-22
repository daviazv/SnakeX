import type {
  Direction,
  GameState,
  Food,
  Wall,
  AbilityType,
  Particle,
  ExplosionEffect,
  SnakeSegment,
} from '@/types'
import {
  GRID_SIZE,
  CANVAS_COLS,
  CANVAS_ROWS,
  BASE_SPEED,
  BOOST_SPEED,
  BOOST_DURATION,
  BOOST_COOLDOWN,
  WALL_DURATION,
  WALL_COOLDOWN,
  EXPLODE_COOLDOWN,
  EXPLODE_RADIUS,
} from '@/lib/constants'

export function createInitialGameState(): GameState {
  const centerX = Math.floor(CANVAS_COLS / 2)
  const centerY = Math.floor(CANVAS_ROWS / 2)

  return {
    phase: 'PLAYING',
    snake: [
      { x: centerX, y: centerY, direction: 'RIGHT' },
      { x: centerX - 1, y: centerY, direction: 'RIGHT' },
      { x: centerX - 2, y: centerY, direction: 'RIGHT' },
    ],
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    food: [spawnFood([])],
    walls: [],
    score: 0,
    tick: 0,
    speed: BASE_SPEED,
    gridSize: GRID_SIZE,
    abilities: {
      BOOST: { type: 'BOOST', cooldown: BOOST_COOLDOWN, duration: BOOST_DURATION, active: false, lastUsed: 0 },
      WALL: { type: 'WALL', cooldown: WALL_COOLDOWN, duration: WALL_DURATION, active: false, lastUsed: 0 },
      EXPLODE: { type: 'EXPLODE', cooldown: EXPLODE_COOLDOWN, duration: 500, active: false, lastUsed: 0 },
    },
    explosions: [],
    particles: [],
    boostActive: false,
  }
}

export function spawnFood(occupied: { x: number; y: number }[]): Food {
  let x: number, y: number
  do {
    x = Math.floor(Math.random() * CANVAS_COLS)
    y = Math.floor(Math.random() * CANVAS_ROWS)
  } while (occupied.some((o) => o.x === x && o.y === y))

  const roll = Math.random()
  const type = roll < 0.7 ? 'normal' : roll < 0.9 ? 'bonus' : 'mega'
  const value = type === 'normal' ? 10 : type === 'bonus' ? 25 : 50

  return { x, y, type, value, spawnTime: Date.now() }
}

export function tickGame(
  state: GameState,
  onEat: (points: number) => void,
  onDeath: () => void
): GameState {
  if (state.phase !== 'PLAYING') return state

  const now = Date.now()
  const newState = { ...state }
  newState.tick = state.tick + 1
  newState.direction = state.nextDirection

  const head = newState.snake[0]
  const newHead = moveHead(head, newState.direction)

  if (isOutOfBounds(newHead) || collidesWithBody(newHead, newState.snake) || collidesWithWall(newHead, newState.walls)) {
    onDeath()
    return { ...newState, phase: 'DEAD' }
  }

  const eatenFoodIdx = newState.food.findIndex((f) => f.x === newHead.x && f.y === newHead.y)
  let grew = false

  if (eatenFoodIdx >= 0) {
    const eaten = newState.food[eatenFoodIdx]
    onEat(eaten.value)
    newState.score += eaten.value
    newState.food = [
      ...newState.food.filter((_, i) => i !== eatenFoodIdx),
      spawnFood([...newState.snake, ...newState.food.filter((_, i) => i !== eatenFoodIdx)]),
    ]
    if (Math.random() < 0.3 && newState.food.length < 3) {
      newState.food.push(spawnFood([...newState.snake, ...newState.food]))
    }
    grew = true
    newState.particles = [...newState.particles, ...createEatParticles(newHead.x, newHead.y, eaten.type)]
  }

  newState.snake = [
    { ...newHead, direction: newState.direction },
    ...newState.snake.slice(0, grew ? undefined : -1),
  ]

  newState.walls = newState.walls.filter(
    (w) => now - w.spawnTime < w.duration
  )

  newState.particles = updateParticles(newState.particles)
  newState.explosions = updateExplosions(newState.explosions)

  const boostExpiry = state.abilities.BOOST.lastUsed + BOOST_DURATION
  newState.boostActive = state.abilities.BOOST.active && now < boostExpiry
  if (!newState.boostActive && state.boostActive) {
    newState.abilities = {
      ...newState.abilities,
      BOOST: { ...newState.abilities.BOOST, active: false },
    }
  }
  newState.speed = newState.boostActive ? BOOST_SPEED : BASE_SPEED

  return newState
}

export function applyAbility(state: GameState, ability: AbilityType): GameState {
  const now = Date.now()
  const ab = state.abilities[ability]
  const elapsed = now - ab.lastUsed
  if (ab.lastUsed > 0 && elapsed < ab.cooldown) return state

  const newState = { ...state }

  if (ability === 'BOOST') {
    newState.abilities = {
      ...state.abilities,
      BOOST: { ...ab, active: true, lastUsed: now },
    }
    newState.boostActive = true
    newState.speed = BOOST_SPEED
  }

  if (ability === 'WALL') {
    const head = state.snake[0]
    const offset = getDirectionOffset(state.direction)
    const wallX = head.x + offset.x * 2
    const wallY = head.y + offset.y * 2
    if (!isOutOfBounds({ x: wallX, y: wallY })) {
      const newWall: Wall = {
        x: wallX,
        y: wallY,
        duration: WALL_DURATION,
        spawnTime: now,
      }
      newState.walls = [...state.walls, newWall]
    }
    newState.abilities = {
      ...state.abilities,
      WALL: { ...ab, active: true, lastUsed: now },
    }
  }

  if (ability === 'EXPLODE') {
    const head = state.snake[0]
    const explosion: ExplosionEffect = {
      x: head.x,
      y: head.y,
      radius: 0,
      maxRadius: EXPLODE_RADIUS,
      progress: 0,
      color: '#ff6600',
    }

    const removedFood = state.food.filter((f) => {
      const dist = Math.sqrt(Math.pow(f.x - head.x, 2) + Math.pow(f.y - head.y, 2))
      return dist > EXPLODE_RADIUS
    })
    const newFoodCount = state.food.length - removedFood.length
    const newFood = [...removedFood]
    for (let i = 0; i < newFoodCount; i++) {
      newFood.push(spawnFood([...state.snake, ...newFood]))
    }

    newState.food = newFood
    newState.explosions = [...state.explosions, explosion]
    newState.particles = [...state.particles, ...createExplosionParticles(head.x, head.y)]
    newState.abilities = {
      ...state.abilities,
      EXPLODE: { ...ab, active: true, lastUsed: now },
    }
    newState.score += 5
  }

  return newState
}

export function changeDirection(state: GameState, dir: Direction): GameState {
  const opposite: Record<Direction, Direction> = {
    UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT',
  }
  if (opposite[dir] === state.direction) return state
  return { ...state, nextDirection: dir }
}

function moveHead(head: SnakeSegment, dir: Direction): SnakeSegment {
  const offsets: Record<Direction, { x: number; y: number }> = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
  }
  const o = offsets[dir]
  return { x: head.x + o.x, y: head.y + o.y, direction: dir }
}

function getDirectionOffset(dir: Direction): { x: number; y: number } {
  const offsets: Record<Direction, { x: number; y: number }> = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
  }
  return offsets[dir]
}

function isOutOfBounds(p: { x: number; y: number }): boolean {
  return p.x < 0 || p.x >= CANVAS_COLS || p.y < 0 || p.y >= CANVAS_ROWS
}

function collidesWithBody(head: SnakeSegment, snake: SnakeSegment[]): boolean {
  return snake.slice(1).some((s) => s.x === head.x && s.y === head.y)
}

function collidesWithWall(head: SnakeSegment, walls: Wall[]): boolean {
  return walls.some((w) => w.x === head.x && w.y === head.y)
}

function createEatParticles(x: number, y: number, type: Food['type']): Particle[] {
  const colors = { normal: '#00ff88', bonus: '#ffee00', mega: '#ff6600' }
  const color = colors[type]
  const count = type === 'mega' ? 12 : type === 'bonus' ? 8 : 5
  return Array.from({ length: count }, () => ({
    x: (x + 0.5) * GRID_SIZE,
    y: (y + 0.5) * GRID_SIZE,
    vx: (Math.random() - 0.5) * 4,
    vy: (Math.random() - 0.5) * 4,
    life: 1,
    maxLife: 1,
    color,
    size: Math.random() * 4 + 2,
  }))
}

function createExplosionParticles(x: number, y: number): Particle[] {
  return Array.from({ length: 20 }, () => ({
    x: (x + 0.5) * GRID_SIZE,
    y: (y + 0.5) * GRID_SIZE,
    vx: (Math.random() - 0.5) * 8,
    vy: (Math.random() - 0.5) * 8,
    life: 1,
    maxLife: 1,
    color: Math.random() > 0.5 ? '#ff6600' : '#ffee00',
    size: Math.random() * 6 + 3,
  }))
}

function updateParticles(particles: Particle[]): Particle[] {
  return particles
    .map((p) => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      vy: p.vy + 0.1,
      life: p.life - 0.05,
    }))
    .filter((p) => p.life > 0)
}

function updateExplosions(explosions: ExplosionEffect[]): ExplosionEffect[] {
  return explosions
    .map((e) => ({
      ...e,
      progress: e.progress + 0.06,
      radius: e.maxRadius * Math.min(e.progress + 0.06, 1),
    }))
    .filter((e) => e.progress < 1.5)
}
