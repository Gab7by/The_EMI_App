import { LoginSchema, SignUpSchema } from "@/schemas/auth-schemas"
import { Session } from "@supabase/supabase-js"
import * as Zod from "zod"

export type LoginFormType = Zod.infer<typeof LoginSchema>

export type SignUpFormType = Zod.infer<typeof SignUpSchema>

export type AuthType  = {
    isAuthLoading: boolean
    loadAuth: () => Promise<() => void>
    session: Session | null 
}