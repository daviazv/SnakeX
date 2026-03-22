'use client'

import { useMultiplayer } from '@/hooks/useMultiplayer'
import { useAuthStore } from '@/lib/authStore'
import LobbyMenu from '@/components/multi/LobbyMenu'
import WaitingRoom from '@/components/multi/WaitingRoom'
import MultiGameCanvas from '@/components/multi/MultiGameCanvas'
import MultiGameOver from '@/components/multi/MultiGameOver'

interface MultiplayerPageProps {
  onBack: () => void
}

export default function MultiplayerPage({ onBack }: MultiplayerPageProps) {
  const { user } = useAuthStore()
  const {
    connected, roomId, lobby, snapshot, countdown, gameOverScores, error,
    joinPublic, createPrivate, joinPrivate,
    setReady, sendDirection, sendAbility, leaveRoom, clearError,
  } = useMultiplayer()

  if (!user) return null

  const handleLeave = () => leaveRoom()
  const handleLeaveToMenu = () => { leaveRoom(); onBack() }

  if (gameOverScores && !snapshot) {
    return (
      <MultiGameOver
        scores={gameOverScores}
        localPlayerId={user.id}
        onReturnToLobby={handleLeave}
        onReturnToMenu={handleLeaveToMenu}
      />
    )
  }

  if (snapshot && (snapshot.phase === 'PLAYING' || snapshot.phase === 'COUNTDOWN' || snapshot.phase === 'ENDED')) {
    return (
      <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-2">
        {gameOverScores && (
          <MultiGameOver
            scores={gameOverScores}
            localPlayerId={user.id}
            onReturnToLobby={handleLeave}
            onReturnToMenu={handleLeaveToMenu}
          />
        )}
        <MultiGameCanvas
          snapshot={snapshot}
          localPlayerId={user.id}
          onDirection={sendDirection}
          onAbility={sendAbility}
          onLeave={handleLeave}
        />
      </div>
    )
  }

  if (lobby && roomId) {
    return (
      <WaitingRoom
        lobby={lobby}
        countdown={countdown}
        localPlayerId={user.id}
        onReady={setReady}
        onLeave={handleLeave}
      />
    )
  }

  return (
    <LobbyMenu
      connected={connected}
      error={error}
      onJoinPublic={() => joinPublic(user.username, user.skin, user.id)}
      onCreatePrivate={() => createPrivate(user.username, user.skin, user.id)}
      onJoinPrivate={(code) => joinPrivate(code, user.username, user.skin, user.id)}
      onBack={onBack}
      clearError={clearError}
    />
  )
}
