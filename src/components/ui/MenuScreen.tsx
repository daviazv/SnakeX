'use client'

import { useState, useEffect, useRef } from 'react'
import {
  IconPlayerPlay,
  IconTrophy,
  IconPalette,
  IconBrandDiscord,
  IconTerminal2,
  IconBolt,
  IconWall,
  IconBomb,
  IconVolumeOff,
  IconVolume,
  IconEdit,
} from '@tabler/icons-react'
import { usePlayerStore } from '@/lib/store'
import { soundManager } from '@/lib/sound'

interface MenuScreenProps {
  onPlay: () => void
  onLeaderboard: () => void
  onSkins: () => void
}

export default function MenuScreen({ onPlay, onLeaderboard, onSkins }: MenuScreenProps) {
  const { player, setName } = usePlayerStore()
  const [soundOn, setSoundOn] = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(player.name)
  const [glitchIdx, setGlitchIdx] = useState(-1)
  const nameRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchIdx(Math.floor(Math.random() * 6))
      setTimeout(() => setGlitchIdx(-1), 150)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const particles: { x: number; y: number; vx: number; vy: number; life: number; color: string }[] = []
    let t = 0

    const colors = ['#00ff88', '#00e5ff', '#ff0080', '#8000ff', '#ff6600']

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        life: Math.random(),
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    const draw = () => {
      t++
      ctx.fillStyle = 'rgba(2, 4, 8, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.life += 0.005
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        if (p.life > 1) p.life = 0

        const alpha = Math.sin(p.life * Math.PI) * 0.6
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = p.color + Math.floor(alpha * 255).toString(16).padStart(2, '0')
        ctx.fill()
      })

      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  const toggleSound = () => {
    const next = !soundOn
    setSoundOn(next)
    soundManager.setEnabled(next)
  }

  const saveName = () => {
    const trimmed = nameInput.trim()
    if (trimmed.length > 0) setName(trimmed)
    setEditingName(false)
  }

  const menuItems = [
    { label: 'JOGAR', icon: <IconPlayerPlay size={20} />, action: () => { soundManager.play('menu_select'); onPlay() }, primary: true },
    { label: 'RANKING', icon: <IconTrophy size={20} />, action: () => { soundManager.play('menu_select'); onLeaderboard() } },
    { label: 'SKINS', icon: <IconPalette size={20} />, action: () => { soundManager.play('menu_select'); onSkins() } },
  ]

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-dark-900">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.6 }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0, 255, 136, 0.04) 0%, transparent 70%)',
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-10 px-8">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <IconTerminal2 size={32} className="text-neon-green" style={{ filter: 'drop-shadow(0 0 10px #00ff88)' }} />
            <h1
              className="font-display text-7xl font-black tracking-tighter"
              style={{
                color: '#00ff88',
                textShadow: '0 0 30px #00ff88, 0 0 60px #00ff8840',
                letterSpacing: '-2px',
              }}
            >
              SNAKE<span style={{ color: '#00e5ff', textShadow: '0 0 30px #00e5ff' }}>X</span>
            </h1>
          </div>
          <p className="font-mono text-xs tracking-[0.4em] text-dark-300 uppercase">
            Sistema Neural v2.0 — Modo Cyberpunk
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                ref={nameRef}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value.toUpperCase().slice(0, 16))}
                onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false) }}
                autoFocus
                className="bg-transparent border-b border-neon-green text-neon-green font-mono text-lg text-center outline-none tracking-widest px-2"
                style={{ width: '160px' }}
                placeholder="SEU NOME"
              />
              <button onClick={saveName} className="text-neon-green text-xs font-mono hover:underline">OK</button>
            </div>
          ) : (
            <button
              onClick={() => { setEditingName(true); setNameInput(player.name) }}
              className="flex items-center gap-2 text-dark-300 hover:text-neon-green transition-colors group font-mono text-sm"
            >
              <span className="tracking-widest">{player.name}</span>
              <IconEdit size={13} className="group-hover:scale-110 transition-transform" />
            </button>
          )}
          <div className="flex items-center gap-4 text-xs font-mono text-dark-300">
            <span>LVL <span className="text-neon-cyan">{player.level}</span></span>
            <span>RECORDE <span className="text-neon-yellow">{player.highScore}</span></span>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-64">
          {menuItems.map((item, i) => (
            <button
              key={item.label}
              onClick={item.action}
              className="relative flex items-center gap-3 px-6 py-4 rounded border font-mono text-sm tracking-wider transition-all duration-200 hover:scale-105 active:scale-95 overflow-hidden group"
              style={{
                borderColor: item.primary ? '#00ff8880' : '#1a2d3d',
                color: item.primary ? '#00ff88' : '#4a6070',
                background: item.primary ? 'rgba(0,255,136,0.08)' : 'rgba(13,26,36,0.8)',
                boxShadow: item.primary ? '0 0 20px rgba(0,255,136,0.15)' : 'none',
                animationDelay: `${i * 0.05}s`,
              }}
            >
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: item.primary
                    ? 'rgba(0,255,136,0.06)'
                    : 'rgba(255,255,255,0.03)',
                }}
              />
              <span className="relative flex items-center gap-3">
                {item.icon}
                {item.label}
              </span>
              {glitchIdx === i && (
                <span
                  className="absolute inset-0 flex items-center justify-center font-mono text-sm"
                  style={{ color: '#ff0080', clipPath: 'inset(30% 0 40% 0)', transform: 'translateX(3px)' }}
                >
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="text-dark-300 text-[10px] font-mono tracking-widest">HABILIDADES</div>
          <div className="flex gap-6 text-xs font-mono">
            {[
              { icon: <IconBolt size={14} />, label: 'BOOST', key: 'SPACE', color: '#00ff88' },
              { icon: <IconWall size={14} />, label: 'WALL', key: 'X', color: '#00e5ff' },
              { icon: <IconBomb size={14} />, label: 'EXPLODE', key: 'C', color: '#ff6600' },
            ].map((ab) => (
              <div key={ab.label} className="flex flex-col items-center gap-1" style={{ color: ab.color }}>
                <div className="flex items-center gap-1 opacity-80">{ab.icon}<span>{ab.label}</span></div>
                <span className="text-dark-300 text-[9px]">{ab.key}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={toggleSound}
            className="text-dark-300 hover:text-neon-green transition-colors"
          >
            {soundOn ? <IconVolume size={16} /> : <IconVolumeOff size={16} />}
          </button>
          <div className="flex items-center gap-1.5 text-dark-400 text-[10px] font-mono">
            <IconBrandDiscord size={12} />
            <span>DISCORD READY</span>
          </div>
        </div>
      </div>
    </div>
  )
}
