import type { ImagePickerAsset } from "expo-image-picker"
import { uploadImage } from "./storage"
import { supabase } from "./supabase"
import type { Testimony, TestimonyWithImages } from "@/types/testimony-types"

const TESTIMONY_SELECT = `
  id,
  user_id,
  content,
  created_at,
  profiles(full_name, avatar_url)
`

export const getRecentTestimonies = async (limit = 3): Promise<Testimony[]> => {
  const { data, error } = await supabase
    .from('testimonies')
    .select(TESTIMONY_SELECT)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('getRecentTestimonies:', error.message)
    return []
  }

  return data as unknown as Testimony[]
}

export const getTestimonies = async (): Promise<Testimony[]> => {
  const { data, error } = await supabase
    .from('testimonies')
    .select(TESTIMONY_SELECT)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getTestimonies:', error.message)
    return []
  }

  return data as unknown as Testimony[]
}

export const getTestimonyById = async (id: string): Promise<TestimonyWithImages | null> => {
  const { data, error } = await supabase
    .from('testimonies')
    .select(`
      ${TESTIMONY_SELECT},
      testimony_images(id, image_url, created_at)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('getTestimonyById:', error.message)
    return null
  }

  return data as unknown as TestimonyWithImages
}

const getTestimonyImageStoragePath = (imageUrl: string): string | null =>
  imageUrl.split('/testimony-images/')[1]?.split('?')[0] ?? null

/**
 * Deletes a testimony and its photos. RLS is the real gate here (see the
 * delete policies on `testimonies`/`testimony_images` - a user may only
 * delete their own row, an admin may delete any) - this just performs the
 * delete and reports whether it actually removed anything, so the caller
 * can tell "not allowed" apart from "already gone."
 */
export const deleteTestimony = async (
  id: string,
  imageUrls: string[] = []
): Promise<boolean> => {
  const storagePaths = imageUrls
    .map(getTestimonyImageStoragePath)
    .filter((path): path is string => !!path)

  if (storagePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from('testimony-images')
      .remove(storagePaths)

    if (storageError) {
      console.warn('deleteTestimony: storage cleanup failed:', storageError.message)
    }
  }

  // Explicit even though the FK may already cascade - keeps this correct
  // regardless of how that constraint is configured.
  const { error: imagesError } = await supabase
    .from('testimony_images')
    .delete()
    .eq('testimony_id', id)

  if (imagesError) {
    console.error('deleteTestimony images:', imagesError.message)
    return false
  }

  const { data, error } = await supabase
    .from('testimonies')
    .delete()
    .eq('id', id)
    .select('id')

  if (error) {
    console.error('deleteTestimony:', error.message)
    return false
  }

  // RLS silently filters out rows you're not allowed to touch rather than
  // erroring - an empty result means the delete was blocked, not applied.
  return (data?.length ?? 0) > 0
}

export const createTestimony = async (
  content: string,
  images: ImagePickerAsset[] = []
): Promise<Testimony | null> => {

  const trimmedContent = content.trim()
  if (!trimmedContent) return null

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('testimonies')
    .insert({
      user_id: user.id,
      content: trimmedContent
    })
    .select(TESTIMONY_SELECT)
    .single()

  if (error) {
    console.error('createTestimony:', error.message)
    return null
  }

  // Upload up to 3 optional images
  if (images.length > 0) {
    const rows: { testimony_id: string; image_url: string }[] = []

    for (const asset of images.slice(0, 3)) {
      const fileExt = asset.uri.split('.').pop()?.toLowerCase() ?? 'jpg'
      const path = `${user.id}/testimony-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`

      const result = await uploadImage(asset, 'testimony-images', path)
      if (result) {
        rows.push({ testimony_id: data.id, image_url: result.url })
      }
    }

    if (rows.length > 0) {
      const { error: imagesError } = await supabase
        .from('testimony_images')
        .insert(rows)

      if (imagesError) {
        console.error('createTestimony images:', imagesError.message)
      }
    }
  }

  return data as unknown as Testimony
}