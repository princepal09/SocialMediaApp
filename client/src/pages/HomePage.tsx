import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { ClipLoader } from "react-spinners";

const HomePage = () => {

   

  const { user, loading } = useSelector((state: RootState) => state.auth);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <ClipLoader size={50} color="#2563eb" />
      </div>
    );
  }

  return (
    <div className="text-white min-h-screen bg-[#303030]">
      {user ? <p>{`Welcome to ${user?.username}`}</p> : <p>No User Found</p>}
    </div>
  );
};

export default HomePage;
