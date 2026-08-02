import {z} from 'zod'

export const registerSchema = z.object({
    username : z.string().min(3, "Username must be at least 3 characters"),
    email : z.email("Invalid email"),
    password : z.string().min(8, "Password must be at least 8 characters"),
     profileImage: z
    .any()
    .refine((file) => file?.length > 0, {
      message: "Profile image is required",
    }),
})


export type RegisterFormData = z.infer<typeof registerSchema>;