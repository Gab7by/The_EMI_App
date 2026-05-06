import * as ImagePicker from "expo-image-picker"
import { supabase } from "./supabase"
import { UploadResult } from "@/types/storage-types"

export const pickImage = async (options?:{
    allowsEditing?: boolean,
    aspect?: [number, number]
}) => {

    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status != "granted") {
        return null
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: options?.allowsEditing ?? true,
        aspect: options?.aspect ?? [1, 1],
        quality: 0.8
    })

    if (result.canceled) return null

    return result.assets[0]
}

export const pickFromCamera = async ():Promise<ImagePicker.ImagePickerAsset | null> => {

    const {status} = await ImagePicker.requestCameraPermissionsAsync()

    if (status !== "granted") return null

    const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8
    })

    if (result.canceled) return null

    return result.assets[0]
}

export const uploadImage = async (
    asset: ImagePicker.ImagePickerAsset,
    bucket: string,
    path: string
): Promise<UploadResult | null> => {

    const response = await fetch(asset.uri)

    const arrayBuffer = await response.arrayBuffer()

    const fileExt = asset.uri.split('.').pop()?.toLowerCase() ?? 'jpg'
    const mimeType = asset.mimeType ?? `image/${fileExt}`

    const {error} = await supabase.storage
        .from(bucket)
        .upload(path, arrayBuffer, {
            contentType: mimeType,
            upsert: true
        })

    if (error) {
        console.error('uploadImage error: ', error.message)
        return null
    }

    const {data: {publicUrl}} = supabase.storage
        .from(bucket)
        .getPublicUrl(path)

    return {url: publicUrl, path}
}

export const uploadPodcastBackground = async (
    asset: ImagePicker.ImagePickerAsset,
    podcastId: string,
    currentCoverUrl: string | null
): Promise<string | null> => {

    const fileExt = asset.uri.split('.').pop()?.toLowerCase() ?? 'jpg'
    const path = `${podcastId}/cover-${Date.now()}.${fileExt}`

    const result = await uploadImage(asset, 'podcast-covers', path)
    if (!result) return null

    const {error} = await supabase
        .from('live_podcasts')
        .update({cover_image_url: result.url})
        .eq('id', podcastId)

    if (error) {
        console.error('Podcast Cover update error: ', error.message)
        return null
    }

    if (currentCoverUrl) {
        const oldPath = currentCoverUrl.split('/podcast-covers/')[1]?.split('?')[0]
        if (oldPath) {
            await supabase.storage.from('podcast-covers').remove([oldPath])
        }
    }

    return result.url
}