import { Home, User2, LogOut, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "../../store/store";
import { logout } from "../../api/auth.api";
import { setLogout } from "../../store/slices/authSlice";
import { toast } from "sonner";

interface MobileMenuProps {
  onClose: () => void;
}

const MobileMenu = ({ onClose }: MobileMenuProps) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      const response = await logout();

      toast.success(response?.message || "Logged out successfully");

      dispatch(setLogout());

      onClose();

      navigate("/login");
    } catch (err: any) {
      toast.error(
        err?.message || "Failed to log out. Please try again.",
      );
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
    <div className="flex h-full w-full flex-col bg-black text-white">
      {/* HEADER */}
      <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-white/10 px-5">
        <h2 className="text-lg font-semibold text-white">
          Menu
        </h2>

        <button
          type="button"
          onClick={onClose}
          className="
            flex h-10 w-10 items-center justify-center
            text-zinc-400
            transition-colors
            hover:text-white
          "
          aria-label="Close menu"
        >
          <X size={23} />
        </button>
      </div>

      {/* NAVIGATION */}
      <div className="flex-1 px-5 py-6">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.name === "Home"}
                onClick={onClose}
                className={({ isActive }) =>
                  `
                    flex items-center gap-4
                    px-2 py-4
                    text-base font-medium
                    transition-colors
                    ${
                      isActive
                        ? "text-[#9929EA]"
                        : "text-zinc-400 hover:text-white"
                    }
                  `
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={23}
                      className={
                        isActive
                          ? "text-[#9929EA]"
                          : "text-zinc-500"
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

      {/* LOGOUT */}
      <div className="border-t border-white/10 px-5 py-5">
        <button
          type="button"
          onClick={handleLogout}
          className="
            flex w-full items-center gap-4
            px-2 py-4
            text-base font-medium text-red-400
            transition-colors
            hover:text-red-300
          "
        >
          <LogOut size={23} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default MobileMenu;