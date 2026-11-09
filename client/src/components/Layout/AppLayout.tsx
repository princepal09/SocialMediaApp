import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useDispatch } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { logout } from "../../api/auth.api";
import { setLogout } from "../../store/slices/authSlice";
import Navbar from "../general/Navbar";
import Sidebar from "../general/Sidebar";
import ConfirmationModal from "../general/ConfirmationModal";
import Spinner from "../general/Spinner";
import MobileBottomNav from "./MobileBottomNav";
import MobileMenu from "./MobileMenu";

const ChatBar = lazy(() => import("../general/ChatBar"));
const wideLayout = "(min-width: 1280px)";

export default function AppLayout() {
  const [panel, setPanel] = useState<"chat" | "menu" | null>(null);
  const [wide, setWide] = useState(() => window.matchMedia(wideLayout).matches);
  const [chatMounted, setChatMounted] = useState(wide);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const main = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const query = window.matchMedia(wideLayout);
    const onResize = () => {
      setWide(query.matches);
      if (query.matches) {
        setChatMounted(true);
        setPanel(null);
      }
    };
    query.addEventListener("change", onResize);
    return () => query.removeEventListener("change", onResize);
  }, []);

  useLayoutEffect(() => {
    if (main.current) main.current.scrollTop = 0;
  }, [pathname]);

  const openChat = () => {
    setChatMounted(true);
    setPanel("chat");
  };

  const closePanel = () => setPanel(null);

  const requestLogout = () => {
    setLogoutError("");
    setLogoutOpen(true);
  };

  const confirmLogout = async () => {
    setLogoutPending(true);
    setLogoutError("");
    try {
      await logout();
    } catch (error) {
      const failure = error as { status?: number; message?: string };
      if (failure.status !== 401) {
        setLogoutError(failure.message || "Couldn’t log out. Please try again.");
        return;
      }
    } finally {
      setLogoutPending(false);
    }
    dispatch(setLogout());
    navigate("/login", { replace: true });
    toast.success("You’ve been logged out.");
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-black text-white">
      <Navbar />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="hidden h-full w-64 shrink-0 lg:block">
          <Sidebar onLogout={requestLogout} onChat={openChat} />
        </aside>
        <main ref={main} className="min-w-0 flex-1 overflow-y-auto pb-13 lg:pb-0">
          <Suspense fallback={<Spinner fullScreen={false} text="Loading Pixora…" />}>
            <Outlet />
          </Suspense>
        </main>
        {chatMounted && (
          <aside className={wide ? "h-full w-72 shrink-0" : panel === "chat" ? "fixed inset-0 z-[100] bg-black" : "hidden"}>
            {!wide && panel === "chat" && (
              <button type="button" onClick={closePanel} aria-label="Close chats" className="absolute right-4 top-4 z-20 grid size-10 place-items-center text-zinc-400 hover:text-white">
                <X size={22} />
              </button>
            )}
            <Suspense fallback={<p className="p-6 text-sm text-zinc-400">Loading chats…</p>}>
              <ChatBar onConversationClick={closePanel} />
            </Suspense>
          </aside>
        )}
      </div>
      <MobileBottomNav onChatClick={openChat} onMenuClick={() => setPanel("menu")} />
      {panel === "menu" && (
        <div className="fixed inset-0 z-[100] bg-black lg:hidden">
          <MobileMenu onClose={closePanel} onLogout={requestLogout} />
        </div>
      )}
      {logoutOpen && (
        <ConfirmationModal
          isOpen
          title="Log out of Pixora?"
          message="You’ll need to sign in again to access your feed and messages."
          confirmLabel="Log out"
          pendingLabel="Logging out…"
          loading={logoutPending}
          error={logoutError}
          onClose={() => setLogoutOpen(false)}
          onConfirm={confirmLogout}
        />
      )}
    </div>
  );
}
