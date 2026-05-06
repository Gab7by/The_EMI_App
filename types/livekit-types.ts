import type { ConnectionState, Room } from "livekit-client"

export type LiveKitStore = {
    room : Room | null
    connectionState: ConnectionState
    isMuted: boolean
    setRoom: (room: Room) => void
    setConnectionState: (state: ConnectionState) => void
    setIsMuted: (muted: boolean) => void
    clearRoom: () => void
}

export type SignalType = 
  | 'RAISE_HAND'      
  | 'LOWER_HAND'    
  | 'HAND_APPROVED'
  | 'SPEAKER_REVOKED'
  | 'SESSION_ENDED'
  | 'BACKGROUND_CHANGED'

export type RoomSignal = {
    type: SignalType
    fromId: string
    fromName: string
    toId?: string
}