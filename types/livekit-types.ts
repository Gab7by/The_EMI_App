import type { ConnectionState, Room } from "livekit-client"
import type { ForegroundServiceType } from "@/lib/foreground-service"

export type LiveKitRoomRole = "host" | "audience"

export type LiveKitStore = {
    room : Room | null
    roomName: string | null
    roomRole: LiveKitRoomRole | null
    connectionState: ConnectionState
    isMuted: boolean
    foregroundServiceType: ForegroundServiceType
    connectRoom: (roomName: string, role: LiveKitRoomRole) => Promise<void>
    setConnectionState: (state: ConnectionState) => void
    setIsMuted: (muted: boolean) => void
    setForegroundServiceType: (type: ForegroundServiceType) => void
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
