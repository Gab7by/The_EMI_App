export type FeaturedTeaching = {
  id: string
  title: string
  scripture_reference: string
  devotional_message: string
  prayer: string
  declaration: string
  updated_by: string | null
  updated_at: string
  created_at: string
}

// The home screen card only ever shows a preview - this is how many
// lines the devotional message clips to before the "Read more" hand-off
// to the full screen.
export const FEATURED_TEACHING_HOME_MESSAGE_LINES = 3

export const MAX_TITLE_LENGTH = 120
export const MAX_SCRIPTURE_REFERENCE_LENGTH = 400
export const MAX_DEVOTIONAL_MESSAGE_LENGTH = 4000
export const MAX_PRAYER_LENGTH = 1200
export const MAX_DECLARATION_LENGTH = 800
