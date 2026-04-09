import { LoginSchema, SignUpSchema } from "@/schemas/auth-schemas"
import * as Zod from "zod"

export type LoginFormType = Zod.infer<typeof LoginSchema>

export type SignUpFormType = Zod.infer<typeof SignUpSchema>