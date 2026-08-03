import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { User2 } from "lucide-react";

interface NProps {
  handleLogout: () => void;
}

const Navbar = ({ handleLogout }: NProps) => {
  const { user } = useSelector((state: RootState) => state.auth);
  return (
    <nav className="text-white justify-between items-center flex md:px-20 md:py-4 border-2-b border-[#230737] shadow-[#230737]">
      <h1 className="md:text-3xl font-bold text-[#9929EA]">Pixora</h1>

      {user?.profileImage ? (
        <div className="flex justify-center items-center gap-4">
          <img
            className="w-[20px] rounded-full bg-cover"
            src={user?.profileImage}
          />
          <span>{user?.username}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <User2 />
      )}
    </nav>
  );
};

export default Navbar;
