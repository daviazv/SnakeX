'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import AuthGate from '@/components/ui/AuthGate'
import MenuScreen from '@/components/ui/MenuScreen'
import LeaderboardScreen from '@/components/ui/LeaderboardScreen'
import SkinsScreen from '@/components/ui/SkinsScreen'

const GameCanvas = dynamic(() => import('@/components/game/GameCanvas'), { ssr: false })
const MultiplayerPage = dynamic(() => import('@/components/multi/MultiplayerPage'), { ssr: false })

type Screen = 'MENU' | 'GAME' | 'LEADERBOARD' | 'SKINS' | 'MULTI'

export default function HomePage() {
  const [screen, setScreen] = useState<Screen>('MENU')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="font-display text-4xl font-black" style={{ color: '#00ff88', textShadow: '0 0 30px #00ff88' }}>
          SNAKE<span style={{ color: '#00e5ff' }}>X</span>
        </div>
      </div>
    )
  }

  return (
    <AuthGate>
      {screen === 'GAME' && (
        <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-4">
          <GameCanvas onReturnToMenu={() => setScreen('MENU')} />
        </div>
      )}
      {screen === 'LEADERBOARD' && <LeaderboardScreen onBack={() => setScreen('MENU')} />}
      {screen === 'SKINS' && <SkinsScreen onBack={() => setScreen('MENU')} />}
      {screen === 'MULTI' && <MultiplayerPage onBack={() => setScreen('MENU')} />}
      {screen === 'MENU' && (
        <MenuScreen
          onPlay={() => setScreen('GAME')}
          onLeaderboard={() => setScreen('LEADERBOARD')}
          onSkins={() => setScreen('SKINS')}
          onMultiplayer={() => setScreen('MULTI')}
        />
      )}
    </AuthGate>
  )
}
