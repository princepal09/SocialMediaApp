import RegisterUserForm from "../components/AuthPageComponent/RegisterUserForm";

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-black px-6 py-10">
      {/* Top Section */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <h1 className="text-4xl md:text-5xl tracking-wider font-bold text-[#9929EA]">
          Welcome to Pixora
        </h1>

        <p className="text-gray-300 font-bold tracking-wider text-lg md:text-xl">
          A Place to Flex Your Creation
        </p>
      </div>

      {/* Form Section */}
      <div className="flex justify-center mt-9">
        <div className="w-full max-w-lg rounded-2xl border border-gray-800 bg-[#111111] p-8 shadow-xl">
          <h2 className="mb-6 text-2xl font-semibold text-white">
            Create your account
          </h2>

          <RegisterUserForm />
        </div>  
      </div>
    </div>
  );
};

export default RegisterPage;
