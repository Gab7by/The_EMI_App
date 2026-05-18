import { supabase } from "@/lib/supabase"

export const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
  const { data, error } = await supabase.functions.invoke("delete-account", {
    body: {},
  })

  if (error) {
    console.error("deleteAccount:", error.message)
    return { success: false, error: error.message }
  }

  if (!data?.success) {
    return {
      success: false,
      error: data?.error ?? "We could not delete your account. Please try again.",
    }
  }

  return { success: true }
}
