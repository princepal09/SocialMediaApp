import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import Spinner from "../components/general/Spinner";
import { logout } from "../api/auth.api";
import { toast } from "sonner";
import { setLogout } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const { user, loading } = useSelector((state: RootState) => state.auth);

  if (loading) {
    return <Spinner />;
  }

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      const response = await logout();
      toast.success(response?.message || "Logged out successfully");

      dispatch(setLogout());
      navigate("/login");
    } catch (err:any) {
      toast.error(
        err?.message || "Failed to log out. Please try again.",
      );
      console.error(err);
    }
  };

  if(loading){
    return <Spinner/>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl p-8">
        {user ? (
          <>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                {user.username.charAt(0).toUpperCase()}
              </div>

              <h1 className="mt-6 text-3xl font-bold text-white">Welcome 👋</h1>

              <p className="mt-2 text-lg text-gray-300">{user.username}</p>

              <p className="mt-4 text-center text-gray-400">
                Glad to have you back! Explore your dashboard and manage your
                account.
              </p>

              <button
                onClick={handleLogout}
                className="mt-8 w-full rounded-lg bg-red-500 py-3 font-semibold text-white transition-all duration-300 hover:bg-red-600 hover:shadow-lg active:scale-95"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-white">No User Found</h2>
            <p className="mt-2 text-gray-400">Please login to continue.</p>

            <button className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition">
              Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
