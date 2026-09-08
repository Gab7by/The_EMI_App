export type FeaturedTeaching = {
  id: string
  title: string
  content: string
  updated_by: string | null
  updated_at: string
  created_at: string
}

// The home screen card only ever shows a preview - this is how many lines
// of `content` it clips to before the "Read more" hand-off to the full
// screen. Kept here (not hardcoded in the component) since the edit
// screen's max lengths below are chosen with this preview in mind.
export const FEATURED_TEACHING_HOME_PREVIEW_LINES = 3
export const MAX_FEATURED_TEACHING_TITLE_LENGTH = 120
export const MAX_FEATURED_TEACHING_CONTENT_LENGTH = 4000
