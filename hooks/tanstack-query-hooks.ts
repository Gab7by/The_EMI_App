import { getMusicTracks } from "@/lib/music";
import { getActiveLivePodcastParticipants, getLiveSessions, getParticipantCount } from "@/lib/podcast";
import { getRecentTestimonies, getTestimonies, getTestimonyById } from "@/lib/testimonies";
import { useQuery } from "@tanstack/react-query";

export const useLivePodcastSessions = (hostId?: string) => {
    return useQuery({
        queryKey: ["live-podcast-sessions", hostId ?? 'public'],
        queryFn: () => getLiveSessions(hostId),
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
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    })
}

export const useBackgoundMusicQuery = () => {
    return useQuery({
        queryKey: ["music-tracks"],
        queryFn: () => getMusicTracks(),
        staleTime: 1000 * 60 * 30
    })
}

export const useRecentTestimonies = () => {
    return useQuery({
        queryKey: ["recent-testimonies"],
        queryFn: () => getRecentTestimonies(3),
        staleTime: 1000 * 60 * 5
    })
}

export const useTestimonies = () => {
    return useQuery({
        queryKey: ["testimonies"],
        queryFn: getTestimonies,
        staleTime: 1000 * 60 * 5
    })
}

export const useTestimonyById = (id: string) => {
    return useQuery({
        queryKey: ["testimony", id],
        queryFn: () => getTestimonyById(id),
        enabled: !!id
    })
}
