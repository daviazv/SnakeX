'use client'

import { useState } from 'react'
import {
  IconArrowLeft, IconWorld, IconLock, IconDoorEnter,
  IconPlus, IconWifi, IconWifiOff,
} from '@tabler/icons-react'
import { usePlayerStore } from '@/lib/store'
import { soundManager } from '@/lib/sound'
import clsx from 'clsx'

interface LobbyMenuProps {
  connected: boolean
  error: string | null
  onJoinPublic: () => void
  onCreatePrivate: () => void
  onJoinPrivate: (code: string) => void
  onBack: () => void
  clearError: () => void
}

export default function LobbyMenu({
  connected, error, onJoinPublic, onCreatePrivate, onJoinPrivate, onBack, clearError,
}: LobbyMenuProps) {
  const { player } = usePlayerStore()
  const [code, setCode] = useState('')
  const [joining, setJoining] = useState(false)

  const handleJoinCode = () => {
    const trimmed = code.trim().toUpperCase()
    if (trimmed.length !== 6) return
    onJoinPrivate(trimmed)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark-900 px-4">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(0,229,255,0.03) 0%, transparent 70%)' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.05) 3px,rgba(0,0,0,0.05) 4px)' }} />

      <div className="relative z-10 w-full max-w-sm flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-1.5 text-dark-300 hover:text-neon-green transition-colors text-xs font-mono">
            <IconArrowLeft size={16} /> VOLTAR
          </button>
          <div className="flex-1 h-px bg-dark-500" />
          <div className={clsx('flex items-center gap-1.5 text-xs font-mono', connected ? 'text-neon-green' : 'text-neon-pink')}>
            {connected ? <IconWifi size={13} /> : <IconWifiOff size={13} />}
            {connected ? 'ONLINE' : 'OFFLINE'}
          </div>
        </div>

        <div>
          <h2 className="font-display text-3xl font-black" style={{ color: '#00e5ff', textShadow: '0 0 20px #00e5ff60' }}>
            MULTIPLAYER
          </h2>
          <p className="font-mono text-xs text-dark-300 mt-1 tracking-wider">
            Jogando como <span className="text-neon-green">{player.name}</span>
          </p>
        </div>

        {error && (
          <div
            className="flex items-center justify-between px-4 py-3 rounded border text-xs font-mono"
            style={{ borderColor: '#ff008040', background: '#ff000810', color: '#ff0080' }}
          >
            <span>{error}</span>
            <button onClick={clearError} className="opacity-60 hover:opacity-100 ml-3">✕</button>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => { soundManager.play('menu_select'); onJoinPublic() }}
            disabled={!connected}
            className="flex items-center gap-3 px-5 py-4 rounded border transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ borderColor: '#00e5ff60', color: '#00e5ff', background: '#00e5ff10', boxShadow: '0 0 15px #00e5ff20' }}
          >
            <IconWorld size={20} />
            <div className="text-left">
              <div className="font-mono text-sm font-bold tracking-wider">SALA PÚBLICA</div>
              <div className="text-[10px] opacity-60 font-mono">Entra em partida aberta com outros jogadores</div>
            </div>
          </button>

          <button
            onClick={() => { soundManager.play('menu_select'); onCreatePrivate() }}
            disabled={!connected}
            className="flex items-center gap-3 px-5 py-4 rounded border transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ borderColor: '#8000ff60', color: '#8000ff', background: '#8000ff10', boxShadow: '0 0 15px #8000ff20' }}
          >
            <IconPlus size={20} />
            <div className="text-left">
              <div className="font-mono text-sm font-bold tracking-wider">CRIAR SALA PRIVADA</div>
              <div className="text-[10px] opacity-60 font-mono">Convida amigos com código de 6 letras</div>
            </div>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-mono text-dark-300 tracking-widest">ENTRAR COM CÓDIGO</div>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))}
              onKeyDown={e => e.key === 'Enter' && handleJoinCode()}
              placeholder="XXXXXX"
              disabled={!connected}
              className="flex-1 bg-dark-700 border border-dark-400 rounded px-3 py-2.5 font-mono text-sm text-center tracking-[0.3em] text-neon-cyan outline-none focus:border-neon-cyan transition-colors disabled:opacity-40"
              maxLength={6}
            />
            <button
              onClick={handleJoinCode}
              disabled={!connected || code.trim().length !== 6}
              className="flex items-center gap-1.5 px-4 rounded border font-mono text-xs tracking-wider transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ borderColor: '#00e5ff40', color: '#00e5ff', background: '#00e5ff10' }}
            >
              <IconDoorEnter size={16} />
              IR
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
