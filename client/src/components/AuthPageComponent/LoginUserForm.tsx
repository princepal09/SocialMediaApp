import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import {
  loginSchema,
  type LoginFormData,
} from "../../schemas/loginSchema";
import { useState } from "react";
import {
  FaRegEye,
  FaRegEyeSlash,
  FaUser,
  FaLock,
} from "react-icons/fa";
import { loginUser } from "../../api/auth.api";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/slices/authSlice";

const LoginUserForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const submitHandler = async (data: LoginFormData) => {
    const toastId = toast.loading("Signing you in...");

    try {
      const response = await loginUser(data);

      console.log("Login Response", response);

      dispatch(setUser(response?.data?.user));

      toast.success(response?.message || "Welcome back!");

      reset();

      navigate("/feed");
    } catch (err: any) {
      console.log(err);

      toast.error(err?.message ?? "Something went wrong");
    } finally {
      toast.dismiss(toastId);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      className="w-full space-y-5"
    >
      {/* Username or Email */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="identifier"
          className="text-sm font-medium text-gray-300"
        >
          Username or Email
          <span className="ml-1 text-red-400">*</span>
        </label>

        <div className="relative">
          <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500" />

          <input
            {...register("identifier")}
            id="identifier"
            type="text"
            placeholder="Enter username or email"
            autoComplete="username"
            className={`w-full rounded-xl border bg-[#151515] py-3 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-gray-600
              ${
                errors.identifier
                  ? "border-red-500/70 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                  : "border-white/10 hover:border-white/20 focus:border-[#9929EA] focus:ring-4 focus:ring-[#9929EA]/10"
              }`}
          />
        </div>

        {errors.identifier && (
          <p className="text-xs text-red-400">
            {errors.identifier.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-300"
          >
            Password
            <span className="ml-1 text-red-400">*</span>
          </label>

          {/* Change this route when you create forgot password page */}
          <Link
            to="/forgot-password"
            className="text-xs font-medium text-[#b85cff] transition hover:text-[#d28cff] hover:underline sm:text-sm"
          >
            Forgot password?
          </Link>
        </div>

        <div className="relative">
          <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500" />

          <input
            {...register("password")}
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            autoComplete="current-password"
            className={`w-full rounded-xl border bg-[#151515] py-3 pl-11 pr-12 text-sm text-white outline-none transition-all placeholder:text-gray-600
              ${
                errors.password
                  ? "border-red-500/70 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                  : "border-white/10 hover:border-white/20 focus:border-[#9929EA] focus:ring-4 focus:ring-[#9929EA]/10"
              }`}
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-white"
            aria-label={
              showPassword ? "Hide password" : "Show password"
            }
          >
            {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
          </button>
        </div>

        {errors.password && (
          <p className="text-xs text-red-400">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Login Button */}
      <button
        disabled={isSubmitting}
        type="submit"
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all duration-200
          ${
            isSubmitting
              ? "cursor-not-allowed bg-gray-700"
              : "bg-gradient-to-r from-[#9929EA] to-[#7b1bd1] shadow-lg shadow-[#9929EA]/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#9929EA]/30 active:translate-y-0"
          }`}
      >
        {isSubmitting && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        )}

        {isSubmitting ? "Signing In..." : "Sign In"}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4 py-1">
        <div className="h-px flex-1 bg-white/10" />

        <span className="text-xs text-gray-600">
          OR
        </span>

        <div className="h-px flex-1 bg-white/10" />
      </div>

      {/* Register Link */}
      <p className="text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-semibold text-[#b85cff] transition hover:text-[#d28cff]"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
};

export default LoginUserForm;