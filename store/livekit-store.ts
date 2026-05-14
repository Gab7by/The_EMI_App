import { getLiveKitToken } from "@/lib/livekit";
import { PODCAST_MIC_CAPTURE_OPTIONS, PODCAST_ROOM_AUDIO_CAPTURE_DEFAULTS } from "@/lib/livekit-audio";
import type { LiveKitRoomRole, LiveKitStore } from "@/types/livekit-types";
import type { ConnectionState } from "livekit-client";
import { create } from "zustand";

let connectPromise: Promise<void> | null = null
let connectTarget: { roomName: string; role: LiveKitRoomRole } | null = null

export const useLiveKitStore = create<LiveKitStore>(
    (set, get) => ({
        room: null,
        roomName: null,
        roomRole: null,
        connectionState: "disconnected" as ConnectionState,
        isMuted: false,
        foregroundServiceType: "mediaPlayback",
        connectRoom: async (roomName, role) => {
            const current = get()
            const currentRoomState = current.room?.state as ConnectionState | undefined

            if (
                current.room &&
                current.roomName === roomName &&
                current.roomRole === role &&
                currentRoomState !== "disconnected"
            ) {
                return
            }

            if (
                connectPromise &&
                connectTarget?.roomName === roomName &&
                connectTarget.role === role
            ) {
                return connectPromise
            }

            current.clearRoom()
            connectTarget = { roomName, role }

            connectPromise = (async () => {
                const { Room, RoomEvent } = await import("livekit-client")

                const room = new Room({
                    adaptiveStream: true,
                    dynacast: true,
                    audioCaptureDefaults: PODCAST_ROOM_AUDIO_CAPTURE_DEFAULTS,
                })

                room.on(RoomEvent.ConnectionStateChanged, (state) => {
                    const latest = get()
                    if (latest.room === room) {
                        set({ connectionState: state })
                    }
                })

                const token = await getLiveKitToken(roomName, role === "host")
                if (!token) return

                const wsUrl = process.env.EXPO_PUBLIC_LIVEKIT_URL!
                await room.connect(wsUrl, token)

                set({
                    room,
                    roomName,
                    roomRole: role,
                    connectionState: room.state as ConnectionState,
                    foregroundServiceType: role === "host" ? "microphone" : "mediaPlayback",
                })

                if (role === "host") {
                    await room.localParticipant.setMicrophoneEnabled(true, PODCAST_MIC_CAPTURE_OPTIONS)
                    set({ isMuted: false })
                }
            })().finally(() => {
                connectPromise = null
                connectTarget = null
            })

            return connectPromise
        },
        setConnectionState: (state) => set({connectionState: state}),
        setIsMuted: (muted) => set({isMuted: muted}),
        setForegroundServiceType: (type) => set({foregroundServiceType: type}),
        clearRoom: () => {
            const {room} = get()
            if (room) {
                room.disconnect()
            }

            set({
                room: null,
                roomName: null,
                roomRole: null,
                connectionState: "disconnected" as ConnectionState,
                isMuted: false,
                foregroundServiceType: "mediaPlayback",
            })
        }
    })
)
