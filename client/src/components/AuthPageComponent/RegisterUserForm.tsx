import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import {
  registerSchema,
  type RegisterFormData,
} from "../../schemas/registerSchema";
import { useRef, useState } from "react";
import {
  FaRegEye,
  FaRegEyeSlash,
  FaUser,
  FaEnvelope,
  FaLock,
  FaImage,
} from "react-icons/fa";

import { registerUser } from "../../api/auth.api";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/slices/authSlice";

const RegisterUserForm = () => {
  const {
    register,
    reset,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const profileImageRegister = register("profileImage");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleRemoveImage = () => {
    setSelectedImage(null);

    setValue("profileImage", undefined);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const submitHandler = async (data: RegisterFormData) => {
    const toastId = toast.loading("Creating your account...");

    try {
      const response = await registerUser(data);

      console.log("Register Response", response);

      dispatch(setUser(response?.data?.user));

      toast.success(response?.message || "Account created successfully!");

      reset();

      navigate("/feed");
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong");
    } finally {
      toast.dismiss(toastId);
    }
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="w-full space-y-5">
      {/* Username & Email */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Username */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="username"
            className="text-sm font-medium text-gray-300"
          >
            Username <span className="text-red-400">*</span>
          </label>

          <div className="relative">
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500" />

            <input
              {...register("username")}
              id="username"
              type="text"
              placeholder="Your username"
              className={`w-full rounded-xl border bg-[#151515] py-3 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-gray-600
                ${
                  errors.username
                    ? "border-red-500/70 focus:border-red-500"
                    : "border-white/10 hover:border-white/20 focus:border-[#9929EA] focus:ring-4 focus:ring-[#9929EA]/10"
                }`}
            />
          </div>

          {errors.username && (
            <p className="text-xs text-red-400">{errors.username.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-300">
            Email <span className="text-red-400">*</span>
          </label>

          <div className="relative">
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500" />

            <input
              {...register("email")}
              id="email"
              type="email"
              placeholder="you@example.com"
              className={`w-full rounded-xl border bg-[#151515] py-3 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-gray-600
                ${
                  errors.email
                    ? "border-red-500/70 focus:border-red-500"
                    : "border-white/10 hover:border-white/20 focus:border-[#9929EA] focus:ring-4 focus:ring-[#9929EA]/10"
                }`}
            />
          </div>

          {errors.email && (
            <p className="text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* Password */}
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-gray-300">
          Password <span className="text-red-400">*</span>
        </label>

        <div className="relative">
          <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500" />

          <input
            {...register("password")}
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            className={`w-full rounded-xl border bg-[#151515] py-3 pl-11 pr-12 text-sm text-white outline-none transition-all placeholder:text-gray-600
              ${
                errors.password
                  ? "border-red-500/70 focus:border-red-500"
                  : "border-white/10 hover:border-white/20 focus:border-[#9929EA] focus:ring-4 focus:ring-[#9929EA]/10"
              }`}
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-white"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
          </button>
        </div>

        {errors.password && (
          <p className="text-xs text-red-400">{errors.password.message}</p>
        )}
      </div>

      {/* Profile Picture */}

      {/* Profile Picture */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="profilePicture"
          className="text-sm font-medium text-gray-300"
        >
          Profile Picture
          <span className="ml-1 text-xs text-gray-500">(Optional)</span>
        </label>

        <div className="flex items-center gap-3">
          {/* Upload Area */}
          <label
            htmlFor="profilePicture"
            className="group flex min-w-0 flex-1 cursor-pointer items-center gap-4 rounded-xl border border-dashed border-white/15 bg-[#151515] p-4 transition hover:border-[#9929EA]/60 hover:bg-[#9929EA]/5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#9929EA]/10 text-[#b85cff]">
              <FaImage />
            </div>

            {/* File Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-300">
                {selectedImage ? selectedImage.name : "Upload profile picture"}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {selectedImage
                  ? `${(selectedImage.size / 1024).toFixed(1)} KB selected`
                  : "PNG, JPG or WEBP"}
              </p>
            </div>
          </label>

          {/* Remove Button */}
          {selectedImage && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="shrink-0 rounded-lg bg-red-500/10 px-3 py-3 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
            >
              Remove
            </button>
          )}
        </div>

        <input
          {...profileImageRegister}
          ref={(element) => {
            profileImageRegister.ref(element);
            fileInputRef.current = element;
          }}
          id="profilePicture"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            profileImageRegister.onChange(e);

            const file = e.target.files?.[0];

            if (file) {
              setSelectedImage(file);
            }
          }}
        />

        {errors.profileImage?.message && (
          <p className="text-xs text-red-400">
            {errors.profileImage.message.toString()}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all duration-200
          ${
            isSubmitting
              ? "cursor-not-allowed bg-gray-700"
              : "bg-gradient-to-r from-[#9929EA] to-[#7b1bd1] shadow-lg shadow-[#9929EA]/20 hover:-translate-y-0.5 hover:shadow-[#9929EA]/40 active:translate-y-0"
          }`}
      >
        {isSubmitting && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        )}

        {isSubmitting ? "Creating Account..." : "Create Account"}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-gray-600">OR</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      {/* Login */}
      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-[#b85cff] transition hover:text-[#d28cff]"
        >
          Login
        </Link>
      </p>
    </form>
  );
};

export default RegisterUserForm;
