import { LiveKitStore } from "@/types/livekit-types";
import type { ConnectionState } from "livekit-client";
import { create } from "zustand";

export const useLiveKitStore = create<LiveKitStore>(
    (set, get) => ({
        room: null,
        connectionState: "disconnected" as ConnectionState,
        isMuted: false,
        setRoom: (room) => set({room}),
        setConnectionState: (state) => set({connectionState: state}),
        setIsMuted: (muted) => set({isMuted: muted}),
        clearRoom: () => {
            const {room} = get()
            if (room) {
                room.disconnect()
            }

            set({
                room: null,
                connectionState: "disconnected" as ConnectionState,
                isMuted: false
            })
        }
    })
)