import { Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { getCurrentUser } from "./api/auth.api";
import { setLoading, setUser } from "./store/slices/authSlice";

const App = () => {
  const dispatch = useDispatch();

  const loadCurrentUser = async () => {
    try {
      const response = await getCurrentUser();
      dispatch(setUser(response?.data));
    } catch (err: any) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadCurrentUser();
  }, [dispatch]);

  return (
    <>
      <Routes>
        <Route path="/" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />

        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </>
  );
};

export default App;
