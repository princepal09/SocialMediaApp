import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import {
  registerSchema,
  type RegisterFormData,
} from "../../schemas/registerSchema";
import { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

const RegisterUserForm = () => {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const [showPassword, setShowPassword] = useState(false);

  const submitHandler = (data: RegisterFormData) => {
    const formData = new FormData();

    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("profileImage", data.profileImage[0]);

    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      className="mt-2 w-full max-w-2xl space-y-4"
    >
      {/* Username & Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Username */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="username"
            className="text-sm font-medium text-gray-300"
          >
            Username <span className="text-red-400">*</span>
          </label>

          <input
            {...register("username")}
            id="username"
            type="text"
            placeholder="Enter username"
            className="rounded-lg border border-gray-700 bg-[#1A1A1A] px-4 py-2.5 text-white placeholder:text-gray-500 outline-none transition focus:border-[#9929EA]"
          />

          {errors.username && (
            <p className="text-sm text-red-500">{errors.username.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-300">
            Email <span className="text-red-400">*</span>
          </label>

          <input
            {...register("email")}
            id="email"
            type="email"
            placeholder="Enter email"
            className="rounded-lg border border-gray-700 bg-[#1A1A1A] px-4 py-2.5 text-white placeholder:text-gray-500 outline-none transition focus:border-[#9929EA]"
          />

          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* Password */}
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-gray-300">
          Password <span className="text-red-400">*</span>
        </label>

        <div className="relative">
          <input
            {...register("password")}
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            className="w-full rounded-lg border border-gray-700 bg-[#1A1A1A] px-4 py-2.5 pr-12 text-white placeholder:text-gray-500 outline-none transition focus:border-[#9929EA]"
          />

          <span onClick={() => setShowPassword(prev => !prev)} className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-white">
            {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
          </span>  
        </div>

        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* Profile Picture */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="profilePicture"
          className="text-sm font-medium text-gray-300"
        >
          Profile Picture <span className="text-red-400">*</span>
        </label>

        <input
          {...register("profileImage")}
          id="profilePicture"
          type="file"
          accept="image/*"
          className="rounded-lg border border-dashed border-gray-700 bg-[#1A1A1A] p-2.5 text-sm text-gray-400 file:mr-4 file:rounded-md file:border-0 file:bg-[#9929EA] file:px-4 file:py-2 file:text-white hover:file:bg-[#8420d1]"
        />
        {errors.profileImage?.message && (
          <p className="text-sm text-red-500">
            {errors.profileImage.message.toString()}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`mt-2 w-full rounded-lg py-2.5 font-semibold text-white transition
    ${
      isSubmitting
        ? "cursor-not-allowed bg-gray-600"
        : "bg-[#9929EA] hover:bg-[#8420d1]"
    }`}
      >
        {isSubmitting ? "Creating Account..." : "Create Account"}
      </button>
      {/* Login Link */}
      <p className="text-center text-sm text-gray-400">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-[#9929EA] hover:underline"
        >
          Login
        </Link>
      </p>
    </form>
  );
};

export default RegisterUserForm;
