import { useFeaturedTeaching } from "@/hooks/tanstack-query-hooks"
import { hapticMedium, hapticSuccess } from "@/lib/haptics"
import { updateFeaturedTeaching } from "@/lib/featuredTeaching"
import { queryClient } from "@/lib/query"
import {
  MAX_DECLARATION_LENGTH,
  MAX_DEVOTIONAL_MESSAGE_LENGTH,
  MAX_PRAYER_LENGTH,
  MAX_SCRIPTURE_REFERENCE_LENGTH,
  MAX_TITLE_LENGTH,
} from "@/types/featured-teaching-types"
import { useRouter } from "expo-router"
import { ArrowLeft, BookOpen, Heart, Megaphone, PenLine, Sparkles, type LucideIcon } from "lucide-react-native"
import { useEffect, useMemo, useState } from "react"
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

type SectionFieldProps = {
  icon: LucideIcon
  label: string
  hint: string
  value: string
  onChangeText: (value: string) => void
  placeholder: string
  maxLength: number
  minHeight?: number
  /** A short headline field (Title) reads better as one line than as a
   * scaled-down version of the multiline sections below it. */
  singleLine?: boolean
}

const SectionField = ({ icon: Icon, label, hint, value, onChangeText, placeholder, maxLength, minHeight, singleLine }: SectionFieldProps) => (
  <View className="mt-5 rounded-2xl bg-menorah-darkGreen p-4">
    <View className="flex-row items-center gap-2">
      <View className="h-7 w-7 items-center justify-center rounded-full bg-menorah-primary/15">
        <Icon size={14} color="#C6FF00" />
      </View>
      <Text className="text-sm font-semibold text-white">{label}</Text>
    </View>
    <Text className="mt-1 text-[11px] text-menorah-muted">{hint}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      multiline={!singleLine}
      maxLength={maxLength}
      placeholder={placeholder}
      placeholderTextColor="#8A9A90"
      style={singleLine ? undefined : { minHeight }}
      className="mt-3 text-[15px] leading-6 text-white"
      textAlignVertical={singleLine ? "center" : "top"}
    />
    <Text className="mt-2 self-end text-[11px] text-menorah-gray">
      {value.length}/{maxLength}
    </Text>
  </View>
)

const EditFeaturedTeachingScreen = () => {
  const router = useRouter()
  const { data: featuredTeaching, isLoading } = useFeaturedTeaching()
  const [title, setTitle] = useState("")
  const [scriptureReference, setScriptureReference] = useState("")
  const [devotionalMessage, setDevotionalMessage] = useState("")
  const [prayer, setPrayer] = useState("")
  const [declaration, setDeclaration] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Seeds the form once the current teaching loads - a ref-guarded effect
  // would be overkill here since this screen is only ever mounted fresh
  // (there's nothing else that could re-trigger it after the first load).
  useEffect(() => {
    if (featuredTeaching) {
      setTitle(featuredTeaching.title)
      setScriptureReference(featuredTeaching.scripture_reference)
      setDevotionalMessage(featuredTeaching.devotional_message)
      setPrayer(featuredTeaching.prayer)
      setDeclaration(featuredTeaching.declaration)
    }
  }, [featuredTeaching])

  const canSave = useMemo(
    () =>
      title.trim().length > 0 &&
      scriptureReference.trim().length > 0 &&
      devotionalMessage.trim().length > 0 &&
      prayer.trim().length > 0 &&
      declaration.trim().length > 0 &&
      !isSaving,
    [title, scriptureReference, devotionalMessage, prayer, declaration, isSaving]
  )

  const handleSave = async () => {
    if (!featuredTeaching || !canSave) return

    hapticMedium()
    setIsSaving(true)
    const updated = await updateFeaturedTeaching(featuredTeaching.id, {
      title,
      scriptureReference,
      devotionalMessage,
      prayer,
      declaration,
    })
    setIsSaving(false)

    if (!updated) {
      console.error("EditFeaturedTeachingScreen: failed to update featured teaching")
      Alert.alert(
        "Could not publish",
        "Something went wrong. Please check your connection and try again."
      )
      return
    }

    hapticSuccess()
    queryClient.invalidateQueries({ queryKey: ["featured-teaching"] })
    router.back()
  }

  if (isLoading || !featuredTeaching) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-menorah-bg">
        <ActivityIndicator size="large" color="#C6FF00" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-menorah-bg px-4">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-grow pt-2"
          // Declaration (the last section) plus the Publish button sit
          // right at the bottom of the form - without generous extra
          // room here, the keyboard covers both by the time you scroll
          // down to them, since a ScrollView can only ever scroll as far
          // as its own content actually extends. This just gives it
          // somewhere to scroll to.
          contentContainerStyle={{ paddingBottom: 280 }}
        >
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
            >
              <ArrowLeft size={22} color="white" />
            </Pressable>
            <View>
              <Text className="text-xl font-bold text-white">Edit Featured Teaching</Text>
              <Text className="text-xs text-menorah-muted">
                Shared on the home screen until you change it again
              </Text>
            </View>
          </View>

          <SectionField
            icon={Sparkles}
            label="Title"
            hint="The headline shown on the home screen"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Walking In Sonship"
            maxLength={MAX_TITLE_LENGTH}
            singleLine
          />

          <SectionField
            icon={BookOpen}
            label="Scriptural Reference"
            hint="The verse reference and its text"
            value={scriptureReference}
            onChangeText={setScriptureReference}
            placeholder={'e.g. "Romans 8:28 - And we know that all things work together for good..."'}
            maxLength={MAX_SCRIPTURE_REFERENCE_LENGTH}
            minHeight={70}
          />

          <SectionField
            icon={PenLine}
            label="Devotional Message"
            hint="The actual teaching for today"
            value={devotionalMessage}
            onChangeText={setDevotionalMessage}
            placeholder="Share today's word..."
            maxLength={MAX_DEVOTIONAL_MESSAGE_LENGTH}
            minHeight={200}
          />

          <SectionField
            icon={Heart}
            label="Prayer"
            hint="A prayer the reader can pray along with"
            value={prayer}
            onChangeText={setPrayer}
            placeholder="Father, thank You for..."
            maxLength={MAX_PRAYER_LENGTH}
            minHeight={110}
          />

          <SectionField
            icon={Megaphone}
            label="Declaration"
            hint="A bold statement of faith to declare"
            value={declaration}
            onChangeText={setDeclaration}
            placeholder="I declare that..."
            maxLength={MAX_DECLARATION_LENGTH}
            minHeight={90}
          />

          <Pressable
            onPress={handleSave}
            disabled={!canSave}
            className={`mt-8 items-center rounded-full py-6 ${canSave ? "bg-menorah-primary" : "bg-menorah-darkGreen opacity-60"}`}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#0B1F0E" />
            ) : (
              <Text className={`text-base font-bold ${canSave ? "text-menorah-bg" : "text-white/60"}`}>
                Publish
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default EditFeaturedTeachingScreen
