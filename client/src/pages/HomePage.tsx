import { useSelector } from "react-redux";
import { RootState } from "../store/store";

const HomePage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  return (
    <div className="text-white">
      {user ? <p>{`Welcome to ${user?.username}`}</p> : <p>No User Found</p>}
    </div>
  );
};

export default HomePage;
