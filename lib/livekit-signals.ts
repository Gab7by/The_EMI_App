import { RoomSignal } from "@/types/livekit-types";
import type { Room } from "livekit-client";

export const sendSignal = async (room: Room, signal: RoomSignal) => {
    const encoder = new TextEncoder()

    const data = encoder.encode(JSON.stringify(signal))

    await room.localParticipant.publishData(
        data,
        {
            reliable: true
        }
    )
}

export const raiseHand = async (
    room: Room,
    userId: string,
    userName: string
) => {
    await sendSignal(room, {
        type: 'RAISE_HAND',
        fromId: userId,
        fromName: userName
    })
}

export const lowerHand = async (
    room: Room,
    userId: string,
    userName: string
) => {
    await sendSignal(room, {
        type: 'LOWER_HAND',
        fromId: userId,
        fromName: userName
    })
}

export const approveSpeaker = async (
    room: Room,
    hostId: string,
    hostName: string,
    participantId: string
) => {
    await sendSignal(room, {
        type: 'HAND_APPROVED',
        fromId: hostId,
        fromName: hostName,
        toId: participantId
    })
}

export const sendSessionEnded = async (
    room: Room,
    hostId: string,
    hostName: string
) => {
    await sendSignal(room, {
        type: 'SESSION_ENDED',
        fromId: hostId,
        fromName: hostName
    })
}