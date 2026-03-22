'use client'

import { useMemo } from 'react'
import {
  IconBolt,
  IconWall,
  IconBomb,
  IconStar,
  IconTrophy,
  IconArrowLeft,
  IconDna,
} from '@tabler/icons-react'
import type { GameState, AbilityType, PlayerState } from '@/types'
import clsx from 'clsx'

interface HUDProps {
  state: GameState
  player: PlayerState
  tick: number
  onAbility: (a: AbilityType) => void
  onMenu: () => void
}

const ABILITY_META: Record<AbilityType, { label: string; key: string; color: string; icon: React.ReactNode }> = {
  BOOST: { label: 'BOOST', key: 'SPACE', color: 'neon-green', icon: <IconBolt size={18} /> },
  WALL: { label: 'WALL', key: 'X', color: 'neon-cyan', icon: <IconWall size={18} /> },
  EXPLODE: { label: 'EXPLODE', key: 'C', color: 'neon-orange', icon: <IconBomb size={18} /> },
}

export default function HUD({ state, player, tick, onAbility, onMenu }: HUDProps) {
  const now = Date.now()

  const getCooldownPct = (ability: AbilityType) => {
    const ab = state.abilities[ability]
    if (ab.lastUsed === 0) return 1
    const elapsed = now - ab.lastUsed
    return Math.min(elapsed / ab.cooldown, 1)
  }

  const xpPct = Math.round((player.xp / player.xpToNext) * 100)

  return (
    <div className="w-full flex items-center justify-between gap-4 px-1">
      <button
        onClick={onMenu}
        className="flex items-center gap-1.5 text-dark-300 hover:text-neon-green transition-colors text-xs font-mono"
      >
        <IconArrowLeft size={14} />
        ESC
      </button>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-neon-green font-display text-2xl font-bold tabular-nums"
            style={{ textShadow: '0 0 12px #00ff88' }}>
            <IconTrophy size={16} className="text-neon-yellow" />
            {state.score.toString().padStart(5, '0')}
          </div>
          <div className="text-dark-300 text-[10px] font-mono tracking-widest">SCORE</div>
        </div>

        <div className="flex flex-col items-center min-w-[80px]">
          <div className="flex items-center gap-1 text-neon-cyan font-mono text-sm">
            <IconDna size={13} />
            <span className="font-bold">LVL {player.level}</span>
          </div>
          <div className="w-full h-1 bg-dark-500 rounded-full mt-1 overflow-hidden">
            <div
              className="h-full bg-neon-cyan rounded-full transition-all duration-300"
              style={{ width: `${xpPct}%`, boxShadow: '0 0 6px #00e5ff' }}
            />
          </div>
          <div className="text-dark-300 text-[9px] font-mono mt-0.5">{player.xp}/{player.xpToNext} XP</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {(Object.keys(ABILITY_META) as AbilityType[]).map((ability, i) => {
          const meta = ABILITY_META[ability]
          const pct = getCooldownPct(ability)
          const ready = pct >= 1
          const colorMap: Record<string, string> = {
            'neon-green': '#00ff88',
            'neon-cyan': '#00e5ff',
            'neon-orange': '#ff6600',
          }
          const color = colorMap[meta.color]
          const isActive = ability === 'BOOST' && state.boostActive

          return (
            <button
              key={ability}
              onClick={() => onAbility(ability)}
              className={clsx(
                'relative flex flex-col items-center gap-1 px-3 py-2 rounded border transition-all duration-200',
                'font-mono text-[10px] tracking-wider select-none',
                ready
                  ? 'cursor-pointer hover:scale-105 active:scale-95'
                  : 'cursor-not-allowed opacity-50'
              )}
              style={{
                borderColor: ready ? `${color}60` : '#1a2d3d',
                backgroundColor: isActive ? `${color}20` : ready ? `${color}10` : 'transparent',
                boxShadow: isActive ? `0 0 12px ${color}60` : ready ? `0 0 6px ${color}30` : 'none',
                color: ready ? color : '#243d52',
              }}
            >
              <div className="flex items-center gap-1">
                {meta.icon}
                <span>{meta.label}</span>
              </div>
              <span className="text-[9px] opacity-60">{meta.key}</span>

              {!ready && (
                <div
                  className="absolute inset-0 rounded overflow-hidden pointer-events-none"
                  style={{ opacity: 0.3 }}
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 transition-all duration-100"
                    style={{
                      height: `${pct * 100}%`,
                      backgroundColor: color,
                      opacity: 0.2,
                    }}
                  />
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col items-end">
        <div className="flex items-center gap-1 text-neon-yellow text-xs font-mono">
          <IconStar size={12} />
          BEST {player.highScore.toString().padStart(5, '0')}
        </div>
        <div className="text-dark-300 text-[9px] font-mono">{player.name}</div>
      </div>
    </div>
  )
}
