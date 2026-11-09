import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import { useDispatch, useSelector } from "react-redux";
import { lazy, Suspense, useEffect } from "react";
import { getCurrentUser } from "./api/auth.api";
import { setLogout, setUser } from "./store/slices/authSlice";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import ErrorPage from "./pages/ErrorPage";
import Spinner from "./components/general/Spinner";
import { RootState } from "./store/store";
import { connectSocket, disconnectSocket } from "./socket";
import { toast } from "sonner";

const FeedPage = lazy(() => import("./pages/FeedPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const UploadPostPage = lazy(() => import("./pages/UploadPostPage"));
const EditPostPage = lazy(() => import("./pages/EditPostPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));

const App = () => {
  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    getCurrentUser()
      .then((response) => dispatch(setUser(response.data)))
      .catch(() => dispatch(setLogout()));
  }, [dispatch]);

  useEffect(() => {
    if (!user?._id) return;

    const socket = connectSocket();
    const showNotification = ({ message }: { message: string }) => toast.info(message);
    const events = ["postLiked", "postComment", "userFollowed"];

    events.forEach((event) => socket.on(event, showNotification));

    return () => {
      events.forEach((event) => socket.off(event, showNotification));
      disconnectSocket();
    };
  }, [user?._id]);

  return (
    <>
      <div className="min-h-screen w-full overflow-x-hidden bg-[#000000]">
        <Suspense fallback={<Spinner text="Loading Pixora…" />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
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
                <UploadPostPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/:username/post/edit/:postId"
            element={
              <ProtectedRoute>
                <EditPostPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:username/rcid/:receiverId/cid/:conversationId"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          {/* 404 Route - Keep this last */}
          <Route path="*" element={<ErrorPage />} />
        </Routes>
        </Suspense>
      </div>
    </>
  );
};

export default App;
