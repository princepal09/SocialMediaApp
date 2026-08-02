import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { loginSchema, type LoginFormData } from "../../schemas/loginSchema";
import { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { loginUser } from "../../api/auth.api";
import { toast } from "sonner";

const LoginUserForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const submitHandler = async (data: LoginFormData) => {
    console.log(data)
    const toastId = toast.loading("Loading...");
    try {
      const response = await loginUser(data);

      console.log("Login Response", response);
      toast.success(response?.message);
      
    } catch (err: any) {
        console.log(err);
      toast.error(err?.message ?? "Something went wrong");
    }finally{
        toast.dismiss(toastId);
        reset();
    }
  };

  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      className="mt-6 w-full max-w-md space-y-5"
    >
      {/* Username or Email */}
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-gray-300">
          Username Or Email <span className="text-red-400">*</span>
        </label>

        <input
          {...register("identifier")}
          id="email"
          type="text"
          placeholder="Enter your username or email"
          className="w-full rounded-lg border border-gray-700 bg-[#1A1A1A] px-4 py-2.5 text-white placeholder:text-gray-500 outline-none transition focus:border-[#9929EA]"
        />

        {errors.identifier && (
          <p className="text-sm text-red-500">{errors.identifier.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-300"
          >
            Password <span className="text-red-400">*</span>
          </label>

          <button
            type="button"
            className="text-sm text-[#9929EA] hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <div className="relative">
          <input
            {...register("password")}
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            className="w-full rounded-lg border border-gray-700 bg-[#1A1A1A] px-4 py-2.5 pr-12 text-white placeholder:text-gray-500 outline-none transition focus:border-[#9929EA]"
          />

          <span
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-white"
          >
            {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
          </span>
        </div>

        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* Login Button */}
      <button
        disabled={isSubmitting}
        type="submit"
        className={`w-full rounded-lg bg-[#9929EA] py-2.5 font-semibold text-white transition hover:bg-[#8420d1] ${
          isSubmitting
            ? "cursor-not-allowed bg-gray-600"
            : "bg-[#9929EA] hover:bg-[#8420d1]"
        }`}
      >
        {isSubmitting ? "Signing..." : "Sign In"}
      </button>

      {/* Register Link */}
      <p className="text-center text-sm text-gray-400">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-medium text-[#9929EA] hover:underline"
        >
          Register
        </Link>
      </p>
    </form>
  );
};

export default LoginUserForm;
