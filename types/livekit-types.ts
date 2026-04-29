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