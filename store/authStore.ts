import { supabase } from "@/lib/supabase"
import { AuthType, ForgotPasswordModalStoreType } from "@/types/auth-types"
import {create} from "zustand"

export const useAuthStore = create<AuthType>(
    (set, get) => ({
        isAuthLoading: false,
        session: null,
        loadAuth: async () => {
            set({isAuthLoading : true})
            const {data} = await supabase.auth.getSession()

            set({session: data?.session ?? null})
            set({isAuthLoading : false})

            const {data: {subscription}} = supabase.auth.onAuthStateChange(
                async (_event, _session) => {
                    console.log(_event)
                    set({session: _session ?? null})
                    console.log("received session: ", _session)
                    console.log("set session: ", get().session)
                }
            )

            return () => {subscription.unsubscribe()}
        }
    }) 
)

export const useForgotPasswordModalStore = create<ForgotPasswordModalStoreType>(
    (set, get) => ({
        isOpen: false,
        setIsOpen: (isOpen: boolean) => set({isOpen: isOpen})
    })
)