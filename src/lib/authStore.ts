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
  isGuest?: boolean
}

const GUEST_PREFIXES = ['GHOST','VOID','DARK','NEON','CYBER','NULL','ANON','ROGUE','PIXEL','GLITCH']
const GUEST_SUFFIXES = ['_404','_X','_0','_99','_ERR','_NaN','_VII','_ACE','_HEX','_OG']

function randomGuestName(): string {
  const p = GUEST_PREFIXES[Math.floor(Math.random() * GUEST_PREFIXES.length)]
  const s = GUEST_SUFFIXES[Math.floor(Math.random() * GUEST_SUFFIXES.length)]
  return p + s
}

function guestId(): string {
  return 'guest_' + Math.random().toString(36).slice(2, 10)
}

export function createGuestUser(): AuthUser {
  return {
    id: guestId(),
    username: randomGuestName(),
    level: 1,
    xp: 0,
    highScore: 0,
    skin: 'default',
    unlockedSkins: ['default'],
    isGuest: true,
  }
}

interface AuthStore {
  user: AuthUser | null
  loading: boolean
  setUser: (u: AuthUser | null) => void
  setLoading: (v: boolean) => void
  loginAsGuest: () => void
  logout: () => Promise<void>
  syncProgress: (data: Partial<AuthUser> & { score?: number }) => Promise<void>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  loginAsGuest: () => set({ user: createGuestUser() }),

  logout: async () => {
    const { user } = get()
    if (!user?.isGuest) {
      await fetch('/api/auth/logout', { method: 'POST' })
    }
    set({ user: null })
  },

  syncProgress: async (data) => {
    const { user } = get()
    if (!user) return

    const newHighScore = Math.max(user.highScore, data.score ?? 0)

    set((s) => ({
      user: s.user ? {
        ...s.user,
        highScore: newHighScore,
        level: Math.max(s.user.level, data.level ?? s.user.level),
        xp: data.xp ?? s.user.xp,
        skin: data.skin ?? s.user.skin,
        unlockedSkins: data.unlockedSkins ?? s.user.unlockedSkins,
      } : null,
    }))

    if (user.isGuest) return

    try {
      const payload = {
        score: data.score ?? 0,
        level: data.level ?? user.level,
        xp: data.xp ?? user.xp,
        skin: data.skin ?? user.skin,
        unlockedSkins: data.unlockedSkins ?? user.unlockedSkins,
      }
      const res = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const { highScore } = await res.json()
        set((s) => ({
          user: s.user ? { ...s.user, highScore: Math.max(s.user.highScore, highScore ?? 0) } : null,
        }))
      }
    } catch {
    }
  },
}))
