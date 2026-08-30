import { getMusicTracks } from "@/lib/music";
import { getActiveLivePodcastParticipants, getLiveSessions } from "@/lib/podcast";
import { getRecentTestimonies, getTestimonies, getTestimonyById } from "@/lib/testimonies";
import { useQuery } from "@tanstack/react-query";

export const useLivePodcastSessions = (hostId?: string) => {
    return useQuery({
        queryKey: ["live-podcast-sessions", hostId ?? 'public'],
        queryFn: () => getLiveSessions(hostId),
        staleTime: 1000 * 60 * 5
    })
}

export const useActiveLivePodcastParticipants = (podcastId: string) => {
    return useQuery({
        queryKey: ["active-live-podcast-participants", podcastId],
        queryFn: () => getActiveLivePodcastParticipants(podcastId),
        // Real-time freshness comes from LiveKit join/leave events triggering
        // an explicit invalidateQueries (see live-podcast-admin.tsx) - that's
        // free (no Supabase request) and instant. This interval is only a
        // safety net for the rare case that path misses something, which is
        // why it can be this long instead of the 2s it used to be: at 2s,
        // for the full duration of every live session, this alone was
        // hammering Supabase with ~1800 requests/hour, each pulling a full
        // `profiles(*)` join per active participant, whether or not anything
        // had actually changed.
        refetchInterval: 30_000,
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
