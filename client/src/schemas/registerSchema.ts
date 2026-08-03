import {z} from 'zod'

export const registerSchema = z.object({
    username : z.string().min(3, "Username must be at least 3 characters"),
    email : z.email("Invalid email"),
    password : z.string().min(8, "Password must be at least 8 characters"),
     profileImage: z
    .any()
    .refine((file) => !file || file.length <= 1, {
      message: "Only one profile picture is allowed",
    })
    .refine((file) => !file || file.length === 0 || ["image/jpeg", "image/png", "image/webp"].includes(file[0].type),
    "Only Jpeg, PNG or WEBP Images are allowed",
  ),

})


export type RegisterFormData = z.infer<typeof registerSchema>;