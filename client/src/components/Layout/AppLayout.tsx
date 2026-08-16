import { useState } from "react";
import { X } from "lucide-react";

import Navbar from "../general/Navbar";
import Sidebar from "../general/Sidebar";
import MobileBottomNav from "./MobileBottomNav";
import ChatBar from "../general/ChatBar";
import MobileMenu from "./MobileMenu";

const AppLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /* ================= CHAT ================= */

  const handleChatClick = () => {
    setChatOpen(true);
    setMenuOpen(false);
  };

  const handleCloseChat = () => {
    setChatOpen(false);
  };

  /* ================= MENU ================= */

  const handleMenuClick = () => {
    setMenuOpen(true);
    setChatOpen(false);
  };

  const handleCloseMenu = () => {
    setMenuOpen(false);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-black text-white">
      {/* ================= NAVBAR ================= */}
      <Navbar />

      {/* ================= BODY ================= */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* DESKTOP / LAPTOP SIDEBAR */}
        <aside className="hidden h-full w-64 shrink-0 lg:block">
          <Sidebar />
        </aside>

        {/* MAIN CONTENT */}
        <main className="min-w-0 flex-1 overflow-y-auto pb-13 lg:pb-0">
          {children}
        </main>

        {/* DESKTOP CHAT BAR */}
        <aside className="hidden h-full w-72 shrink-0 xl:block">
          <ChatBar />
        </aside>
      </div>

      {/* ================= MOBILE + TABLET BOTTOM NAV ================= */}
      <MobileBottomNav
        onChatClick={handleChatClick}
        onMenuClick={handleMenuClick}
      />

      {/* ================= MOBILE + TABLET FULL SCREEN MENU ================= */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] bg-black lg:hidden">
          <MobileMenu onClose={handleCloseMenu} />
        </div>
      )}

      {/* ================= MOBILE + TABLET CHAT ================= */}
      {chatOpen && (
        <div className="fixed inset-0 z-[100] bg-black lg:hidden">
          {/* CLOSE BUTTON */}
          <button
            type="button"
            onClick={handleCloseChat}
            className="
              absolute right-4 top-4 z-20
              flex h-10 w-10
              items-center justify-center
              text-zinc-400
              transition
              hover:text-white
            "
            aria-label="Close chat"
          >
            <X size={22} />
          </button>

          {/* CHAT BAR */}
          <ChatBar
            onConversationClick={handleCloseChat}
          />
        </div>
      )}
    </div>
  );
};

export default AppLayout;