import { AuthType } from "@/types/auth-types"
import {create} from "zustand"

export const useAuthStore = create<AuthType>(
    (set, get) => ({
        token: null,
        login: () => set({token: "loggedIn"}),
        logout: () => set({token: null})
    }) 
)