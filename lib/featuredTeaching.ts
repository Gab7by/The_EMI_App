import { supabase } from "./supabase"
import type { FeaturedTeaching } from "@/types/featured-teaching-types"

const FEATURED_TEACHING_SELECT = `
  id,
  title,
  scripture_reference,
  devotional_message,
  prayer,
  declaration,
  updated_by,
  updated_at,
  created_at
`

/**
 * There is exactly one featured teaching row - the migration seeds it and
 * RLS never grants insert/delete, only update, so this can't drift into
 * having zero or several. `.maybeSingle()` (not `.single()`) just means a
 * still-unmigrated database returns null instead of throwing, so the home
 * screen degrades to its loading/empty state rather than crashing.
 */
export const getFeaturedTeaching = async (): Promise<FeaturedTeaching | null> => {
  const { data, error } = await supabase
    .from('featured_teaching')
    .select(FEATURED_TEACHING_SELECT)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('getFeaturedTeaching:', error.message)
    return null
  }

  return data as unknown as FeaturedTeaching | null
}

export type FeaturedTeachingInput = {
  title: string
  scriptureReference: string
  devotionalMessage: string
  prayer: string
  declaration: string
}

/**
 * Updates the single featured teaching row in place. RLS is the real gate
 * (admins only) - this just performs the update and reports whether it
 * actually changed anything, matching the rest of this app's mutation
 * functions (deleteTestimony, deleteTestimonyComment, ...).
 */
export const updateFeaturedTeaching = async (
  id: string,
  input: FeaturedTeachingInput
): Promise<FeaturedTeaching | null> => {
  const title = input.title.trim()
  const scriptureReference = input.scriptureReference.trim()
  const devotionalMessage = input.devotionalMessage.trim()
  const prayer = input.prayer.trim()
  const declaration = input.declaration.trim()

  if (!title || !scriptureReference || !devotionalMessage || !prayer || !declaration) return null

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('featured_teaching')
    .update({
      title,
      scripture_reference: scriptureReference,
      devotional_message: devotionalMessage,
      prayer,
      declaration,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(FEATURED_TEACHING_SELECT)
    .single()

  if (error) {
    console.error('updateFeaturedTeaching:', error.message)
    return null
  }

  return data as unknown as FeaturedTeaching
}
