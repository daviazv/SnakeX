'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { CANVAS_COLS, CANVAS_ROWS, GRID_SIZE, getSkin } from '@/lib/constants'
import { renderMultiGame } from '@/lib/multiRenderer'
import { soundManager } from '@/lib/sound'
import type { MultiSnapshot } from '@/types/multi'
import type { Direction, AbilityType } from '@/types'
import MultiHUD from '@/components/multi/MultiHUD'
import TouchControls from '@/components/game/TouchControls'
import type { GameState } from '@/types'

interface MultiGameCanvasProps {
  snapshot: MultiSnapshot
  localPlayerId: string
  onDirection: (dir: Direction) => void
  onAbility: (ability: AbilityType) => void
  onLeave: () => void
}

export default function MultiGameCanvas({
  snapshot, localPlayerId, onDirection, onAbility, onLeave,
}: MultiGameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const tickRef = useRef(0)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const explosionsRef = useRef<{ x: number; y: number; progress: number }[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const [renderTick, setRenderTick] = useState(0)
  const prevSnapshotRef = useRef<MultiSnapshot | null>(null)

  useEffect(() => {
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  useEffect(() => {
    const prev = prevSnapshotRef.current
    if (prev && snapshot) {
      const prevAlive = Object.values(prev.players).filter(p => p.alive).map(p => p.id)
      Object.values(snapshot.players).forEach(p => {
        if (!p.alive && prevAlive.includes(p.id)) {
          soundManager.play('death')
          if (p.id === localPlayerId) soundManager.play('death')
        }
      })

      if (prev.food.length !== snapshot.food.length) {
        soundManager.play('eat')
      }
    }
    prevSnapshotRef.current = snapshot
  }, [snapshot, localPlayerId])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const dirMap: Record<string, Direction> = {
        ArrowUp:'UP', ArrowDown:'DOWN', ArrowLeft:'LEFT', ArrowRight:'RIGHT',
        w:'UP', s:'DOWN', a:'LEFT', d:'RIGHT',
        W:'UP', S:'DOWN', A:'LEFT', D:'RIGHT',
      }
      const abilityMap: Record<string, AbilityType> = {
        ' ':'BOOST', z:'BOOST', Z:'BOOST',
        x:'WALL', X:'WALL',
        c:'EXPLODE', C:'EXPLODE',
        '1':'BOOST', '2':'WALL', '3':'EXPLODE',
      }
      const dir = dirMap[e.key]
      if (dir) { e.preventDefault(); onDirection(dir); return }
      const ability = abilityMap[e.key]
      if (ability) { e.preventDefault(); onAbility(ability) }
      if (e.key === 'Escape') onLeave()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onDirection, onAbility, onLeave])

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      const t = e.touches[0]
      touchStartRef.current = { x: t.clientX, y: t.clientY }
    }
    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      if (!touchStartRef.current) return
      const t = e.changedTouches[0]
      const dx = t.clientX - touchStartRef.current.x
      const dy = t.clientY - touchStartRef.current.y
      touchStartRef.current = null
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
      const dir: Direction = Math.abs(dx) > Math.abs(dy)
        ? dx > 0 ? 'RIGHT' : 'LEFT'
        : dy > 0 ? 'DOWN' : 'UP'
      onDirection(dir)
    }
    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: false })
    return () => { el.removeEventListener('touchstart', onTouchStart); el.removeEventListener('touchend', onTouchEnd) }
  }, [onDirection])

  useEffect(() => {
    let frameId: number
    const loop = () => {
      tickRef.current++
      explosionsRef.current = explosionsRef.current
        .map(e => ({ ...e, progress: e.progress + 0.06 }))
        .filter(e => e.progress < 1.5)

      const canvas = canvasRef.current
      if (canvas && snapshot) {
        const ctx = canvas.getContext('2d')
        if (ctx) renderMultiGame(ctx, snapshot, localPlayerId, tickRef.current, explosionsRef.current)
      }
      frameId = requestAnimationFrame(loop)
    }
    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [snapshot, localPlayerId])

  const localPlayer = snapshot.players[localPlayerId]

  const fakeGameState = localPlayer ? {
    abilities: localPlayer.abilities,
    boostActive: localPlayer.boostActive,
  } as GameState : null

  return (
    <div className="relative flex flex-col items-center gap-3 w-full max-w-[100vw] px-2">
      <MultiHUD snapshot={snapshot} localPlayerId={localPlayerId} onAbility={onAbility} onLeave={onLeave} />

      <div ref={wrapperRef} className="relative touch-none select-none" style={{ maxWidth: '100%' }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_COLS * GRID_SIZE}
          height={CANVAS_ROWS * GRID_SIZE}
          className="block border border-neon-cyan/20 rounded-sm"
          style={{ maxWidth: '100%', height: 'auto', boxShadow: '0 0 30px rgba(0,229,255,0.06)' }}
        />
        <div className="absolute inset-0 pointer-events-none rounded-sm" style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)' }} />
      </div>

      {isMobile && fakeGameState && (
        <TouchControls
          onDirection={onDirection}
          onAbility={onAbility}
          state={fakeGameState}
          tick={renderTick}
        />
      )}

      {!isMobile && (
        <div className="flex gap-4 text-[10px] text-dark-400 font-mono flex-wrap justify-center">
          <span>WASD/↑↓←→ mover</span>
          <span>SPACE boost</span>
          <span>X wall</span>
          <span>C explode</span>
          <span>ESC sair</span>
        </div>
      )}
    </div>
  )
}
