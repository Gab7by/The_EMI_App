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

export type AuthType  = {
    isAuthLoading: boolean
    setIsAuthLoading: (isAuthLoading: boolean) => void
    session: Session | null;
    profile: Profile | null;
    setSession: (session: Session | null) => void;
    fetchProfile: (userId: string) => Promise<void>;
    clearAuth: () => void;
}

export type ForgotPasswordModalStoreType = {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void
}