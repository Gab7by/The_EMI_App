import { LoginSchema, SignUpSchema } from "@/schemas/auth-schemas"
import { Session } from "@supabase/supabase-js"
import * as Zod from "zod"

export type LoginFormType = Zod.infer<typeof LoginSchema>

export type SignUpFormType = Zod.infer<typeof SignUpSchema>

export type Role = 'member' | 'admin'

export type Profile = {
    id: string;
    full_name: string | null
    avatar_url: string | null
    role: Role
}

export type AuthStatus = 'loading' | 'signed-in' | 'guest' | 'signed-out'

export type AuthType  = {
    isAuthLoading: boolean
    setIsAuthLoading: (isAuthLoading: boolean) => void
    authStatus: AuthStatus
    setAuthStatus: (status: AuthStatus) => void
    isGuest: boolean
    session: Session | null;
    profile: Profile | null;
    setSession: (session: Session | null) => void;
    fetchProfile: (userId: string) => Promise<void>;
    clearAuth: () => void;
    enterGuestMode: () => Promise<void>;
    restoreGuestChoice: () => Promise<void>;
}

export type ForgotPasswordModalStoreType = {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void
}