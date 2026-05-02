import type { ImagePickerAsset } from "expo-image-picker";
import { uploadImage } from "./storage";
import { supabase } from "./supabase";

export const updateProfilePicture = async (
    userId: string,
    asset: ImagePickerAsset
): Promise<string | null> => {

    const fileExt = asset.uri.split('.').pop()?.toLocaleLowerCase() ?? 'jpg'
    const path = `${userId}/avatar.${fileExt}`

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

    return result.url
}