import { supabase } from "@/lib/supabase"
import { AuthType } from "@/types/auth-types"
import {create} from "zustand"

export const useAuthStore = create<AuthType>(
    (set) => ({
        isAuthLoading: false,
        session: null,
        loadAuth: async () => {
            set({isAuthLoading : true})
            const {data} = await supabase.auth.getSession()

            set({session: data?.session ?? null})
            set({isAuthLoading : false})

            const {data: {subscription}} = supabase.auth.onAuthStateChange(
                async (_event, _session) => {
                    set({session: _session ?? null})
                }
            )

            return () => {subscription.unsubscribe()}
        }
    }) 
)