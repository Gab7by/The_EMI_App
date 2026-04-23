import {createClient} from "@supabase/supabase-js"
import * as SecureStore from "expo-secure-store"

const supabaseUrl = "https://sfyvsubviljljjasbnev.supabase.co"
const supabaseKey = "sb_publishable_NG9r5ZYDV_2JNR4Q2iYQVg_xOqFRDkv"

const SupbaseSecureStoreAdapter = {
    getItem: (key: string) => SecureStore.getItemAsync(key),
    setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
    removeItem: (key: string) => SecureStore.deleteItemAsync(key)
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        storage: SupbaseSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
    }
})