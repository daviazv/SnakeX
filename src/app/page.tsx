'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import MenuScreen from '@/components/ui/MenuScreen'
import LeaderboardScreen from '@/components/ui/LeaderboardScreen'
import SkinsScreen from '@/components/ui/SkinsScreen'

const GameCanvas = dynamic(() => import('@/components/game/GameCanvas'), { ssr: false })

type Screen = 'MENU' | 'GAME' | 'LEADERBOARD' | 'SKINS'

export default function HomePage() {
  const [screen, setScreen] = useState<Screen>('MENU')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div
          className="font-display text-4xl font-black"
          style={{ color: '#00ff88', textShadow: '0 0 30px #00ff88' }}
        >
          SNAKE<span style={{ color: '#00e5ff' }}>X</span>
        </div>
      </div>
    )
  }

  if (screen === 'GAME') {
    return (
      <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-4">
        <GameCanvas onReturnToMenu={() => setScreen('MENU')} />
      </div>
    )
  }

  if (screen === 'LEADERBOARD') {
    return <LeaderboardScreen onBack={() => setScreen('MENU')} />
  }

  if (screen === 'SKINS') {
    return <SkinsScreen onBack={() => setScreen('MENU')} />
  }

  return (
    <MenuScreen
      onPlay={() => setScreen('GAME')}
      onLeaderboard={() => setScreen('LEADERBOARD')}
      onSkins={() => setScreen('SKINS')}
    />
  )
}
