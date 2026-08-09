import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { User2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../api/auth.api";
import { toast } from "sonner";
import { setLogout } from "../../store/slices/authSlice";

const Navbar = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const handleLogout = async () => {
    try {
      const response = await logout();
      toast.success(response?.message || "Logged out successfully");

      dispatch(setLogout());
      navigate("/login");
    } catch (err: any) {
      toast.error(err?.message || "Failed to log out. Please try again.");
      console.error(err);
    }
  };
  const { user } = useSelector((state: RootState) => state.auth);
  return (
    <nav className="text-white flex justify-between items-center md:px-20 px-4 py-4 border-[#230737]">
      <Link to={"/"} className="text-2xl md:text-3xl font-bold text-[#9929EA]">
        Pixora
      </Link>

      {user ? (
        <div className="flex items-center gap-3 md:gap-5">
          {user.profileImage ? (
            <Link to={`/profile/${user.username}`}>
              <img
                src={user.profileImage}
                alt={user.username}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover border border-[#9929EA]"
              />
            </Link>
          ) : (
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-700 flex items-center justify-center">
              <User2 size={18} />
            </div>
          )}

          <Link to={`/profile/${user.username}`}>
            <span className="hidden sm:block text-sm md:text-base font-medium">
              {user.username}
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="px-3 md:px-4 py-1.5 md:py-2 rounded-md bg-red-500 hover:bg-[#8423c8] transition text-sm md:text-base"
          >
            Logout
          </button>
        </div>
      ) : (
        <User2 className="w-6 h-6" />
      )}
    </nav>
  );
};

export default Navbar;
