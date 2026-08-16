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

  const navItems = [
    {
      name: "Home",
      path: "/feed",
      icon: Home,
    },
    {
      name: "Profile",
      path: `/profile/${user?.username}`,
      icon: User2,
    },
  ];

  return (
    <aside className="flex h-full w-full flex-col overflow-y-auto border-r border-white/10 bg-black text-white md:w-64">
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-5">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.name === "Home"}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-lg shadow-violet-900/30"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={19}
                      className={
                        isActive
                          ? "text-white"
                          : "text-zinc-500 transition group-hover:text-violet-400"
                      }
                    />

                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User + Logout */}
      <div className="border-t border-white/10 p-3">
        {/* User */}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="
    group flex w-full items-center gap-2 rounded-xl
    px-4 py-3 text-sm font-medium text-red-400
    transition-all duration-200
    hover:bg-white/5 hover:text-red-300
    active:scale-[0.98]
  "
        >
          <LogOut
            size={18}
            className="transition-transform group-hover:-translate-x-1"
          />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
