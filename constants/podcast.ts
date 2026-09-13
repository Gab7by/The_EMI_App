import { SliderItem } from "@/types/ui-commons-props";

// The raw bundled assets, kept as a plainly-typed `number[]` (not
// `SliderItem[]`) specifically so they can double as per-item
// `fallbackSource` values for admin-uploaded slider images elsewhere
// (lib/homeSlider.ts) without a type-narrowing cast at every call site.
export const BUNDLED_SLIDER_IMAGE_SOURCES: number[] = [
    require("@/assets/pictures/slider-image-1.jpg"),
    require("@/assets/pictures/slider-image-2.png"),
    require("@/assets/pictures/slider-image-3.jpg"),
    require("@/assets/pictures/slider-image-4.jpg"),
    require("@/assets/pictures/slider-image-5.jpg"),
    require("@/assets/pictures/slider-image-6.jpg"),
]

export const imageItems: SliderItem[] = BUNDLED_SLIDER_IMAGE_SOURCES.map((source, index) => ({
    id: String(index + 1),
    source,
}))

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

