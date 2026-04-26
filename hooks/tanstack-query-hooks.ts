import { getLiveSessions } from "@/lib/podcast";
import { useQuery } from "@tanstack/react-query";

export const useLivePodcastSessions = () => {
    return useQuery({
    queryKey: ["live-podcast-sessions"],
    queryFn: () => getLiveSessions(),
    staleTime: 1000 * 60 * 5
})
}