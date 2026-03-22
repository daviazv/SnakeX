'use client'

import { useEffect, useState } from 'react'
import { IconTrophy, IconCrown, IconMedal, IconRefresh, IconHome } from '@tabler/icons-react'
import type { ScoreEntry } from '@/types/multi'
import { getSkin } from '@/lib/constants'

interface MultiGameOverProps {
  scores: ScoreEntry[]
  localPlayerId: string
  onReturnToLobby: () => void
  onReturnToMenu: () => void
  autoReturnIn?: number
}

export default function MultiGameOver({ scores, localPlayerId, onReturnToLobby, onReturnToMenu, autoReturnIn = 8 }: MultiGameOverProps) {
  const [visible, setVisible] = useState(false)
  const [countdown, setCountdown] = useState(autoReturnIn)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setCountdown(c => Math.max(c - 1, 0)), 1000)
    return () => clearInterval(interval)
  }, [])

  const localRank = scores.findIndex(s => s.id === localPlayerId) + 1
  const winner = scores[0]
  const isLocalWinner = winner?.id === localPlayerId

  const rankIcon = (rank: number) => {
    if (rank === 1) return <IconCrown size={18} className="text-yellow-400" />
    if (rank === 2) return <IconMedal size={16} className="text-gray-300" />
    if (rank === 3) return <IconMedal size={16} className="text-amber-600" />
    return <span className="text-dark-300 font-mono text-xs">{rank}</span>
  }

  const rankColor = (rank: number) => {
    if (rank === 1) return '#ffee00'
    if (rank === 2) return '#cccccc'
    if (rank === 3) return '#cc8800'
    return '#4a6070'
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(2,4,8,0.92)' }}
    >
      <div
        className="relative flex flex-col items-center gap-5 p-8 rounded-lg border max-w-sm w-full mx-4"
        style={{
          borderColor: isLocalWinner ? '#ffee0040' : '#00e5ff20',
          background: 'linear-gradient(135deg, #020408, #050c12)',
          boxShadow: isLocalWinner ? '0 0 60px #ffee0020' : '0 0 40px #00e5ff15',
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <IconTrophy size={40} className="text-neon-yellow" style={{ filter: 'drop-shadow(0 0 15px #ffee00)' }} />
          <div className="font-display text-2xl font-black tracking-wider" style={{ color: '#ffee00', textShadow: '0 0 20px #ffee0060' }}>
            PARTIDA ENCERRADA
          </div>
          {isLocalWinner && (
            <div className="font-mono text-xs text-neon-green tracking-widest animate-pulse">
              🏆 VOCÊ VENCEU!
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          {scores.map((entry, i) => {
            const rank = i + 1
            const skin = getSkin(entry.skin)
            const isLocal = entry.id === localPlayerId
            const color = rankColor(rank)

            return (
              <div
                key={entry.id}
                className="flex items-center gap-3 px-4 py-2.5 rounded border"
                style={{
                  borderColor: isLocal ? `${skin.glowColor}40` : rank <= 3 ? `${color}25` : '#0d1a24',
                  background: isLocal ? `${skin.glowColor}08` : 'rgba(5,12,18,0.6)',
                }}
              >
                <div className="w-5 flex items-center justify-center">{rankIcon(rank)}</div>
                <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: skin.headColor, boxShadow: `0 0 5px ${skin.glowColor}` }} />
                <span className="flex-1 font-mono text-sm" style={{ color: isLocal ? skin.glowColor : color }}>
                  {entry.name}
                  {isLocal && <span className="text-[9px] ml-1.5 opacity-60">VOCÊ</span>}
                </span>
                <span className="font-mono font-bold tabular-nums text-sm" style={{ color }}>
                  {entry.score.toString().padStart(5, '0')}
                </span>
              </div>
            )
          })}
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={onReturnToLobby}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded border font-mono text-xs tracking-wider transition-all hover:scale-105 active:scale-95"
            style={{ borderColor: '#00e5ff40', color: '#00e5ff', background: '#00e5ff10' }}
          >
            <IconRefresh size={14} />
            REVANCHE
          </button>
          <button
            onClick={onReturnToMenu}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded border font-mono text-xs tracking-wider transition-all hover:scale-105 active:scale-95"
            style={{ borderColor: '#ffffff15', color: '#8899aa', background: '#ffffff05' }}
          >
            <IconHome size={14} />
          </button>
        </div>

        <div className="text-[9px] font-mono text-dark-400">
          Voltando ao lobby em {countdown}s...
        </div>
      </div>
    </div>
  )
}
