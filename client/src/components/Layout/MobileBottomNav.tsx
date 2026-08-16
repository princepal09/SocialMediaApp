import { Home, MessageCircle, User2, Menu } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

interface MobileBottomNavProps {
  onMenuClick?: () => void;
  onChatClick?: () => void;
}

const MobileBottomNav = ({
  onMenuClick,
  onChatClick,
}: MobileBottomNavProps) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const navItemClass = (isActive: boolean) =>
    `flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] transition ${
      isActive ? "text-[#9929EA]" : "text-zinc-500 hover:text-white"
    }`;

  return (
    <div
      className="
        fixed bottom-0 left-0 right-0 z-50
       
        bg-black
        lg:hidden
      "
    >
      <div className="flex h-13 items-center justify-around px-2">
        {/* HOME */}
        <NavLink
          to="/feed"
          end
          className={({ isActive }) => navItemClass(isActive)}
        >
          <Home size={22} />
        </NavLink>

        {/* MESSAGE */}
        <button
          type="button"
          onClick={onChatClick}
          className="
            flex flex-1 flex-col items-center
            justify-center gap-1 py-2
            text-[10px] text-zinc-500
            transition hover:text-white
          "
        >
          <MessageCircle size={22} />
        </button>

        {/* PROFILE */}
        <NavLink
          to={`/profile/${user?.username}`}
          className={({ isActive }) => navItemClass(isActive)}
        >
          <User2 size={22} />
        </NavLink>

        {/* MENU */}
        <button
          type="button"
          onClick={onMenuClick}
          className="
            flex flex-1 flex-col items-center
            justify-center gap-1 py-2
            text-[10px] text-zinc-500
            transition hover:text-white
          "
        >
          <Menu size={22} />
        </button>
      </div>
    </div>
  );
};

export default MobileBottomNav;
