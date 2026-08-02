import { Link } from "react-router-dom";

const RegisterUserForm = () => {
  return (
    <form className="mt-2 w-full max-w-2xl space-y-4">
      {/* Username & Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="username"
            className="text-sm font-medium text-gray-300"
          >
            Username {" "}
            <span className="text-red-400">*</span>
          </label>
          <input
            id="username"
            type="text"
            placeholder="Enter username"
            className="rounded-lg border border-gray-700 bg-[#1A1A1A] px-4 py-2.5 text-white placeholder:text-gray-500 outline-none transition focus:border-[#9929EA]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-gray-300"
          >
            Email
            {" "}
            <span className="text-red-400">*</span>
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter email"
            className="rounded-lg border border-gray-700 bg-[#1A1A1A] px-4 py-2.5 text-white placeholder:text-gray-500 outline-none transition focus:border-[#9929EA]"
          />
        </div>
      </div>

      {/* Password */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-gray-300"
        >
          Password
          {" "}
            <span className="text-red-400">*</span>
        </label>
        <input
          id="password"
          type="password"
          placeholder="Create a password"
          className="rounded-lg border border-gray-700 bg-[#1A1A1A] px-4 py-2.5 text-white placeholder:text-gray-500 outline-none transition focus:border-[#9929EA]"
        />
      </div>

      {/* Profile Picture */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="profile"
          className="text-sm font-medium text-gray-300"
        >
            
          Profile Picture
          {" "}
            <span className="text-red-400">*</span>
        </label>

        <input
          id="profile"
          type="file"
          accept="image/*"
          className="rounded-lg border border-dashed border-gray-700 bg-[#1A1A1A] p-2.5 text-sm text-gray-400 file:mr-4 file:rounded-md file:border-0 file:bg-[#9929EA] file:px-4 file:py-2 file:text-white hover:file:bg-[#8420d1]"
        />
      </div>

      {/* Register Button */}
      <button
        type="submit"
        className="mt-2 w-full rounded-lg bg-[#9929EA] py-2.5 font-semibold text-white transition duration-300 hover:bg-[#8420d1]"
      >
        Create Account
      </button>

      {/* Login Link */}
      <p className="text-center text-sm text-gray-400">
        Already have an account?{" "}
        <Link to={"/login"} className="cursor-pointer font-medium text-[#9929EA] hover:underline">
          Login
        </Link>
      </p>
    </form>
  );
};

export default RegisterUserForm;