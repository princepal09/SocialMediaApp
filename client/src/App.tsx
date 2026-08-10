import { Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { getCurrentUser } from "./api/auth.api";
import { setLogout, setUser } from "./store/slices/authSlice";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import FeedPage from "./pages/FeedPage";
import ProfilePage from "./pages/ProfilePage";
import ErrorPage from "./pages/ErrorPage";
import UploadPostPage from "./pages/UploadPostPage";
import EditPostImage from "./pages/EditPostPage";

const App = () => {
  const dispatch = useDispatch();

  const loadCurrentUser = async () => {
    try {
      const response = await getCurrentUser();
      dispatch(setUser(response?.data));
    } catch (err: any) {
      dispatch(setLogout());
      console.log(err);
    }
  };

  useEffect(() => {
    loadCurrentUser();
  }, [dispatch]);

  return (
    <>
      <div className="min-h-screen w-full overflow-x-hidden bg-[#000000]">
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <FeedPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/profile/:username"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload-post"
            element={
              <ProtectedRoute>
                <UploadPostPage/>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/:username/post/edit/:postId"
            element={
              <ProtectedRoute>
                <EditPostImage/>
              </ProtectedRoute>
            }
          />
           {/* 404 Route - Keep this last */}
        <Route path="*" element={<ErrorPage />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
