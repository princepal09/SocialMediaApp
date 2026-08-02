import RegisterUserForm from "../components/AuthPageComponent/RegisterUserForm";

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-12 items-center">
        
        {/* Left Section */}
        <div className="space-y-5">
          <h1 className="text-4xl md:text-5xl font-bold text-[#9929EA] leading-tight">
            Welcome to Pixora
          </h1>

          <p className="text-gray-300 text-lg md:text-xl max-w-md leading-relaxed">
            Share your creativity, explore amazing artwork, and connect with
            creators from around the world.
          </p>
        </div>

        {/* Right Section */}
        <div className="bg-[#111111] border border-gray-800 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-white mb-2">
            Create your account
          </h2>

          

          <RegisterUserForm />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;