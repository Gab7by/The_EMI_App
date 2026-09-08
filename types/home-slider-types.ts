// The home screen slider is always exactly 6 fixed positions (not an
// open-ended list) - each one either shows the admin's uploaded image for
// that slot, or its bundled default when no custom image has been set.
export const HOME_SLIDER_SLOT_COUNT = 6

export type HomeSliderSlot = {
  position: number // 1-based, 1..HOME_SLIDER_SLOT_COUNT
  image_url: string | null
  storage_path: string | null
  updated_by: string | null
  updated_at: string
}
