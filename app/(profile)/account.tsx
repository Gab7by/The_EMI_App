import { Colors } from "@/constants/theme"
import { updateProfileName } from "@/lib/profile"
import { useAuthStore } from "@/store/authStore"
import { router } from "expo-router"
import { ArrowLeft, Check, Lock, Mail, User } from "lucide-react-native"
import { useMemo, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const AccountDetailsScreen = () => {
  const profile = useAuthStore((state) => state.profile)
  const session = useAuthStore((state) => state.session)
  const [fullName, setFullName] = useState(profile?.full_name ?? session?.user.user_metadata.full_name ?? "")
  const [isSaving, setIsSaving] = useState(false)

  const currentName = profile?.full_name ?? session?.user.user_metadata.full_name ?? ""
  const email = session?.user.email ?? ""
  const trimmedName = fullName.trim()
  const canSave = useMemo(() => {
    return trimmedName.length >= 2 && trimmedName !== currentName && !isSaving
  }, [currentName, isSaving, trimmedName])

  const handleSave = async () => {
    if (!profile || !canSave) return

    setIsSaving(true)

    const success = await updateProfileName(profile.id, trimmedName)

    if (success) {
      await useAuthStore.getState().fetchProfile(profile.id)
      router.back()
    } else {
      Alert.alert("Update failed", "We could not update your name. Please try again.")
    }

    setIsSaving(false)
  }

  return (
    <SafeAreaView className="flex-1 bg-menorah-bg">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-grow px-4 py-8"
        >
          <View className="flex-row items-center gap-3">
            <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <ArrowLeft size={22} color="white" />
            </Pressable>
            <View>
              <Text className="text-xl font-bold text-white">My Account</Text>
              <Text className="text-xs text-menorah-muted">Manage your account details</Text>
            </View>
          </View>

          <View className="mt-8 rounded-xl bg-menorah-darkGreen p-4">
            <View className="gap-5">
              <View>
                <View className="mb-2 flex-row items-center gap-2">
                  <User size={16} color={Colors.menorah.primary} />
                  <Text className="text-sm font-semibold text-white">Full name</Text>
                </View>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your name"
                  placeholderTextColor="#8A9A90"
                  autoCapitalize="words"
                  autoCorrect={false}
                  className="rounded-xl border border-white/15 bg-white/10 px-4 py-4 text-base text-white"
                />
                <Text className="mt-3 text-xs leading-5 text-menorah-muted">
                  This name is shown on your profile and live podcast sessions.
                </Text>
              </View>

              <View>
                <View className="mb-2 flex-row items-center gap-2">
                  <Mail size={16} color={Colors.menorah.primary} />
                  <Text className="text-sm font-semibold text-white">Email</Text>
                </View>
                <View className="rounded-xl border border-white/10 bg-white/5 px-4 py-4">
                  <Text className="text-base text-white">{email}</Text>
                </View>
              </View>

              <View>
                <View className="mb-2 flex-row items-center gap-2">
                  <Lock size={16} color={Colors.menorah.primary} />
                  <Text className="text-sm font-semibold text-white">Password</Text>
                </View>
                <View className="rounded-xl border border-white/10 bg-white/5 px-4 py-4">
                  <Text className="text-base text-white">********</Text>
                </View>
                <Pressable
                  disabled
                  className="mt-3 h-12 items-center justify-center rounded-full bg-white/5"
                >
                  <Text className="font-semibold text-[#7E8C83]">Change Password</Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View className="mt-auto pt-8">
            <Pressable
              onPress={handleSave}
              disabled={!canSave}
              className={`h-14 flex-row items-center justify-center gap-2 rounded-full ${
                canSave ? "bg-menorah-primary" : "bg-white/10"
              }`}
            >
              {isSaving ? (
                <ActivityIndicator color={Colors.menorah.bg} />
              ) : (
                <>
                  <Check size={20} color={canSave ? Colors.menorah.bg : "#7E8C83"} />
                  <Text className={`font-bold ${canSave ? "text-menorah-bg" : "text-[#7E8C83]"}`}>
                    Save Changes
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default AccountDetailsScreen
