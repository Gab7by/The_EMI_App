export type TestimonyProfile = {
  full_name: string | null
  avatar_url: string | null
}

export type TestimonyImage = {
  id: string
  image_url: string
}

export type Testimony = {
  id: string
  user_id: string
  content: string
  created_at: string
  profiles: TestimonyProfile | null
}

export type TestimonyWithImages = Testimony & {
  testimony_images: TestimonyImage[] | null
}

export const MAX_TESTIMONY_IMAGES = 3