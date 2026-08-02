import { z} from 'zod'

export const registerSchema = z.object({
    username : z.string().min(3, "Username must be at least 3 characters"),
    email : z.email("Invalid email"),
    password : z.string().min(8, "Password must be at least 8 characters")
})


export type RegisterFormData = z.infer<typeof registerSchema>;