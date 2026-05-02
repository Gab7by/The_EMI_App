import type { Room } from "livekit-client";
import { useEffect, useState } from "react";

export type LiveRoomParticipantSnapshot = {
  id: string;
  name: string;
  isLocal: boolean;
  canPublish: boolean;
  isMicrophoneEnabled: boolean;
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
        })
      );

      setParticipants([...localParticipants, ...remoteParticipants]);
    };

    syncParticipants();
    const interval = setInterval(syncParticipants, 1000);

    return () => clearInterval(interval);
  }, [room]);

  return { participants };
};
