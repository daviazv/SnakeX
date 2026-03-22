import { create } from 'zustand'
import type { SkinId } from '@/types'

export interface AuthUser {
  id: string
  username: string
  level: number
  xp: number
  highScore: number
  skin: SkinId
  unlockedSkins: SkinId[]
}

interface AuthStore {
  user: AuthUser | null
  loading: boolean
  setUser: (u: AuthUser | null) => void
  setLoading: (v: boolean) => void
  logout: () => Promise<void>
  syncProgress: (data: Partial<AuthUser> & { score?: number }) => Promise<void>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    set({ user: null })
  },

  syncProgress: async (data) => {
    const { user } = get()
    if (!user) return

    const payload = {
      score: data.score ?? 0,
      level: data.level ?? user.level,
      xp: data.xp ?? user.xp,
      skin: data.skin ?? user.skin,
      unlockedSkins: data.unlockedSkins ?? user.unlockedSkins,
    }

    try {
      const res = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const { highScore } = await res.json()
        set((s) => ({
          user: s.user ? {
            ...s.user,
            highScore: Math.max(s.user.highScore, highScore ?? 0),
            level: Math.max(s.user.level, payload.level),
            xp: payload.xp,
            skin: payload.skin,
            unlockedSkins: payload.unlockedSkins,
          } : null,
        }))
      }
    } catch {
    }
  },
}))
