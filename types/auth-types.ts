import { LoginSchema } from "@/schemas/auth-schemas"
import * as Zod from "zod"

export type LoginFormType = Zod.infer<typeof LoginSchema>