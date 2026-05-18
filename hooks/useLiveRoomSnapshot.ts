import { RoomEvent, type Participant, type Room } from "livekit-client";
import { useEffect, useState } from "react";

export type LiveRoomParticipantSnapshot = {
  id: string;
  name: string;
  isLocal: boolean;
  canPublish: boolean;
  isMicrophoneEnabled: boolean;
  audioTrackSid: string | null;
  isSpeaking: boolean;
  audioLevel: number;
};

const isMusicBotParticipant = (identity: string, name?: string) => {
  const normalizedIdentity = identity.toLowerCase();
  const normalizedName = (name ?? "").toLowerCase();

  return (
    normalizedIdentity.includes("music-bot") ||
    normalizedIdentity.includes("music_bot") ||
    normalizedIdentity.includes("musicbot") ||
    normalizedName.includes("music bot") ||
    normalizedName.includes("music-bot") ||
    normalizedName.includes("music_bot") ||
    normalizedName.includes("musicbot")
  );
};

const areSnapshotsEqual = (
  previous: LiveRoomParticipantSnapshot[],
  next: LiveRoomParticipantSnapshot[]
) => {
  if (previous.length !== next.length) return false;

  return previous.every((participant, index) => {
    const nextParticipant = next[index];

    return (
      participant.id === nextParticipant.id &&
      participant.name === nextParticipant.name &&
      participant.isLocal === nextParticipant.isLocal &&
      participant.canPublish === nextParticipant.canPublish &&
      participant.isMicrophoneEnabled === nextParticipant.isMicrophoneEnabled &&
      participant.audioTrackSid === nextParticipant.audioTrackSid &&
      participant.isSpeaking === nextParticipant.isSpeaking &&
      participant.audioLevel === nextParticipant.audioLevel
    );
  });
};

const getAudioTrackSid = (participant: Participant) => {
  const publication = Array.from(participant.audioTrackPublications.values())[0];
  return publication?.trackSid ?? null;
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
              audioTrackSid: getAudioTrackSid(room.localParticipant),
              isSpeaking: room.localParticipant.isSpeaking,
              audioLevel: room.localParticipant.audioLevel,
            },
          ]
        : [];

      const remoteParticipants = Array.from(room.remoteParticipants.values())
        .filter((participant) => !isMusicBotParticipant(participant.identity, participant.name))
        .map((participant) => ({
          id: participant.identity,
          name: participant.name || "Guest",
          isLocal: false,
          canPublish: participant.permissions?.canPublish ?? false,
          isMicrophoneEnabled: participant.isMicrophoneEnabled,
          audioTrackSid: getAudioTrackSid(participant),
          isSpeaking: participant.isSpeaking,
          audioLevel: participant.audioLevel,
        })
      );

      const nextParticipants = [...localParticipants, ...remoteParticipants];
      setParticipants((previous) => (
        areSnapshotsEqual(previous, nextParticipants) ? previous : nextParticipants
      ));
    };

    syncParticipants();
    room.on(RoomEvent.ActiveSpeakersChanged, syncParticipants);
    room.on(RoomEvent.ParticipantConnected, syncParticipants);
    room.on(RoomEvent.ParticipantDisconnected, syncParticipants);
    room.on(RoomEvent.ParticipantPermissionsChanged, syncParticipants);
    room.on(RoomEvent.TrackPublished, syncParticipants);
    room.on(RoomEvent.TrackUnpublished, syncParticipants);
    room.on(RoomEvent.TrackMuted, syncParticipants);
    room.on(RoomEvent.TrackUnmuted, syncParticipants);

    return () => {
      room.off(RoomEvent.ActiveSpeakersChanged, syncParticipants);
      room.off(RoomEvent.ParticipantConnected, syncParticipants);
      room.off(RoomEvent.ParticipantDisconnected, syncParticipants);
      room.off(RoomEvent.ParticipantPermissionsChanged, syncParticipants);
      room.off(RoomEvent.TrackPublished, syncParticipants);
      room.off(RoomEvent.TrackUnpublished, syncParticipants);
      room.off(RoomEvent.TrackMuted, syncParticipants);
      room.off(RoomEvent.TrackUnmuted, syncParticipants);
    };
  }, [room]);

  return { participants };
};
