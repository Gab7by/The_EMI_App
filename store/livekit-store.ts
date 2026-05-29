import { getLiveKitToken } from "@/lib/livekit";
import { PODCAST_MIC_CAPTURE_OPTIONS, PODCAST_ROOM_AUDIO_CAPTURE_DEFAULTS } from "@/lib/livekit-audio";
import type { LiveKitRoomRole, LiveKitStore } from "@/types/livekit-types";
import type { ConnectionState, Room } from "livekit-client";
import { create } from "zustand";

let connectPromise: Promise<void> | null = null
let connectTarget: { roomName: string; role: LiveKitRoomRole } | null = null
let connectRequestId = 0

const disconnectRoom = (room: Room | null) => {
    if (!room) return

    room.localParticipant.setMicrophoneEnabled(false).catch((error) => {
        console.error("Failed to disable microphone before disconnect:", error)
    })
    room.disconnect()
}

export const useLiveKitStore = create<LiveKitStore>(
    (set, get) => ({
        room: null,
        roomName: null,
        roomRole: null,
        connectionState: "disconnected" as ConnectionState,
        isMuted: false,
        foregroundServiceType: "mediaPlayback",
        connectRoom: async (roomName, role, podcastId) => {
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

            const requestId = ++connectRequestId
            disconnectRoom(current.room)
            set({
                room: null,
                roomName: null,
                roomRole: null,
                connectionState: "disconnected" as ConnectionState,
                isMuted: false,
                foregroundServiceType: "mediaPlayback",
            })
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
                    if (latest.room === room && connectRequestId === requestId) {
                        set({
                            connectionState: state,
                            foregroundServiceType: state === "disconnected"
                                ? "mediaPlayback"
                                : latest.foregroundServiceType,
                        })
                    }
                })

                const token = await getLiveKitToken(roomName, role === "host", podcastId)
                if (!token || connectRequestId !== requestId) {
                    room.disconnect()
                    return
                }

                const wsUrl = process.env.EXPO_PUBLIC_LIVEKIT_URL!
                await room.connect(wsUrl, token)

                if (connectRequestId !== requestId) {
                    room.disconnect()
                    return
                }

                set({
                    room,
                    roomName,
                    roomRole: role,
                    connectionState: room.state as ConnectionState,
                    foregroundServiceType: "mediaPlayback",
                })

                if (role === "host") {
                    await room.localParticipant.setMicrophoneEnabled(true, PODCAST_MIC_CAPTURE_OPTIONS)
                    if (connectRequestId === requestId) {
                        set({ isMuted: false, foregroundServiceType: "microphone" })
                    } else {
                        await room.localParticipant.setMicrophoneEnabled(false)
                        room.disconnect()
                    }
                }
            })().catch((error) => {
                throw error
            }).finally(() => {
                if (connectRequestId === requestId) {
                    connectPromise = null
                    connectTarget = null
                }
            })

            return connectPromise
        },
        setConnectionState: (state) => set({connectionState: state}),
        setIsMuted: (muted) => set({isMuted: muted}),
        setForegroundServiceType: (type) => set({foregroundServiceType: type}),
        clearRoom: () => {
            connectRequestId++
            connectPromise = null
            connectTarget = null
            const {room} = get()
            disconnectRoom(room)

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
