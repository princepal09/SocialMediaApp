import RegisterUserForm from "../components/AuthPageComponent/RegisterUserForm";

const RegisterPage = () => {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] px-4 py-8 sm:px-6 sm:py-10">
      
      {/* Background Gradient Glow */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#9929EA]/30 blur-[120px]" />

      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-700/20 blur-[140px]" />

      {/* Additional Center Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#9929EA]/10 blur-[150px]" />

      <div className="relative z-10 mx-auto w-full max-w-xl">
        
        {/* Top Section */}
        <div className="flex flex-col items-center gap-3 pt-4 text-center">
          <div className="rounded-full border border-[#9929EA]/30 bg-[#9929EA]/10 px-4 py-1.5">
            <span className="text-sm font-medium tracking-wider text-purple-300">
              JOIN THE COMMUNITY
            </span>
          </div>

          <h1 className="bg-gradient-to-r from-[#c76cff] via-[#9929EA] to-[#e0a3ff] bg-clip-text text-4xl font-bold tracking-wider text-transparent sm:text-5xl">
            Welcome to Pixora
          </h1>

          <p className="max-w-md text-sm font-medium tracking-wide text-gray-400 sm:text-lg">
            A Place to Flex Your Creation
          </p>
        </div>

        {/* Form Section */}
        <div className="mt-8 sm:mt-10">
          <div className="w-full rounded-2xl border border-white/10 bg-[#111111]/90 p-5 shadow-2xl shadow-purple-950/30 backdrop-blur-xl sm:p-8">
            
            <div className="mb-7">
              <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-[#b85cff]">
                CREATE ACCOUNT
              </p>

              <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                Start your creative journey
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Create your account and start sharing your creativity.
              </p>
            </div>

            <RegisterUserForm />
          </div>
        </div>
      </div>
    </main>
  );
};

export default RegisterPage;