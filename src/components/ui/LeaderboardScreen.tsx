'use client'

import { useEffect, useState } from 'react'
import {
  IconTrophy,
  IconArrowLeft,
  IconMedal,
  IconCrown,
  IconChartBar,
  IconTrash,
  IconGhost,
} from '@tabler/icons-react'
import { getLeaderboard, clearLeaderboard } from '@/services/leaderboard'
import type { LeaderboardEntry } from '@/types'
import { usePlayerStore } from '@/lib/store'

interface LeaderboardScreenProps {
  onBack: () => void
}

export default function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [confirmClear, setConfirmClear] = useState(false)
  const { player } = usePlayerStore()

  useEffect(() => {
    setEntries(getLeaderboard())
  }, [])

  const handleClear = () => {
    if (confirmClear) {
      clearLeaderboard()
      setEntries([])
      setConfirmClear(false)
    } else {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 3000)
    }
  }

  const rankIcon = (rank: number) => {
    if (rank === 1) return <IconCrown size={16} className="text-yellow-400" />
    if (rank === 2) return <IconMedal size={16} className="text-gray-300" />
    if (rank === 3) return <IconMedal size={16} className="text-amber-600" />
    return <span className="text-dark-300 font-mono text-xs w-4 text-center">{rank}</span>
  }

  const rankColor = (rank: number) => {
    if (rank === 1) return '#ffee00'
    if (rank === 2) return '#cccccc'
    if (rank === 3) return '#cc8800'
    return '#4a6070'
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-dark-900 px-4 py-12">
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at top, rgba(255, 238, 0, 0.03) 0%, transparent 60%)' }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px)' }}
      />

      <div className="relative z-10 w-full max-w-lg flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-dark-300 hover:text-neon-green transition-colors text-xs font-mono"
          >
            <IconArrowLeft size={16} />
            VOLTAR
          </button>
          <div className="flex-1 h-px bg-dark-500" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconTrophy size={28} className="text-neon-yellow" style={{ filter: 'drop-shadow(0 0 12px #ffee00)' }} />
            <h2 className="font-display text-3xl font-black tracking-tight" style={{ color: '#ffee00', textShadow: '0 0 20px #ffee0060' }}>
              RANKING
            </h2>
          </div>

          {entries.length > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 text-xs font-mono transition-colors px-3 py-1.5 rounded border"
              style={{
                color: confirmClear ? '#ff0080' : '#4a6070',
                borderColor: confirmClear ? '#ff008040' : '#1a2d3d',
                background: confirmClear ? '#ff008010' : 'transparent',
              }}
            >
              <IconTrash size={12} />
              {confirmClear ? 'CONFIRMAR?' : 'LIMPAR'}
            </button>
          )}
        </div>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-dark-400">
            <IconGhost size={48} className="opacity-40" />
            <p className="font-mono text-sm tracking-widest">NENHUMA PARTIDA AINDA</p>
            <p className="font-mono text-xs opacity-60">Jogue e apareça aqui!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {entries.map((entry, i) => {
              const isCurrentPlayer = entry.playerId === player.id
              const color = rankColor(entry.rank)

              return (
                <div
                  key={entry.playerId ?? i}
                  className="flex items-center gap-4 px-4 py-3 rounded border transition-all"
                  style={{
                    borderColor: isCurrentPlayer ? '#00ff8840' : entry.rank <= 3 ? `${color}30` : '#0d1a2420',
                    background: isCurrentPlayer
                      ? 'rgba(0,255,136,0.06)'
                      : entry.rank <= 3
                      ? `${color}08`
                      : 'rgba(5, 12, 18, 0.6)',
                    boxShadow: isCurrentPlayer ? '0 0 15px rgba(0,255,136,0.1)' : 'none',
                  }}
                >
                  <div className="w-6 flex items-center justify-center flex-shrink-0">
                    {rankIcon(entry.rank)}
                  </div>

                  <div className="flex-1 font-mono text-sm" style={{ color: isCurrentPlayer ? '#00ff88' : color }}>
                    {entry.name}
                    {isCurrentPlayer && <span className="text-[9px] ml-2 opacity-60">VOCÊ</span>}
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <div className="flex items-center gap-1 text-dark-300">
                      <IconChartBar size={11} />
                      <span>LVL {entry.level}</span>
                    </div>
                    <div className="font-bold tabular-nums" style={{ color, minWidth: '60px', textAlign: 'right' }}>
                      {entry.score.toString().padStart(5, '0')}
                    </div>
                  </div>

                  <div className="text-[9px] text-dark-400 font-mono w-16 text-right flex-shrink-0">
                    {entry.date}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="text-dark-400 text-[10px] font-mono text-center">
          Apenas o melhor score de cada jogador é exibido
        </div>
      </div>
    </div>
  )
}
