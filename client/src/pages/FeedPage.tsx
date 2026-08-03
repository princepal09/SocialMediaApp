import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import Spinner from "../components/general/Spinner";
import { logout } from "../api/auth.api";
import { toast } from "sonner";
import { setLogout } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/general/Navbar";
import Sidebar from "../components/general/Sidebar";

const FeedPage = () => {
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
    } catch (err: any) {
      toast.error(err?.message || "Failed to log out. Please try again.");
      console.error(err);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <Navbar handleLogout={handleLogout} />

      <div className="container text-white">
        <Sidebar />

        <div>{/* <h1>This is the feed page</h1> */}</div>
      </div>
    </div>
  );
};

export default FeedPage;
