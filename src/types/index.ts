export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

export type AbilityType = 'BOOST' | 'WALL' | 'EXPLODE'

export type SkinId = 'default' | 'neon' | 'cyber' | 'fire' | 'ice' | 'void' | 'gold' | 'plasma'

export interface SkinConfig {
  id: SkinId
  name: string
  requiredLevel: number
  headColor: string
  bodyColor: string
  glowColor: string
  trailColor: string
  pattern: 'solid' | 'gradient' | 'pulse' | 'rainbow'
}

export interface Point {
  x: number
  y: number
}

export interface SnakeSegment extends Point {
  direction: Direction
}

export interface Food {
  x: number
  y: number
  type: 'normal' | 'bonus' | 'mega'
  value: number
  spawnTime: number
}

export interface Wall {
  x: number
  y: number
  duration: number
  spawnTime: number
}

export interface Ability {
  type: AbilityType
  cooldown: number
  duration: number
  active: boolean
  lastUsed: number
}

export interface PlayerState {
  id: string
  name: string
  score: number
  level: number
  xp: number
  xpToNext: number
  skin: SkinId
  unlockedSkins: SkinId[]
  highScore: number
}

export interface GameState {
  phase: 'MENU' | 'PLAYING' | 'PAUSED' | 'DEAD' | 'LEADERBOARD' | 'SKINS'
  snake: SnakeSegment[]
  direction: Direction
  nextDirection: Direction
  food: Food[]
  walls: Wall[]
  score: number
  tick: number
  speed: number
  gridSize: number
  abilities: Record<AbilityType, Ability>
  explosions: ExplosionEffect[]
  particles: Particle[]
  boostActive: boolean
}

export interface ExplosionEffect {
  x: number
  y: number
  radius: number
  maxRadius: number
  progress: number
  color: string
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

export interface LeaderboardEntry {
  rank: number
  playerId: string
  name: string
  score: number
  level: number
  date: string
}
