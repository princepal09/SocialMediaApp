import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getUserConversations } from "../../api/chat.api";
import { MessageCircle } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Conversastion } from "../../types/chat";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { getSocket } from "../../socket";

interface ChatBarProps {
  onConversationClick?: () => void;
}

const ChatBar = ({ onConversationClick }: ChatBarProps) => {
  const [conversations, setConversations] = useState<Conversastion[]>([]);
  const [loading, setLoading] = useState(false);

  const loggedInUser = useSelector((state: RootState) => state.auth.user);

  const loadConversations = useCallback(async () => {
    setLoading(true);

    try {
      const response = await getUserConversations();

      setConversations(response?.data || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to fetch conversations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();

    const socket = getSocket();

    socket?.on("conversation_updated", loadConversations);

    return () => {
      socket?.off("conversation_updated", loadConversations);
    };
  }, [loadConversations]);

  return (
    <aside className="flex h-full w-full flex-col border-l border-white/10 bg-black text-white xl:w-72">
      {/* HEADER */}
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-1">
          <div className="flex h-10 w-10 items-center justify-center">
            <MessageCircle size={20} />
          </div>

          <h2 className="text-lg font-semibold tracking-tight">Chats</h2>
        </div>
      </div>

      {/* CONVERSATIONS */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {loading && (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-2xl p-3 animate-pulse"
              >
                <div className="h-12 w-12 shrink-0 rounded-full bg-zinc-800" />

                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 rounded-full bg-zinc-800" />
                  <div className="h-2.5 w-36 rounded-full bg-zinc-900" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && conversations.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/5 bg-zinc-900">
              <MessageCircle size={28} className="text-zinc-500" />
            </div>

            <p className="text-sm font-semibold text-zinc-200">
              No conversations yet
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Start chatting with someone to see your conversations here.
            </p>
          </div>
        )}

        {!loading && conversations.length > 0 && (
          <div className="space-y-1 flex flex-col md:gap-y-3 gap-y-5">
            {conversations.map((conversation) => {
              const otherUser = conversation.participants.find(
                (p) => p._id !== loggedInUser?._id,
              );

              const hasUnreadMessages = Number(conversation.unreadCount) > 0;

              const userInitial =
                otherUser?.username?.charAt(0).toUpperCase() || "U";

              return (
                <NavLink
                  key={conversation._id}
                  to={`/chat/${otherUser?.username}/rcid/${otherUser?._id}/cid/${conversation._id}`}
                  state={{
                    profileImage: otherUser?.profileImage,
                    username: otherUser?.username,
                  }}
                  onClick={onConversationClick}
                  className={({ isActive }) =>
                    `group relative flex min-h-[64px] w-full items-center gap-3 rounded-2xl p-3 transition-all duration-200 ${
                      isActive
                        ? "bg-white/8 shadow-lg shadow-black/20"
                        : "hover:bg-white/5 active:scale-[0.99]"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute left-0 h-8 w-1 rounded-r-full bg-violet-500" />
                      )}

                      {/* AVATAR */}
                      <div className="relative shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-violet-600 to-purple-700 text-sm font-semibold text-white">
                          {otherUser?.profileImage ? (
                            <img
                              src={otherUser.profileImage}
                              alt={otherUser.username}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            userInitial
                          )}
                        </div>

                        {hasUnreadMessages && (
                          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-zinc-950 bg-violet-500" />
                        )}
                      </div>

                      {/* USER INFO */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`truncate text-sm ${
                              hasUnreadMessages
                                ? "font-bold text-white"
                                : "font-medium text-zinc-300"
                            }`}
                          >
                            {otherUser?.username || "Unknown User"}
                          </p>

                          {hasUnreadMessages && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1.5 text-[10px] font-bold text-white">
                              {conversation.unreadCount > 99
                                ? "99+"
                                : conversation.unreadCount}
                            </span>
                          )}
                        </div>

                        <p
                          className={`mt-1 truncate text-xs ${
                            hasUnreadMessages
                              ? "font-medium text-zinc-300"
                              : "text-zinc-500"
                          }`}
                        >
                          {conversation.lastMessage?.text ||
                            "Start a conversation"}
                        </p>
                      </div>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};

export default React.memo(ChatBar);
