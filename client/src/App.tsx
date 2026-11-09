import { Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import { useDispatch, useSelector } from "react-redux";
import { lazy, Suspense, useEffect } from "react";
import { setLogout, setUser } from "./store/slices/authSlice";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import ErrorPage from "./pages/ErrorPage";
import Spinner from "./components/general/Spinner";
import { RootState } from "./store/store";
import { toast } from "sonner";

const AppLayout = lazy(() => import("./components/Layout/AppLayout"));
const FeedPage = lazy(() => import("./pages/FeedPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const UploadPostPage = lazy(() => import("./pages/UploadPostPage"));
const EditPostPage = lazy(() => import("./pages/EditPostPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));

const App = () => {
  const dispatch = useDispatch();

  const { user, loading } = useSelector((state: RootState) => state.auth);
  const shouldRestoreSession = useLocation().pathname !== "/" && loading;

  useEffect(() => {
    if (!shouldRestoreSession) return;
    let active = true;
    void import("./api/auth.api")
      .then(({ getCurrentUser }) => getCurrentUser())
      .then(({ data }) => { if (active) dispatch(setUser(data)); })
      .catch(() => { if (active) dispatch(setLogout()); });
    return () => { active = false; };
  }, [dispatch, shouldRestoreSession]);

  useEffect(() => {
    if (!user?._id) return;

    let active = true;
    let stop: (() => void) | undefined;
    const showNotification = ({ message }: { message: string }) => toast.info(message);
    const events = ["postLiked", "postComment", "userFollowed"];
    const userId = user._id;

    void import("./socket").then(({ socket, startRealtime }) => {
      if (!active) return;
      events.forEach((event) => socket.on(event, showNotification));
      const disconnect = startRealtime(userId);
      stop = () => {
        events.forEach((event) => socket.off(event, showNotification));
        disconnect();
      };
    }).catch(() => {});

    return () => {
      active = false;
      stop?.();
    };
  }, [user?._id]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-black">
      <Suspense fallback={<Spinner text="Loading Pixora…" />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/upload-post" element={<UploadPostPage />} />
            <Route path="/profile/:username/post/edit/:postId" element={<EditPostPage />} />
            <Route path="/chat/:username/rcid/:receiverId/cid/:conversationId" element={<ChatPage />} />
          </Route>
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default App;
