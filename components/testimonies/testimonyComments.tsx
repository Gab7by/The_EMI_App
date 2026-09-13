import { getInitial } from "@/components/testimonies/testimonyCard"
import { useTestimonyComments } from "@/hooks/tanstack-query-hooks"
import { formatRecordingDate } from "@/lib/formatters"
import { hapticLight, hapticMedium } from "@/lib/haptics"
import { queryClient } from "@/lib/query"
import { addTestimonyComment, deleteTestimonyComment } from "@/lib/testimonies"
import { useAuthStore } from "@/store/authStore"
import { MAX_TESTIMONY_COMMENT_LENGTH } from "@/types/testimony-types"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { Image } from "expo-image"
import { Trash2 } from "lucide-react-native"
import { memo, useCallback, useState } from "react"
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from "react-native"

type CommentRowProps = {
  id: string
  fullName: string
  avatarUrl: string | null
  content: string
  createdAt: string
  canDelete: boolean
  isDeleting: boolean
  onDelete: (id: string) => void
}

const CommentRow = memo(({ id, fullName, avatarUrl, content, createdAt, canDelete, isDeleting, onDelete }: CommentRowProps) => {
  return (
    <View className="flex-row rounded-xl bg-white/[0.05] p-3">
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={{ width: 32, height: 32, borderRadius: 16 }}
          contentFit="cover"
        />
      ) : (
        <View
          style={{ width: 32, height: 32, borderRadius: 16 }}
          className="items-center justify-center bg-menorah-primary"
        >
          <Text className="text-xs font-bold text-menorah-bg">{getInitial(fullName)}</Text>
        </View>
      )}

      <View className="ml-3 flex-1">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-2">
            <Text className="text-[12px] font-bold text-white" numberOfLines={1}>
              {fullName}
            </Text>
            <Text className="mt-0.5 text-[10px] text-menorah-gray">
              {formatRecordingDate(createdAt)}
            </Text>
          </View>

          {canDelete && (
            <Pressable
              onPress={() => onDelete(id)}
              disabled={isDeleting}
              hitSlop={8}
              className="h-6 w-6 items-center justify-center rounded-full"
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#FFB4A9" />
              ) : (
                <Trash2 size={14} color="#FFB4A9" />
              )}
            </Pressable>
          )}
        </View>

        <Text className="mt-1.5 text-[13px] leading-5 text-white/85">{content}</Text>
      </View>
    </View>
  )
})
CommentRow.displayName = "CommentRow"

type TestimonyCommentsProps = {
  testimonyId: string
}

const TestimonyComments = ({ testimonyId }: TestimonyCommentsProps) => {
  const { data: comments, isLoading } = useTestimonyComments(testimonyId)
  const profile = useAuthStore((state) => state.profile)
  const [draft, setDraft] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const trimmedDraft = draft.trim()
  const canPost = trimmedDraft.length > 0 && !isPosting

  const handlePost = useCallback(async () => {
    if (!canPost) return
    hapticLight()
    setIsPosting(true)
    const comment = await addTestimonyComment(testimonyId, trimmedDraft)
    setIsPosting(false)

    if (!comment) {
      console.error("TestimonyComments: failed to post comment")
      return
    }

    setDraft("")
    queryClient.invalidateQueries({ queryKey: ["testimony-comments", testimonyId] })
  }, [canPost, testimonyId, trimmedDraft])

  const handleDelete = useCallback((id: string) => {
    hapticMedium()
    Alert.alert(
      "Delete comment?",
      "This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeletingId(id)
            const success = await deleteTestimonyComment(id)
            setDeletingId(null)

            if (!success) {
              console.error("TestimonyComments: failed to delete comment", id)
              return
            }

            queryClient.invalidateQueries({ queryKey: ["testimony-comments", testimonyId] })
          },
        },
      ]
    )
  }, [testimonyId])

  return (
    <View className="mt-6 gap-3">
      <Text className="text-[11px] font-bold uppercase tracking-[1.5px] text-menorah-goldDark">
        Comments{comments && comments.length > 0 ? ` (${comments.length})` : ""}
      </Text>

      {isLoading ? (
        <ActivityIndicator size="small" color="#C6FF00" />
      ) : !comments || comments.length === 0 ? (
        <Text className="text-sm text-menorah-muted">
          No comments yet — be the first to encourage them.
        </Text>
      ) : (
        <View className="gap-2">
          {comments.map((comment) => (
            <CommentRow
              key={comment.id}
              id={comment.id}
              fullName={comment.profiles?.full_name ?? "User"}
              avatarUrl={comment.profiles?.avatar_url ?? null}
              content={comment.content}
              createdAt={comment.created_at}
              canDelete={!!profile && (profile.id === comment.user_id || profile.role === "admin")}
              isDeleting={deletingId === comment.id}
              onDelete={handleDelete}
            />
          ))}
        </View>
      )}

      <View className="mt-1 min-h-[44px] flex-row items-center rounded-[14px] border border-white/15 bg-menorah-darkGreen px-3 py-2">
        <TextInput
          placeholder="Write a comment..."
          value={draft}
          onChangeText={setDraft}
          placeholderTextColor="#A9A9A9"
          className="flex-1 text-[13px] text-white"
          returnKeyType="send"
          onSubmitEditing={handlePost}
          maxLength={MAX_TESTIMONY_COMMENT_LENGTH}
          multiline
        />
        <Pressable
          onPress={handlePost}
          disabled={!canPost}
          hitSlop={8}
          className="ml-2 h-8 w-8 items-center justify-center rounded-full"
        >
          {isPosting ? (
            <ActivityIndicator size="small" color="#D7FF00" />
          ) : (
            <MaterialCommunityIcons name="send" size={19} color={canPost ? "#D7FF00" : "#7E8C83"} />
          )}
        </Pressable>
      </View>
    </View>
  )
}

export default TestimonyComments
