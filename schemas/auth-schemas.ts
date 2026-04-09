import * as Zod from "zod"

export const LoginSchema =  Zod.object({
    email: Zod.email("Email is invalid"),
    password: Zod.string().nonempty("Password is required")
})