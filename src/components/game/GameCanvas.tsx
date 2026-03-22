'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { CANVAS_COLS, CANVAS_ROWS, GRID_SIZE, getSkin } from '@/lib/constants'
import { createInitialGameState, tickGame, applyAbility, changeDirection } from '@/lib/engine'
import { renderGame } from '@/lib/renderer'
import { usePlayerStore } from '@/lib/store'
import { soundManager } from '@/lib/sound'
import { submitScore } from '@/services/leaderboard'
import type { GameState, Direction, AbilityType } from '@/types'
import HUD from '@/components/game/HUD'
import DeathScreen from '@/components/game/DeathScreen'
import TouchControls from '@/components/game/TouchControls'

interface GameCanvasProps {
  onReturnToMenu: () => void
}

export default function GameCanvas({ onReturnToMenu }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef<GameState>(createInitialGameState())
  const tickRef = useRef(0)
  const lastTickRef = useRef(0)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const [renderTick, setRenderTick] = useState(0)
  const [isDead, setIsDead] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  const { player, addScore, resetScore } = usePlayerStore()
  const skin = getSkin(player.skin)

  useEffect(() => {
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  const handleEat = useCallback(
    (points: number) => {
      soundManager.play('eat')
      addScore(points)
    },
    [addScore]
  )

  const handleDeath = useCallback(() => {
    soundManager.play('death')
    const score = stateRef.current.score
    setFinalScore(score)
    submitScore(player.id, player.name, score, player.level)
    setIsDead(true)
  }, [player.id, player.name, player.level])

  const restart = useCallback(() => {
    resetScore()
    stateRef.current = createInitialGameState()
    tickRef.current = 0
    lastTickRef.current = 0
    setIsDead(false)
    setFinalScore(0)
  }, [resetScore])

  const triggerAbility = useCallback((ability: AbilityType) => {
    const prevState = stateRef.current
    stateRef.current = applyAbility(stateRef.current, ability)
    if (stateRef.current !== prevState) {
      soundManager.play(ability === 'BOOST' ? 'boost' : ability === 'WALL' ? 'wall' : 'explode')
      setRenderTick((t) => t + 1)
    }
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const dirMap: Record<string, Direction> = {
        ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
        w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT',
        W: 'UP', S: 'DOWN', A: 'LEFT', D: 'RIGHT',
      }
      const abilityMap: Record<string, AbilityType> = {
        ' ': 'BOOST', z: 'BOOST', Z: 'BOOST',
        x: 'WALL', X: 'WALL',
        c: 'EXPLODE', C: 'EXPLODE',
        '1': 'BOOST', '2': 'WALL', '3': 'EXPLODE',
      }

      const dir = dirMap[e.key]
      if (dir) {
        e.preventDefault()
        stateRef.current = changeDirection(stateRef.current, dir)
        return
      }
      const ability = abilityMap[e.key]
      if (ability) {
        e.preventDefault()
        triggerAbility(ability)
      }
      if (e.key === 'Escape') onReturnToMenu()
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onReturnToMenu, triggerAbility])

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

      let dir: Direction
      if (Math.abs(dx) > Math.abs(dy)) {
        dir = dx > 0 ? 'RIGHT' : 'LEFT'
      } else {
        dir = dy > 0 ? 'DOWN' : 'UP'
      }
      stateRef.current = changeDirection(stateRef.current, dir)
    }

    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: false })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  useEffect(() => {
    let frameId: number
    const loop = (timestamp: number) => {
      const state = stateRef.current
      if (state.phase === 'PLAYING') {
        const elapsed = timestamp - lastTickRef.current
        if (elapsed >= state.speed) {
          lastTickRef.current = timestamp
          tickRef.current++
          stateRef.current = tickGame(state, handleEat, handleDeath)
          setRenderTick((t) => t + 1)
        }
      }

      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) renderGame(ctx, stateRef.current, skin, tickRef.current)
      }

      frameId = requestAnimationFrame(loop)
    }
    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [skin, handleEat, handleDeath])

  return (
    <div className="relative flex flex-col items-center gap-3 w-full max-w-[100vw] px-2">
      <HUD
        state={stateRef.current}
        player={player}
        tick={renderTick}
        onAbility={triggerAbility}
        onMenu={onReturnToMenu}
      />

      <div
        ref={wrapperRef}
        className="relative touch-none select-none"
        style={{ maxWidth: '100%' }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_COLS * GRID_SIZE}
          height={CANVAS_ROWS * GRID_SIZE}
          className="block border border-neon-green/20 rounded-sm"
          style={{
            maxWidth: '100%',
            height: 'auto',
            boxShadow: '0 0 30px rgba(0, 255, 136, 0.08)',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none rounded-sm"
          style={{
            background:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
          }}
        />
      </div>

      {isMobile ? (
        <TouchControls
          onDirection={(dir) => { stateRef.current = changeDirection(stateRef.current, dir) }}
          onAbility={triggerAbility}
          state={stateRef.current}
          tick={renderTick}
        />
      ) : (
        <div className="flex gap-4 text-[10px] text-dark-400 font-mono flex-wrap justify-center">
          <span>WASD / ↑↓←→ mover</span>
          <span>SPACE boost</span>
          <span>X wall</span>
          <span>C explode</span>
          <span>ESC menu</span>
        </div>
      )}

      {isDead && (
        <DeathScreen
          score={finalScore}
          playerName={player.name}
          level={player.level}
          highScore={player.highScore}
          onRestart={restart}
          onMenu={onReturnToMenu}
        />
      )}
    </div>
  )
}
