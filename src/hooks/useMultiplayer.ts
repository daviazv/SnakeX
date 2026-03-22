'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import type { MultiSnapshot, LobbyState, ScoreEntry } from '@/types/multi'
import type { Direction, AbilityType } from '@/types'

let sharedSocket: Socket | null = null

function getSocket(): Socket {
  if (!sharedSocket || !sharedSocket.connected) {
    sharedSocket = io({ path: '/api/socket', transports: ['websocket'] })
  }
  return sharedSocket
}

export interface UseMultiplayerReturn {
  connected: boolean
  roomId: string | null
  lobby: LobbyState | null
  snapshot: MultiSnapshot | null
  countdown: number | null
  gameOverScores: ScoreEntry[] | null
  error: string | null
  joinPublic: (name: string, skin: string, id: string) => void
  createPrivate: (name: string, skin: string, id: string) => void
  joinPrivate: (roomId: string, name: string, skin: string, id: string) => void
  setReady: (ready: boolean) => void
  sendDirection: (dir: Direction) => void
  sendAbility: (ability: AbilityType) => void
  leaveRoom: () => void
  clearError: () => void
}

export function useMultiplayer(): UseMultiplayerReturn {
  const socketRef = useRef<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [lobby, setLobby] = useState<LobbyState | null>(null)
  const [snapshot, setSnapshot] = useState<MultiSnapshot | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [gameOverScores, setGameOverScores] = useState<ScoreEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const socket = getSocket()
    socketRef.current = socket

    const onConnect = () => setConnected(true)
    const onDisconnect = () => { setConnected(false); setRoomId(null); setLobby(null) }
    const onJoinedRoom = ({ roomId }: { roomId: string }) => setRoomId(roomId)
    const onLobbyUpdate = (state: LobbyState) => setLobby(state)
    const onCountdown = (n: number) => { setCountdown(n) }
    const onGameStart = (snap: MultiSnapshot) => { setSnapshot(snap); setCountdown(null); setGameOverScores(null) }
    const onTick = (snap: MultiSnapshot) => setSnapshot(snap)
    const onGameOver = ({ scores }: { scores: ScoreEntry[] }) => { setGameOverScores(scores) }
    const onBackToLobby = (state: LobbyState) => { setLobby(state); setSnapshot(null); setGameOverScores(null) }
    const onError = (msg: string) => setError(msg)

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('joinedRoom', onJoinedRoom)
    socket.on('lobbyUpdate', onLobbyUpdate)
    socket.on('countdown', onCountdown)
    socket.on('gameStart', onGameStart)
    socket.on('tick', onTick)
    socket.on('gameOver', onGameOver)
    socket.on('backToLobby', onBackToLobby)
    socket.on('error', onError)

    if (socket.connected) setConnected(true)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('joinedRoom', onJoinedRoom)
      socket.off('lobbyUpdate', onLobbyUpdate)
      socket.off('countdown', onCountdown)
      socket.off('gameStart', onGameStart)
      socket.off('tick', onTick)
      socket.off('gameOver', onGameOver)
      socket.off('backToLobby', onBackToLobby)
      socket.off('error', onError)
    }
  }, [])

  const joinPublic = useCallback((name: string, skin: string, id: string) => {
    socketRef.current?.emit('joinPublic', { name, skin, id })
  }, [])

  const createPrivate = useCallback((name: string, skin: string, id: string) => {
    socketRef.current?.emit('createPrivate', { name, skin, id })
  }, [])

  const joinPrivate = useCallback((roomId: string, name: string, skin: string, id: string) => {
    socketRef.current?.emit('joinPrivate', { roomId, name, skin, id })
  }, [])

  const setReady = useCallback((ready: boolean) => {
    socketRef.current?.emit('setReady', { ready })
  }, [])

  const sendDirection = useCallback((dir: Direction) => {
    socketRef.current?.emit('direction', { dir })
  }, [])

  const sendAbility = useCallback((ability: AbilityType) => {
    socketRef.current?.emit('ability', { ability })
  }, [])

  const leaveRoom = useCallback(() => {
    socketRef.current?.emit('leaveRoom')
    setRoomId(null)
    setLobby(null)
    setSnapshot(null)
    setGameOverScores(null)
    setCountdown(null)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return {
    connected, roomId, lobby, snapshot, countdown, gameOverScores, error,
    joinPublic, createPrivate, joinPrivate,
    setReady, sendDirection, sendAbility, leaveRoom, clearError,
  }
}
