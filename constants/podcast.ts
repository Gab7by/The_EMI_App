import { SliderItem } from "@/types/ui-commons-props";

export const imageItems: SliderItem[] = [
        {id: "1", source: require("@/assets/pictures/slider-image-1.jpg")},
        {id: "2", source: require("@/assets/pictures/slider-image-2.png")},
        {id: "3", source: require("@/assets/pictures/slider-image-3.jpg")},
        {id: "4", source: require("@/assets/pictures/slider-image-4.jpg")},
        {id: "5", source: require("@/assets/pictures/slider-image-5.jpg")},
        {id: "6", source: require("@/assets/pictures/slider-image-6.jpg")}
    ]

// Used for the live-session list/feed (getLiveSessions/createLivePodcast) -
// checked every screen that renders it and only `id`, `title`, `playlist`,
// `cover_image_url`, `livekit_room_name`, and `host.{id,full_name,avatar_url}`
// are ever read. The full `participants` nested join (every participant who
// EVER joined, each with a full `profiles(*)` row) used to be pulled on
// every fetch of this list and was never read anywhere - for a popular,
// long-running session that's an unbounded, wasted payload multiplied by
// however many people were ever in the room. Live participant data for the
// admin's own room comes from getActiveLivePodcastParticipants instead,
// scoped to one session and only while it's actually open.
export const PODCAST_SELECT = `
  *,
  host:profiles!host_id(id, full_name, avatar_url, role)`

