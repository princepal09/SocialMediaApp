import {z} from 'zod'

export const registerSchema = z.object({
    username: z.string().trim().regex(/^[A-Za-z0-9_]{3,30}$/, "Use 3–30 letters, numbers, or underscores"),
    email : z.email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters")
      .refine((password) => new TextEncoder().encode(password).length <= 72, "Password is too long"),
     profileImage: z
    .any()
    .refine((file) => !file || file.length <= 1, {
      message: "Only one profile picture is allowed",
    })
    .refine((file) => !file || file.length === 0 || ["image/jpeg", "image/png", "image/webp"].includes(file[0].type),
    "Only Jpeg, PNG or WEBP Images are allowed",
  )
    .refine((file) => !file?.length || file[0].size <= 5 * 1024 * 1024, "Profile images must be 5 MB or smaller"),

})


export type RegisterFormData = z.infer<typeof registerSchema>;
