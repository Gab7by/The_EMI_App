import type { ImagePickerAsset } from "expo-image-picker";
import { uploadImage } from "./storage";
import { supabase } from "./supabase";

export const updateProfilePicture = async (
    userId: string,
    asset: ImagePickerAsset,
    currentAvatarUrl: string | null
): Promise<string | null> => {

    const fileExt = asset.uri.split('.').pop()?.toLocaleLowerCase() ?? 'jpg'
    const path = `${userId}/avatar-${Date.now()}.${fileExt}`

    const result = await uploadImage(asset, 'avatars', path)

    if (!result) return null

    const {error} = await supabase
        .from('profiles')
        .update({avatar_url: result.url})
        .eq('id', userId)

    if (error) {
        console.error('Profile Picture update error: ', error.message)
        return null
    }

    if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split('/avatars/')[1]?.split('?')[0]
        if (oldPath) {
            await supabase.storage.from('avatars').remove([oldPath])
        }
    }
    
    return result.url
}

export const updateProfileName = async (
    userId: string,
    fullName: string
): Promise<boolean> => {
    const trimmedName = fullName.trim()

    if (!trimmedName) return false

    const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: trimmedName })
        .eq('id', userId)

    if (profileError) {
        console.error('Profile name update error: ', profileError.message)
        return false
    }

    const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: trimmedName },
    })

    if (authError) {
        console.error('Auth profile name update error: ', authError.message)
        return false
    }

    return true
}
