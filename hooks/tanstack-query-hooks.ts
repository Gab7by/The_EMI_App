import { getActiveLivePodcastParticipants, getLiveSessions, getParticipantCount } from "@/lib/podcast";
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
        queryKey: ["live-podcast-participants", podcastId, hostId],
        queryFn: () => getParticipantCount(podcastId, hostId),
        refetchInterval: 2000,
        staleTime: 1000
    })
}

export const useActiveLivePodcastParticipants = (podcastId: string) => {
    return useQuery({
        queryKey: ["active-live-podcast-participants", podcastId],
        queryFn: () => getActiveLivePodcastParticipants(podcastId),
        refetchInterval: 2000,
        staleTime: 1000,
    })
}
