'use client'

import { useState } from 'react'
import {
  IconCopy, IconCheck, IconPlayerPlay, IconUsers,
  IconArrowLeft, IconLock, IconWorld, IconCircleCheck, IconCircle,
} from '@tabler/icons-react'
import type { LobbyState } from '@/types/multi'
import { usePlayerStore } from '@/lib/store'
import { getSkin } from '@/lib/constants'
import clsx from 'clsx'

interface WaitingRoomProps {
  lobby: LobbyState
  countdown: number | null
  localPlayerId: string
  onReady: (ready: boolean) => void
  onLeave: () => void
}

export default function WaitingRoom({ lobby, countdown, localPlayerId, onReady, onLeave }: WaitingRoomProps) {
  const [copied, setCopied] = useState(false)
  const localPlayer = lobby.players.find(p => p.id === localPlayerId)
  const isReady = localPlayer?.ready ?? false
  const allReady = lobby.players.length > 0 && lobby.players.every(p => p.ready)

  const copyCode = () => {
    navigator.clipboard.writeText(lobby.roomId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (countdown !== null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-dark-900">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(0,255,136,0.06) 0%, transparent 60%)' }} />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="font-mono text-sm text-dark-300 tracking-widest">COMEÇANDO EM</div>
          <div
            className="font-display text-9xl font-black tabular-nums"
            style={{ color: '#00ff88', textShadow: '0 0 60px #00ff88, 0 0 120px #00ff8860' }}
          >
            {countdown}
          </div>
          <div className="font-mono text-xs text-dark-300 tracking-widest animate-pulse">PREPARE-SE</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark-900 px-4">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at top, rgba(128,0,255,0.03) 0%, transparent 60%)' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.05) 3px,rgba(0,0,0,0.05) 4px)' }} />

      <div className="relative z-10 w-full max-w-md flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <button onClick={onLeave} className="flex items-center gap-1.5 text-dark-300 hover:text-neon-pink transition-colors text-xs font-mono">
            <IconArrowLeft size={16} /> SAIR
          </button>
          <div className="flex-1 h-px bg-dark-500" />
          <div className="flex items-center gap-1.5 text-xs font-mono text-dark-300">
            {lobby.isPublic ? <IconWorld size={12} /> : <IconLock size={12} />}
            {lobby.isPublic ? 'PÚBLICA' : 'PRIVADA'}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="font-mono text-[10px] text-dark-300 tracking-widest">CÓDIGO DA SALA</div>
          <div className="flex items-center gap-3">
            <div
              className="font-display text-4xl font-black tracking-[0.25em]"
              style={{ color: '#8000ff', textShadow: '0 0 20px #8000ff60' }}
            >
              {lobby.roomId}
            </div>
            {!lobby.isPublic && (
              <button
                onClick={copyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-mono transition-all hover:scale-105"
                style={{ borderColor: '#8000ff40', color: copied ? '#00ff88' : '#8000ff', background: '#8000ff10' }}
              >
                {copied ? <IconCheck size={13} /> : <IconCopy size={13} />}
                {copied ? 'COPIADO!' : 'COPIAR'}
              </button>
            )}
          </div>
          {!lobby.isPublic && (
            <div className="text-[10px] font-mono text-dark-400">Compartilhe o código com seus amigos</div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[10px] font-mono text-dark-300 tracking-widest">
            <IconUsers size={12} />
            JOGADORES ({lobby.players.length}/8)
          </div>

          <div className="flex flex-col gap-1.5">
            {lobby.players.map(p => {
              const skin = getSkin(p.skin)
              const isLocal = p.id === localPlayerId
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 px-4 py-3 rounded border"
                  style={{
                    borderColor: isLocal ? `${skin.glowColor}40` : '#0d1a24',
                    background: isLocal ? `${skin.glowColor}08` : 'rgba(5,12,18,0.6)',
                    boxShadow: isLocal ? `0 0 10px ${skin.glowColor}20` : 'none',
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ background: skin.headColor, boxShadow: `0 0 6px ${skin.glowColor}` }}
                  />
                  <span className="flex-1 font-mono text-sm" style={{ color: isLocal ? skin.glowColor : '#4a6070' }}>
                    {p.name}
                    {isLocal && <span className="text-[9px] ml-2 opacity-60">VOCÊ</span>}
                  </span>
                  <div className={clsx('flex items-center gap-1 text-[10px] font-mono', p.ready ? 'text-neon-green' : 'text-dark-400')}>
                    {p.ready ? <IconCircleCheck size={14} /> : <IconCircle size={14} />}
                    {p.ready ? 'PRONTO' : 'AGUARDO'}
                  </div>
                </div>
              )
            })}

            {lobby.players.length === 0 && (
              <div className="text-center py-6 text-dark-400 font-mono text-xs">Aguardando jogadores...</div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => onReady(!isReady)}
            className="flex items-center justify-center gap-2 py-4 rounded border font-mono text-sm font-bold tracking-wider transition-all hover:scale-105 active:scale-95"
            style={{
              borderColor: isReady ? '#00ff8860' : '#4a607060',
              color: isReady ? '#00ff88' : '#8899aa',
              background: isReady ? '#00ff8815' : 'rgba(13,26,36,0.8)',
              boxShadow: isReady ? '0 0 20px #00ff8820' : 'none',
            }}
          >
            <IconPlayerPlay size={18} />
            {isReady ? 'PRONTO! (clique para cancelar)' : 'ESTOU PRONTO'}
          </button>

          {allReady && lobby.players.length >= 1 && (
            <div className="text-center text-[10px] font-mono text-neon-green animate-pulse">
              Todos prontos — iniciando partida...
            </div>
          )}

          {lobby.players.length < 2 && lobby.isPublic && (
            <div className="text-center text-[10px] font-mono text-dark-400">
              Aguardando pelo menos 1 jogador para começar
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
