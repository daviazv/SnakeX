'use client'

import { IconBolt, IconWall, IconBomb, IconArrowLeft, IconSkull } from '@tabler/icons-react'
import type { MultiSnapshot } from '@/types/multi'
import type { AbilityType } from '@/types'
import { getSkin } from '@/lib/constants'
import clsx from 'clsx'

interface MultiHUDProps {
  snapshot: MultiSnapshot
  localPlayerId: string
  onAbility: (a: AbilityType) => void
  onLeave: () => void
}

const ABILITY_META: Record<AbilityType, { key: string; color: string; icon: React.ReactNode }> = {
  BOOST:   { key: 'SPC', color: '#00ff88', icon: <IconBolt size={16} /> },
  WALL:    { key: 'X',   color: '#00e5ff', icon: <IconWall size={16} /> },
  EXPLODE: { key: 'C',   color: '#ff6600', icon: <IconBomb size={16} /> },
}

export default function MultiHUD({ snapshot, localPlayerId, onAbility, onLeave }: MultiHUDProps) {
  const now = Date.now()
  const local = snapshot.players[localPlayerId]
  const allPlayers = Object.values(snapshot.players).sort((a, b) => b.score - a.score)

  const getCooldown = (ability: AbilityType) => {
    if (!local) return 1
    const ab = local.abilities[ability]
    if (!ab || ab.lastUsed === 0) return 1
    return Math.min((now - ab.lastUsed) / ab.cooldown, 1)
  }

  return (
    <div className="w-full flex items-center justify-between gap-3 px-1 flex-wrap">
      <button
        onClick={onLeave}
        className="flex items-center gap-1.5 text-dark-300 hover:text-neon-pink transition-colors text-xs font-mono flex-shrink-0"
      >
        <IconArrowLeft size={14} /> SAIR
      </button>

      <div className="flex items-center gap-2 flex-wrap justify-center flex-1">
        {allPlayers.map(p => {
          const skin = getSkin(p.skin)
          const isLocal = p.id === localPlayerId
          return (
            <div
              key={p.id}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono text-xs"
              style={{
                borderColor: isLocal ? `${skin.glowColor}50` : '#0d1a24',
                background: isLocal ? `${skin.glowColor}10` : 'rgba(5,12,18,0.7)',
                color: p.alive ? (isLocal ? skin.glowColor : skin.bodyColor) : '#4a6070',
                boxShadow: isLocal ? `0 0 8px ${skin.glowColor}25` : 'none',
              }}
            >
              {!p.alive && <IconSkull size={10} className="opacity-60" />}
              <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: p.alive ? skin.headColor : '#333', boxShadow: p.alive ? `0 0 4px ${skin.glowColor}` : 'none' }} />
              <span className={clsx('max-w-[60px] truncate', !p.alive && 'line-through opacity-50')}>{p.name}</span>
              <span className="font-bold tabular-nums opacity-80">{p.score}</span>
            </div>
          )
        })}
      </div>

      {local && (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {(Object.keys(ABILITY_META) as AbilityType[]).map(ab => {
            const meta = ABILITY_META[ab]
            const pct = getCooldown(ab)
            const ready = pct >= 1
            return (
              <button
                key={ab}
                onClick={() => onAbility(ab)}
                disabled={!ready || !local.alive}
                className="relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded border text-[9px] font-mono overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  borderColor: ready ? `${meta.color}50` : '#1a2d3d',
                  color: ready ? meta.color : '#243d52',
                  background: ready ? `${meta.color}10` : 'transparent',
                }}
              >
                {!ready && (
                  <div className="absolute bottom-0 left-0 right-0 transition-all" style={{ height: `${pct * 100}%`, background: meta.color, opacity: 0.15 }} />
                )}
                <span className="relative z-10">{meta.icon}</span>
                <span className="relative z-10 text-[8px]">{meta.key}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
