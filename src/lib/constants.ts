import type { SkinConfig } from '@/types'

export const SKINS: SkinConfig[] = [
  {
    id: 'default',
    name: 'Matrix',
    requiredLevel: 0,
    headColor: '#00ff88',
    bodyColor: '#00cc66',
    glowColor: '#00ff88',
    trailColor: '#00ff8840',
    pattern: 'solid',
  },
  {
    id: 'neon',
    name: 'Neon',
    requiredLevel: 2,
    headColor: '#00e5ff',
    bodyColor: '#0088cc',
    glowColor: '#00e5ff',
    trailColor: '#00e5ff40',
    pattern: 'pulse',
  },
  {
    id: 'cyber',
    name: 'Cyber',
    requiredLevel: 4,
    headColor: '#ff0080',
    bodyColor: '#cc0066',
    glowColor: '#ff0080',
    trailColor: '#ff008040',
    pattern: 'gradient',
  },
  {
    id: 'fire',
    name: 'Inferno',
    requiredLevel: 6,
    headColor: '#ff6600',
    bodyColor: '#cc3300',
    glowColor: '#ff6600',
    trailColor: '#ff660040',
    pattern: 'gradient',
  },
  {
    id: 'ice',
    name: 'Glacier',
    requiredLevel: 8,
    headColor: '#88ccff',
    bodyColor: '#4488cc',
    glowColor: '#88ccff',
    trailColor: '#88ccff40',
    pattern: 'solid',
  },
  {
    id: 'void',
    name: 'Void',
    requiredLevel: 10,
    headColor: '#8000ff',
    bodyColor: '#5500cc',
    glowColor: '#8000ff',
    trailColor: '#8000ff40',
    pattern: 'pulse',
  },
  {
    id: 'gold',
    name: 'Aurum',
    requiredLevel: 15,
    headColor: '#ffee00',
    bodyColor: '#ccaa00',
    glowColor: '#ffee00',
    trailColor: '#ffee0040',
    pattern: 'gradient',
  },
  {
    id: 'plasma',
    name: 'Plasma',
    requiredLevel: 20,
    headColor: '#ffffff',
    bodyColor: '#aaaaff',
    glowColor: '#ffffff',
    trailColor: '#ffffff40',
    pattern: 'rainbow',
  },
]

export const GRID_SIZE = 20
export const CANVAS_COLS = 30
export const CANVAS_ROWS = 25
export const BASE_SPEED = 140
export const BOOST_SPEED = 65
export const BOOST_DURATION = 3000
export const BOOST_COOLDOWN = 8000
export const WALL_DURATION = 6000
export const WALL_COOLDOWN = 10000
export const EXPLODE_COOLDOWN = 12000
export const EXPLODE_RADIUS = 3
export const XP_PER_POINT = 10
export const XP_MULTIPLIER_PER_LEVEL = 1.4

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(XP_MULTIPLIER_PER_LEVEL, level - 1))
}

export function levelFromXp(totalXp: number): { level: number; xp: number; xpToNext: number } {
  let level = 1
  let remaining = totalXp
  while (true) {
    const needed = xpForLevel(level)
    if (remaining < needed) break
    remaining -= needed
    level++
  }
  return { level, xp: remaining, xpToNext: xpForLevel(level) }
}

export function getSkin(id: string): SkinConfig {
  return SKINS.find((s) => s.id === id) ?? SKINS[0]
}
