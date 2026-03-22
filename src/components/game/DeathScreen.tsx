'use client'

import { useEffect, useState } from 'react'
import { IconRefresh, IconHome, IconTrophy, IconSkull, IconChartBar } from '@tabler/icons-react'

interface DeathScreenProps {
  score: number
  playerName: string
  level: number
  highScore: number
  onRestart: () => void
  onMenu: () => void
}

export default function DeathScreen({ score, playerName, level, highScore, onRestart, onMenu }: DeathScreenProps) {
  const [visible, setVisible] = useState(false)
  const isNewRecord = score >= highScore && score > 0

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(2, 4, 8, 0.92)' }}
    >
      <div
        className="relative flex flex-col items-center gap-6 p-10 rounded-lg border"
        style={{
          borderColor: isNewRecord ? '#ffee0040' : '#ff008040',
          background: isNewRecord
            ? 'linear-gradient(135deg, #020408, #0d1a0a)'
            : 'linear-gradient(135deg, #020408, #1a0808)',
          boxShadow: isNewRecord
            ? '0 0 60px #ffee0020, inset 0 0 40px #ffee0008'
            : '0 0 60px #ff008020, inset 0 0 40px #ff000808',
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {isNewRecord ? (
          <>
            <IconTrophy size={52} className="text-neon-yellow" style={{ filter: 'drop-shadow(0 0 20px #ffee00)' }} />
            <div className="text-neon-yellow font-display text-3xl font-bold tracking-widest"
              style={{ textShadow: '0 0 20px #ffee00' }}>
              NOVO RECORDE!
            </div>
          </>
        ) : (
          <>
            <IconSkull size={52} className="text-neon-pink" style={{ filter: 'drop-shadow(0 0 20px #ff0080)' }} />
            <div className="text-neon-pink font-display text-3xl font-bold tracking-widest"
              style={{ textShadow: '0 0 20px #ff0080' }}>
              GAME OVER
            </div>
          </>
        )}

        <div className="flex flex-col items-center gap-1">
          <div className="text-dark-300 text-xs font-mono tracking-widest">{playerName}</div>
          <div className="flex items-center gap-3 text-4xl font-display font-bold"
            style={{
              color: isNewRecord ? '#ffee00' : '#00ff88',
              textShadow: `0 0 20px ${isNewRecord ? '#ffee00' : '#00ff88'}`,
            }}>
            {score.toString().padStart(5, '0')}
          </div>
          <div className="text-dark-300 text-[10px] font-mono tracking-widest">PONTUAÇÃO FINAL</div>
        </div>

        <div className="flex gap-8 text-center">
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1 text-neon-cyan font-mono text-sm font-bold">
              <IconChartBar size={14} />
              {level}
            </div>
            <div className="text-dark-300 text-[9px] font-mono">NÍVEL</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1 text-neon-yellow font-mono text-sm font-bold">
              <IconTrophy size={14} />
              {Math.max(score, highScore).toString().padStart(5, '0')}
            </div>
            <div className="text-dark-300 text-[9px] font-mono">RECORDE</div>
          </div>
        </div>

        <div className="flex gap-4 mt-2">
          <button
            onClick={onRestart}
            className="flex items-center gap-2 px-6 py-3 rounded border font-mono text-sm tracking-wider transition-all hover:scale-105 active:scale-95"
            style={{
              borderColor: '#00ff8860',
              color: '#00ff88',
              background: '#00ff8815',
              boxShadow: '0 0 15px #00ff8830',
            }}
          >
            <IconRefresh size={16} />
            JOGAR DE NOVO
          </button>

          <button
            onClick={onMenu}
            className="flex items-center gap-2 px-6 py-3 rounded border font-mono text-sm tracking-wider transition-all hover:scale-105 active:scale-95"
            style={{
              borderColor: '#ffffff20',
              color: '#8899aa',
              background: '#ffffff05',
            }}
          >
            <IconHome size={16} />
            MENU
          </button>
        </div>
      </div>
    </div>
  )
}
