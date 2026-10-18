import { supabase } from "@/lib/supabase"
import { AuthType, ForgotPasswordModalStoreType } from "@/types/auth-types"
import {create} from "zustand"
import * as SecureStore from "expo-secure-store"

const GUEST_CHOICE_KEY = "emi_guest_choice"

export const useAuthStore = create<AuthType>(
    (set, get) => ({
        isAuthLoading: true,
        setIsAuthLoading: (isAuthLoading) => set({isAuthLoading}), 
        authStatus: 'loading',
        setAuthStatus: (authStatus) => set({ authStatus }),
        get isGuest() {
            return get().authStatus === 'guest'
        },
        session: null,
        profile: null,
        setSession: (session) => {
            if (session) {
                set({ session, authStatus: 'signed-in' })
            } else {
                // Session cleared - check if guest choice was made
                const currentStatus = get().authStatus
                if (currentStatus === 'guest') {
                    // Keep guest status if user explicitly chose it
                    set({ session: null, profile: null })
                } else {
                    set({ session: null, profile: null, authStatus: 'signed-out' })
                }
            }
        },
        fetchProfile: async (userId) => {
            const { data } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, role')
                .eq('id', userId)
                .single();

            if (data) set({ profile: data });
        },

        clearAuth: () => set({ session: null, profile: null, authStatus: 'signed-out' }),

        enterGuestMode: async () => {
            try {
                await SecureStore.setItemAsync(GUEST_CHOICE_KEY, "true")
            } catch (error) {
                console.error("Failed to persist guest choice:", error)
            }
            set({ authStatus: 'guest' })
        },

        restoreGuestChoice: async () => {
            try {
                const choice = await SecureStore.getItemAsync(GUEST_CHOICE_KEY)
                if (choice === "true") {
                    set({ authStatus: 'guest' })
                } else {
                    set({ authStatus: 'signed-out' })
                }
            } catch (error) {
                console.error("Failed to restore guest choice:", error)
                set({ authStatus: 'signed-out' })
            }
        },
    }) 
)

export const useForgotPasswordModalStore = create<ForgotPasswordModalStoreType>(
    (set, get) => ({
        isOpen: false,
        setIsOpen: (isOpen: boolean) => set({isOpen: isOpen})
    })
)