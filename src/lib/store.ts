import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PlayerState, SkinId } from '@/types'
import { levelFromXp, XP_PER_POINT } from '@/lib/constants'

interface PlayerStore {
  player: PlayerState
  setName: (name: string) => void
  addScore: (points: number) => void
  resetScore: () => void
  setSkin: (skin: SkinId) => void
  unlockSkin: (skin: SkinId) => void
  checkAndUnlockSkins: () => void
}

const defaultPlayer: PlayerState = {
  id: Math.random().toString(36).slice(2),
  name: 'PLAYER_01',
  score: 0,
  level: 1,
  xp: 0,
  xpToNext: 100,
  skin: 'default',
  unlockedSkins: ['default'],
  highScore: 0,
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      player: defaultPlayer,

      setName: (name) =>
        set((s) => ({ player: { ...s.player, name: name.slice(0, 16).toUpperCase() } })),

      addScore: (points) => {
        const { player } = get()
        const newScore = player.score + points
        const totalXpGained = points * XP_PER_POINT
        const totalXp = player.xp + totalXpGained + sumXpForLevels(player.level, player.xpToNext)
        const { level, xp, xpToNext } = levelFromXp(totalXp)
        set((s) => ({
          player: {
            ...s.player,
            score: newScore,
            level,
            xp,
            xpToNext,
            highScore: Math.max(s.player.highScore, newScore),
          },
        }))
        get().checkAndUnlockSkins()
      },

      resetScore: () => set((s) => ({ player: { ...s.player, score: 0 } })),

      setSkin: (skin) =>
        set((s) => ({
          player: { ...s.player, skin },
        })),

      unlockSkin: (skin) =>
        set((s) => ({
          player: {
            ...s.player,
            unlockedSkins: s.player.unlockedSkins.includes(skin)
              ? s.player.unlockedSkins
              : [...s.player.unlockedSkins, skin],
          },
        })),

      checkAndUnlockSkins: () => {
        const { player } = get()
        const { SKINS } = require('@/lib/constants')
        SKINS.forEach((skin: { id: SkinId; requiredLevel: number }) => {
          if (player.level >= skin.requiredLevel && !player.unlockedSkins.includes(skin.id)) {
            get().unlockSkin(skin.id)
          }
        })
      },
    }),
    { name: 'snakex-player' }
  )
)

function sumXpForLevels(currentLevel: number, currentXp: number): number {
  const { xpForLevel } = require('@/lib/constants')
  let total = currentXp
  for (let i = 1; i < currentLevel; i++) {
    total += xpForLevel(i)
  }
  return total
}
