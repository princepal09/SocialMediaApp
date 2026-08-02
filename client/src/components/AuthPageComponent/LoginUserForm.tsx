import { Link } from "react-router-dom";

const LoginUserForm = () => {
  return (
    <form className="mt-6 w-full max-w-md space-y-5">
      {/* Email */}
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-gray-300">
          Email {""}
          <span className="text-red-400">*</span>
        </label>

        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          className="w-full rounded-lg border border-gray-700 bg-[#1A1A1A] px-4 py-2.5 text-white placeholder:text-gray-500 outline-none transition focus:border-[#9929EA]"
        />
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

        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          className="w-full rounded-lg border border-gray-700 bg-[#1A1A1A] px-4 py-2.5 text-white placeholder:text-gray-500 outline-none transition focus:border-[#9929EA]"
        />
      </div>

      {/* Login Button */}
      <button
        type="submit"
        className="w-full rounded-lg bg-[#9929EA] py-2.5 font-semibold text-white transition hover:bg-[#8420d1]"
      >
        Login
      </button>

      {/* Register Link */}
      <p className="text-center text-sm text-gray-400">
        Don't have an account?{" "}
        <Link
          to={"/register"}
          className="cursor-pointer font-medium text-[#9929EA] hover:underline"
        >
          Register
        </Link>
      </p>
    </form>
  );
};

export default LoginUserForm;
