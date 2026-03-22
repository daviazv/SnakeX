import type { LeaderboardEntry } from '@/types'

const STORAGE_KEY = 'snakex-leaderboard'
const MAX_ENTRIES = 20

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: LeaderboardEntry[] = JSON.parse(raw)
    return parsed
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_ENTRIES)
      .map((e, i) => ({ ...e, rank: i + 1 }))
  } catch {
    return []
  }
}

export function submitScore(
  playerId: string,
  name: string,
  score: number,
  level: number
): LeaderboardEntry[] {
  if (score <= 0) return getLeaderboard()

  const current = getLeaderboard()

  const existing = current.find((e) => e.playerId === playerId)
  if (existing && existing.score >= score) {
    return current
  }

  const withoutPlayer = current.filter((e) => e.playerId !== playerId)

  const entry: LeaderboardEntry = {
    rank: 0,
    playerId,
    name: name.slice(0, 16).toUpperCase(),
    score,
    level,
    date: new Date().toLocaleDateString('pt-BR'),
  }

  const updated = [...withoutPlayer, entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ENTRIES)
    .map((e, i) => ({ ...e, rank: i + 1 }))

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}

export function clearLeaderboard(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
