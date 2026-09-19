import { MaterialCommunityIcons } from "@expo/vector-icons"

export type LearningPath = {
  id: string
  icon: keyof typeof MaterialCommunityIcons.glyphMap
  title: string
  description: string
  moduleCount: number
  /** Unlocked paths are tappable and route to their own detail screen
   * (app/(discipleship)/[id].tsx, matched by `id`); locked ones show a
   * lock icon and aren't pressable. */
  locked: boolean
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: "school-of-spiritual-foundation",
    icon: "school",
    title: "School Of Spiritual Foundation",
    description: "Build a strong foundation in Christian principles and practices",
    moduleCount: 12,
    locked: false,
  },
  {
    id: "school-of-ministry",
    icon: "hands-pray",
    title: "School Of Ministry",
    description: "Discover and develop your spiritual gifts for service",
    moduleCount: 16,
    locked: true,
  },
  {
    id: "sonship-submission",
    icon: "human-child",
    title: "Sonship Submission",
    description: "Understanding your identity as a child of God",
    moduleCount: 8,
    locked: true,
  },
  {
    id: "mentorship",
    icon: "account-supervisor",
    title: "Mentorship",
    description: "One-on-one guidance from experience spiritual leaders.",
    moduleCount: 10,
    locked: true,
  },
  {
    id: "school-of-christian-mysticism",
    icon: "meditation",
    title: "School Of Christian Mysticism",
    description: "Deep dive into contemplative prayer and spiritual intimacy.",
    moduleCount: 10,
    locked: true,
  },
]

export const getLearningPath = (id: string): LearningPath | undefined =>
  LEARNING_PATHS.find((path) => path.id === id)
