import type { ImagePickerAsset } from "expo-image-picker"
import { BUNDLED_SLIDER_IMAGE_SOURCES } from "@/constants/podcast"
import type { SliderItem } from "@/types/ui-commons-props"
import type { HomeSliderSlot } from "@/types/home-slider-types"
import { uploadImage } from "./storage"
import { supabase } from "./supabase"

const HOME_SLIDER_BUCKET = 'home-slider-images'

const HOME_SLIDER_SLOT_SELECT = `
  position,
  image_url,
  storage_path,
  updated_by,
  updated_at
`

/**
 * There are always exactly 6 rows (one per position) - the migration
 * seeds them and RLS never grants insert/delete, only update, so this
 * can't drift into having more, fewer, or duplicate positions.
 */
export const getHomeSliderSlots = async (): Promise<HomeSliderSlot[]> => {
  const { data, error } = await supabase
    .from('home_slider_images')
    .select(HOME_SLIDER_SLOT_SELECT)
    .order('position', { ascending: true })

  if (error) {
    console.error('getHomeSliderSlots:', error.message)
    return []
  }

  return data as unknown as HomeSliderSlot[]
}

/**
 * Replaces the image for one slider position. Mirrors
 * uploadPodcastBackground: upload the new file first and point the row at
 * it, then clean up whatever file was there before - so a failed upload
 * never leaves the slot pointing at nothing, and a successful one doesn't
 * orphan the old file.
 */
export const updateHomeSliderSlot = async (
  position: number,
  asset: ImagePickerAsset,
  previousStoragePath: string | null
): Promise<HomeSliderSlot | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const fileExt = asset.uri.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `slot-${position}-${Date.now()}.${fileExt}`

  const result = await uploadImage(asset, HOME_SLIDER_BUCKET, path)
  if (!result) return null

  const { data, error } = await supabase
    .from('home_slider_images')
    .update({
      image_url: result.url,
      storage_path: result.path,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('position', position)
    .select(HOME_SLIDER_SLOT_SELECT)
    .single()

  if (error) {
    console.error('updateHomeSliderSlot:', error.message)
    // The file uploaded fine but the row update failed (e.g. RLS) - clean
    // it up rather than leaving an orphaned file nothing points at.
    await supabase.storage.from(HOME_SLIDER_BUCKET).remove([path])
    return null
  }

  if (previousStoragePath) {
    await supabase.storage.from(HOME_SLIDER_BUCKET).remove([previousStoragePath])
  }

  return data as unknown as HomeSliderSlot
}

/** Reverts one slot back to its bundled default image. */
export const resetHomeSliderSlot = async (
  position: number,
  previousStoragePath: string | null
): Promise<boolean> => {
  const { error } = await supabase
    .from('home_slider_images')
    .update({
      image_url: null,
      storage_path: null,
      updated_by: null,
      updated_at: new Date().toISOString(),
    })
    .eq('position', position)

  if (error) {
    console.error('resetHomeSliderSlot:', error.message)
    return false
  }

  if (previousStoragePath) {
    const { error: storageError } = await supabase.storage
      .from(HOME_SLIDER_BUCKET)
      .remove([previousStoragePath])

    if (storageError) {
      console.warn('resetHomeSliderSlot: storage cleanup failed:', storageError.message)
    }
  }

  return true
}

/**
 * Builds what the home screen's slider actually renders: for each of the
 * 6 fixed positions, the admin's custom image if one's been set for it,
 * paired with the bundled default for that same position as its
 * `fallbackSource` (see ImageSlider's onError handling - if the custom
 * URL fails to load, only that slide falls back, not the whole slider).
 * With no data yet (still loading, or the migration hasn't run), every
 * position just shows its bundled default outright.
 */
export const buildHomeSliderItems = (slots: HomeSliderSlot[] | undefined): SliderItem[] => {
  return BUNDLED_SLIDER_IMAGE_SOURCES.map((fallbackSource, index) => {
    const position = index + 1
    const slot = slots?.find((candidate) => candidate.position === position)

    if (slot?.image_url) {
      return { id: String(position), source: { uri: slot.image_url }, fallbackSource }
    }

    return { id: String(position), source: fallbackSource }
  })
}
