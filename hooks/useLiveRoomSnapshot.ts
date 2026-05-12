import { RoomEvent, type Room } from "livekit-client";
import { useEffect, useState } from "react";

export type LiveRoomParticipantSnapshot = {
  id: string;
  name: string;
  isLocal: boolean;
  canPublish: boolean;
  isMicrophoneEnabled: boolean;
  isSpeaking: boolean;
  audioLevel: number;
};

export const useLiveRoomSnapshot = (room: Room | null) => {
  const [participants, setParticipants] = useState<LiveRoomParticipantSnapshot[]>([]);

  useEffect(() => {
    if (!room) {
      setParticipants([]);
      return;
    }

    const syncParticipants = () => {
      const localParticipants = room.localParticipant
        ? [
            {
              id: room.localParticipant.identity,
              name: room.localParticipant.name || "You",
              isLocal: true,
              canPublish: room.localParticipant.permissions?.canPublish ?? false,
              isMicrophoneEnabled: room.localParticipant.isMicrophoneEnabled,
              isSpeaking: room.localParticipant.isSpeaking,
              audioLevel: room.localParticipant.audioLevel,
            },
          ]
        : [];

      const remoteParticipants = Array.from(room.remoteParticipants.values()).map(
        (participant) => ({
          id: participant.identity,
          name: participant.name || "Guest",
          isLocal: false,
          canPublish: participant.permissions?.canPublish ?? false,
          isMicrophoneEnabled: participant.isMicrophoneEnabled,
          isSpeaking: participant.isSpeaking,
          audioLevel: participant.audioLevel,
        })
      );

      setParticipants([...localParticipants, ...remoteParticipants]);
    };

    syncParticipants();
    room.on(RoomEvent.ActiveSpeakersChanged, syncParticipants);
    room.on(RoomEvent.ParticipantConnected, syncParticipants);
    room.on(RoomEvent.ParticipantDisconnected, syncParticipants);
    room.on(RoomEvent.TrackMuted, syncParticipants);
    room.on(RoomEvent.TrackUnmuted, syncParticipants);

    return () => {
      room.off(RoomEvent.ActiveSpeakersChanged, syncParticipants);
      room.off(RoomEvent.ParticipantConnected, syncParticipants);
      room.off(RoomEvent.ParticipantDisconnected, syncParticipants);
      room.off(RoomEvent.TrackMuted, syncParticipants);
      room.off(RoomEvent.TrackUnmuted, syncParticipants);
    };
  }, [room]);

  return { participants };
};
