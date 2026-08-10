import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { logout } from "../../api/auth.api";
import { setLogout } from "../../store/slices/authSlice";
import { Home, LogOut, User2 } from "lucide-react";

const Sidebar = () => {
  const { user } = useSelector((state: RootState) => state.auth);

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

  const baseClass =
    "border border-white/20 text-white px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer flex gap-1 justify-center items-center hover:scale-[1.02]";

  const inactiveClass = "bg-white/20 border-white";
  const activeClass = "bg-[#9929EA] hover:bg-white/10";

  return (
    <aside className="w-64 shrink-0 h-full justify-between flex flex-col items-center border-r border-zinc-800 text-white">
      <div className="flex gap-4 mt-4 flex-col">
        <NavLink
          to={"/feed"}
          end
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : inactiveClass}`
          }
          // className="border flex items-center gap-1 border-white/20 text-white hover:bg-white/10 bg-[#9929EA] px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opactiy-50 cursor-pointer hover:scale-[1.02]"
        >
          <Home size={17} />
          Home
        </NavLink>
        <NavLink
          end
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : inactiveClass}`
          }
          to={`/profile/${user?.username}`}
        >
          <User2 size={17} />
          Profile
        </NavLink>
      </div>

      <div>
        <button
          onClick={handleLogout}
          className="px-3 md:px-4 cursor-pointer flex mb-5 items-center justify-center gap-2 py-1.5 md:py-2 rounded-md bg-red-500 hover:bg-[#8423c8] transition text-sm md:text-base"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
