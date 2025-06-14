import { z } from "zod"

export const registerSchema = z.object({
    email: z.string().regex(/^[\w-\.]+@gmail\.com$/, 'Email must be @gmail.com'),
    displayname: z.string().min(1, "display name is required").min(2, "display name must be at least 2 characters"),
    username: z.string().min(1, "Username is required").min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_.]+$/, "Username can only contain letters, numbers, underscores and periods"),
    password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

export type RegisterFormData = z.infer<typeof registerSchema>
