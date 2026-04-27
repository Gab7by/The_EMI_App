import { getLiveSessions, getParticipantCount } from "@/lib/podcast";
import { useQuery } from "@tanstack/react-query";

export const useLivePodcastSessions = () => {
    return useQuery({
    queryKey: ["live-podcast-sessions"],
    queryFn: () => getLiveSessions(),
    staleTime: 1000 * 60 * 5
})
}

export const useLivePodcastParticipants = (hostId: string, podcastId: string) => {
    return useQuery({
        queryKey: ["live-podcast-participants"],
        queryFn: () => getParticipantCount(hostId, podcastId),
        staleTime: 1000
    })
}