'use client'

import { useState, useEffect, useRef } from 'react'
import {
  IconPlayerPlay, IconTrophy, IconPalette, IconTerminal2,
  IconBolt, IconWall, IconBomb, IconVolumeOff, IconVolume,
  IconUsers, IconLogout, IconUser, IconGhost,
} from '@tabler/icons-react'
import { useAuthStore } from '@/lib/authStore'
import { soundManager } from '@/lib/sound'

interface MenuScreenProps {
  onPlay: () => void
  onLeaderboard: () => void
  onSkins: () => void
  onMultiplayer: () => void
}

export default function MenuScreen({ onPlay, onLeaderboard, onSkins, onMultiplayer }: MenuScreenProps) {
  const { user, logout } = useAuthStore()
  const [soundOn, setSoundOn] = useState(true)
  const [glitchIdx, setGlitchIdx] = useState(-1)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchIdx(Math.floor(Math.random() * 5))
      setTimeout(() => setGlitchIdx(-1), 150)
    }, 3500)
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
    const colors = ['#00ff88','#00e5ff','#ff0080','#8000ff','#ff6600']
    for (let i = 0; i < 60; i++) {
      particles.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, vx:(Math.random()-0.5)*0.3, vy:(Math.random()-0.5)*0.3, life:Math.random(), color:colors[Math.floor(Math.random()*colors.length)] })
    }
    const draw = () => {
      ctx.fillStyle = 'rgba(2,4,8,0.15)'
      ctx.fillRect(0,0,canvas.width,canvas.height)
      particles.forEach(p => {
        p.x+=p.vx; p.y+=p.vy; p.life+=0.005
        if(p.x<0||p.x>canvas.width) p.vx*=-1
        if(p.y<0||p.y>canvas.height) p.vy*=-1
        if(p.life>1) p.life=0
        const alpha = Math.sin(p.life*Math.PI)*0.6
        ctx.beginPath(); ctx.arc(p.x,p.y,1.5,0,Math.PI*2)
        ctx.fillStyle = p.color+Math.floor(alpha*255).toString(16).padStart(2,'0')
        ctx.fill()
      })
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  const toggleSound = () => { const n=!soundOn; setSoundOn(n); soundManager.setEnabled(n) }

  const menuItems = [
    { label:'JOGAR',       icon:<IconPlayerPlay size={20}/>, action:()=>{soundManager.play('menu_select');onPlay()},        color:'#00ff88', primary:true },
    { label:'MULTIPLAYER', icon:<IconUsers size={20}/>,      action:()=>{soundManager.play('menu_select');onMultiplayer()}, color:'#00e5ff' },
    { label:'RANKING',     icon:<IconTrophy size={20}/>,     action:()=>{soundManager.play('menu_select');onLeaderboard()}, color:'#ffee00' },
    { label:'SKINS',       icon:<IconPalette size={20}/>,    action:()=>{soundManager.play('menu_select');onSkins()},       color:'#8000ff' },
  ]

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-dark-900">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{opacity:0.6}} />
      <div className="absolute inset-0" style={{background:'radial-gradient(ellipse at center,rgba(0,255,136,0.04) 0%,transparent 70%)'}} />
      <div className="absolute inset-0 pointer-events-none" style={{background:'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.05) 3px,rgba(0,0,0,0.05) 4px)'}} />

      <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
        <button onClick={toggleSound} className="text-dark-300 hover:text-neon-green transition-colors p-2">
          {soundOn ? <IconVolume size={16}/> : <IconVolumeOff size={16}/>}
        </button>
        <button onClick={logout} className="flex items-center gap-1.5 text-dark-300 hover:text-neon-pink transition-colors text-xs font-mono p-2">
          <IconLogout size={14}/> SAIR
        </button>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-8">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <IconTerminal2 size={32} className="text-neon-green" style={{filter:'drop-shadow(0 0 10px #00ff88)'}} />
            <h1 className="font-display text-7xl font-black tracking-tighter" style={{color:'#00ff88',textShadow:'0 0 30px #00ff88, 0 0 60px #00ff8840',letterSpacing:'-2px'}}>
              SNAKE<span style={{color:'#00e5ff',textShadow:'0 0 30px #00e5ff'}}>X</span>
            </h1>
          </div>
          <p className="font-mono text-xs tracking-[0.4em] text-dark-300 uppercase">Sistema Neural v3.0 — Modo Cyberpunk</p>
        </div>

        {user && (
          <div className="flex items-center gap-3 px-4 py-2 rounded border bg-dark-800/60"
            style={{ borderColor: user.isGuest ? '#ffffff15' : '#1a2d3d' }}>
            {user.isGuest
              ? <IconGhost size={14} className="text-dark-300" />
              : <IconUser size={14} className="text-neon-green" />}
            <div className="flex items-center gap-3 font-mono text-xs">
              <span style={{ color: user.isGuest ? '#8899aa' : '#00ff88' }} className="font-bold">
                {user.username}
                {user.isGuest && <span className="text-[9px] ml-1.5 opacity-50">CONVIDADO</span>}
              </span>
              {!user.isGuest && <>
                <span className="text-dark-300">LVL <span className="text-neon-cyan">{user.level}</span></span>
                <span className="text-dark-300">BEST <span className="text-neon-yellow">{user.highScore}</span></span>
              </>}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 w-64">
          {menuItems.map((item, i) => (
            <button
              key={item.label}
              onClick={item.action}
              className="relative flex items-center gap-3 px-6 py-4 rounded border font-mono text-sm tracking-wider transition-all duration-200 hover:scale-105 active:scale-95 overflow-hidden group"
              style={{
                borderColor: item.primary ? `${item.color}80` : `${item.color}25`,
                color: item.color,
                background: item.primary ? `${item.color}12` : `${item.color}06`,
                boxShadow: item.primary ? `0 0 20px ${item.color}20` : 'none',
              }}
            >
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{background:`${item.color}08`}} />
              <span className="relative flex items-center gap-3">{item.icon}{item.label}</span>
              {glitchIdx === i && (
                <span className="absolute inset-0 flex items-center justify-center font-mono text-sm" style={{color:'#ff0080',clipPath:'inset(30% 0 40% 0)',transform:'translateX(3px)'}}>
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="text-dark-300 text-[10px] font-mono tracking-widest">HABILIDADES</div>
          <div className="flex gap-6 text-xs font-mono">
            {[
              {icon:<IconBolt size={14}/>,label:'BOOST',key:'SPACE',color:'#00ff88'},
              {icon:<IconWall size={14}/>,label:'WALL',key:'X',color:'#00e5ff'},
              {icon:<IconBomb size={14}/>,label:'EXPLODE',key:'C',color:'#ff6600'},
            ].map(ab => (
              <div key={ab.label} className="flex flex-col items-center gap-1" style={{color:ab.color}}>
                <div className="flex items-center gap-1 opacity-80">{ab.icon}<span>{ab.label}</span></div>
                <span className="text-dark-300 text-[9px]">{ab.key}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
