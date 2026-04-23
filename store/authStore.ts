import { supabase } from "@/lib/supabase"
import { AuthType, ForgotPasswordModalStoreType } from "@/types/auth-types"
import {create} from "zustand"

export const useAuthStore = create<AuthType>(
    (set, get) => ({
        isAuthLoading: false,
        setIsAuthLoading: (isAuthLoading) => set({isAuthLoading}), 
        session: null,
        profile: null,
        setSession: (session) => set({ session }),
        fetchProfile: async (userId) => {
            const { data } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, role')
                .eq('id', userId)
                .single();

            if (data) set({ profile: data });
        },

        clearAuth: () => set({ session: null, profile: null })
    }) 
)

export const useForgotPasswordModalStore = create<ForgotPasswordModalStoreType>(
    (set, get) => ({
        isOpen: false,
        setIsOpen: (isOpen: boolean) => set({isOpen: isOpen})
    })
)