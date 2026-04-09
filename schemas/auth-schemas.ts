import * as Zod from "zod"

export const LoginSchema =  Zod.object({
    email: Zod.email("Email is invalid"),
    password: Zod.string().nonempty("Password is required")
})

export const SignUpSchema = Zod.object({
    fullName: Zod.string().nonempty("Full name is required"),
    email: Zod.email("Email is invalid"),
    password: Zod.string().nonempty("Password is required").min(8, "Password must be atleast 8 characters"),
    confirmPassword: Zod.string().nonempty("Password is required")
}).refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"]
})