import type { Direction, AbilityType, Ability, SkinId, SnakeSegment, Food, Wall } from '@/types'

export interface MultiSnakePlayer {
  id: string
  name: string
  skin: SkinId
  snake: SnakeSegment[]
  direction: Direction
  score: number
  alive: boolean
  boostActive: boolean
  abilities: Record<AbilityType, Ability>
}

export interface MultiSnapshot {
  tick: number
  phase: 'WAITING' | 'COUNTDOWN' | 'PLAYING' | 'ENDED'
  players: Record<string, MultiSnakePlayer>
  food: Food[]
  walls: Wall[]
}

export interface LobbyPlayer {
  id: string
  name: string
  skin: SkinId
  ready: boolean
}

export interface LobbyState {
  roomId: string
  isPublic: boolean
  phase: string
  players: LobbyPlayer[]
}

export interface ScoreEntry {
  id: string
  name: string
  score: number
  skin: SkinId
}

export type MultiScreen =
  | 'LOBBY_MENU'
  | 'WAITING_ROOM'
  | 'PLAYING'
  | 'GAME_OVER'
