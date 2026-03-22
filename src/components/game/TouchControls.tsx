'use client'

import { useCallback } from 'react'
import {
  IconChevronUp,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconBolt,
  IconWall,
  IconBomb,
} from '@tabler/icons-react'
import type { Direction, AbilityType, GameState } from '@/types'
import clsx from 'clsx'

interface TouchControlsProps {
  onDirection: (dir: Direction) => void
  onAbility: (ability: AbilityType) => void
  state: GameState
  tick: number
}

export default function TouchControls({ onDirection, onAbility, state, tick }: TouchControlsProps) {
  const now = Date.now()

  const getCooldownPct = (ability: AbilityType) => {
    const ab = state.abilities[ability]
    if (ab.lastUsed === 0) return 1
    return Math.min((now - ab.lastUsed) / ab.cooldown, 1)
  }

  const DirBtn = ({ dir, icon }: { dir: Direction; icon: React.ReactNode }) => (
    <button
      onTouchStart={(e) => { e.preventDefault(); onDirection(dir) }}
      className="flex items-center justify-center w-14 h-14 rounded-lg border border-neon-green/20 bg-dark-700/80 active:bg-neon-green/20 active:scale-95 transition-all select-none"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <span className="text-neon-green/70">{icon}</span>
    </button>
  )

  const abilities: { type: AbilityType; icon: React.ReactNode; color: string; label: string }[] = [
    { type: 'BOOST', icon: <IconBolt size={20} />, color: '#00ff88', label: 'BOOST' },
    { type: 'WALL', icon: <IconWall size={20} />, color: '#00e5ff', label: 'WALL' },
    { type: 'EXPLODE', icon: <IconBomb size={20} />, color: '#ff6600', label: 'EXPL' },
  ]

  return (
    <div className="flex items-end justify-between w-full max-w-sm px-2 pb-2 gap-4">
      <div className="grid grid-cols-3 grid-rows-3 gap-1" style={{ width: 176 }}>
        <div />
        <DirBtn dir="UP" icon={<IconChevronUp size={24} />} />
        <div />
        <DirBtn dir="LEFT" icon={<IconChevronLeft size={24} />} />
        <div className="w-14 h-14 rounded-lg border border-dark-500/30 bg-dark-800/40" />
        <DirBtn dir="RIGHT" icon={<IconChevronRight size={24} />} />
        <div />
        <DirBtn dir="DOWN" icon={<IconChevronDown size={24} />} />
        <div />
      </div>

      <div className="flex flex-col gap-2">
        {abilities.map((ab) => {
          const pct = getCooldownPct(ab.type)
          const ready = pct >= 1

          return (
            <button
              key={ab.type}
              onTouchStart={(e) => { e.preventDefault(); onAbility(ab.type) }}
              disabled={!ready}
              className={clsx(
                'relative flex flex-col items-center justify-center gap-0.5 w-16 h-16 rounded-xl border overflow-hidden transition-all active:scale-95 select-none',
                ready ? 'active:brightness-125' : 'opacity-50'
              )}
              style={{
                borderColor: ready ? `${ab.color}60` : '#1a2d3d',
                background: ready ? `${ab.color}15` : 'rgba(13,26,36,0.8)',
                boxShadow: ready ? `0 0 12px ${ab.color}30` : 'none',
                color: ready ? ab.color : '#4a6070',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {!ready && (
                <div
                  className="absolute bottom-0 left-0 right-0 transition-all duration-100"
                  style={{
                    height: `${pct * 100}%`,
                    backgroundColor: ab.color,
                    opacity: 0.15,
                  }}
                />
              )}
              <span className="relative z-10">{ab.icon}</span>
              <span className="relative z-10 text-[9px] font-mono tracking-wider">{ab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
