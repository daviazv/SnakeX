'use client'

import { useState, useEffect, useRef } from 'react'
import { IconArrowLeft, IconLock, IconCheck, IconDna } from '@tabler/icons-react'
import { SKINS, GRID_SIZE } from '@/lib/constants'
import { usePlayerStore } from '@/lib/store'
import type { SkinConfig, SkinId } from '@/types'
import clsx from 'clsx'

interface SkinsScreenProps {
  onBack: () => void
}

export default function SkinsScreen({ onBack }: SkinsScreenProps) {
  const { player, setSkin } = usePlayerStore()
  const [selected, setSelected] = useState<SkinId>(player.skin)

  const handleSelect = (skin: SkinConfig) => {
    if (!player.unlockedSkins.includes(skin.id)) return
    setSelected(skin.id)
    setSkin(skin.id)
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-dark-900 px-4 py-12">
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at top, rgba(128, 0, 255, 0.04) 0%, transparent 60%)' }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px)' }}
      />

      <div className="relative z-10 w-full max-w-2xl flex flex-col gap-6">
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

        <div className="flex items-center gap-3">
          <IconDna size={28} className="text-neon-purple" style={{ filter: 'drop-shadow(0 0 12px #8000ff)' }} />
          <h2 className="font-display text-3xl font-black tracking-tight" style={{ color: '#8000ff', textShadow: '0 0 20px #8000ff60' }}>
            SKINS
          </h2>
          <span className="font-mono text-xs text-dark-300 ml-2">
            {player.unlockedSkins.length}/{SKINS.length} desbloqueadas
          </span>
        </div>

        <div className="text-dark-300 text-xs font-mono -mt-2">
          LVL atual: <span className="text-neon-cyan">{player.level}</span> — Jogue mais para desbloquear skins de nível maior
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SKINS.map((skin) => {
            const unlocked = player.unlockedSkins.includes(skin.id)
            const isSelected = selected === skin.id

            return (
              <button
                key={skin.id}
                onClick={() => handleSelect(skin)}
                disabled={!unlocked}
                className={clsx(
                  'relative flex flex-col items-center gap-3 p-4 rounded-lg border transition-all duration-200',
                  unlocked ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'cursor-not-allowed',
                  isSelected ? 'scale-105' : ''
                )}
                style={{
                  borderColor: isSelected
                    ? skin.glowColor + '80'
                    : unlocked
                    ? skin.glowColor + '30'
                    : '#0d1a24',
                  background: isSelected
                    ? skin.glowColor + '12'
                    : unlocked
                    ? skin.glowColor + '06'
                    : 'rgba(5, 12, 18, 0.6)',
                  boxShadow: isSelected ? `0 0 20px ${skin.glowColor}30` : 'none',
                  opacity: unlocked ? 1 : 0.4,
                }}
              >
                {isSelected && (
                  <div
                    className="absolute top-2 right-2"
                    style={{ color: skin.glowColor }}
                  >
                    <IconCheck size={12} />
                  </div>
                )}

                {!unlocked && (
                  <div className="absolute top-2 right-2 text-dark-300">
                    <IconLock size={12} />
                  </div>
                )}

                <SnakePreview skin={skin} />

                <div className="flex flex-col items-center gap-0.5">
                  <div className="font-mono text-xs font-bold" style={{ color: unlocked ? skin.glowColor : '#4a6070' }}>
                    {skin.name}
                  </div>
                  {!unlocked && (
                    <div className="text-[9px] font-mono text-dark-300">
                      LVL {skin.requiredLevel}
                    </div>
                  )}
                  {unlocked && isSelected && (
                    <div className="text-[9px] font-mono" style={{ color: skin.glowColor + '80' }}>
                      EQUIPADA
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function SnakePreview({ skin }: { skin: SkinConfig }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const tickRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = 10
    const segments = [
      { x: 4, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 2 },
      { x: 2, y: 3 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 },
    ]

    const draw = () => {
      tickRef.current++
      const t = tickRef.current

      ctx.fillStyle = '#020408'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const pulse = skin.pattern === 'pulse' ? Math.sin(t * 0.1) * 0.3 + 0.7 : 1

      segments.forEach((seg, idx) => {
        const isHead = idx === 0
        const progress = idx / segments.length
        let color = idx === 0 ? skin.headColor : skin.bodyColor

        if (skin.pattern === 'rainbow') {
          const hue = ((t * 2 + idx * 25) % 360)
          color = `hsl(${hue}, 100%, 60%)`
        } else if (skin.pattern === 'gradient') {
          const r1 = parseInt(skin.headColor.slice(1, 3), 16)
          const g1 = parseInt(skin.headColor.slice(3, 5), 16)
          const b1 = parseInt(skin.headColor.slice(5, 7), 16)
          const r2 = parseInt(skin.bodyColor.slice(1, 3), 16)
          const g2 = parseInt(skin.bodyColor.slice(3, 5), 16)
          const b2 = parseInt(skin.bodyColor.slice(5, 7), 16)
          const t2 = progress * 0.7
          color = `rgb(${Math.round(r1+(r2-r1)*t2)},${Math.round(g1+(g2-g1)*t2)},${Math.round(b1+(b2-b1)*t2)})`
        }

        ctx.shadowBlur = (isHead ? 10 : 6 * (1 - progress * 0.5)) * pulse
        ctx.shadowColor = skin.glowColor
        ctx.fillStyle = color

        ctx.beginPath()
        ctx.roundRect(seg.x * size + 1, seg.y * size + 1, size - 2, size - 2, 3)
        ctx.fill()
        ctx.shadowBlur = 0
      })

      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [skin])

  return (
    <canvas
      ref={canvasRef}
      width={70}
      height={70}
      className="rounded"
    />
  )
}
