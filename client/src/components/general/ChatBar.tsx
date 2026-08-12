import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getUserConversations } from "../../api/chat.api";
import { MessageCircle } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Conversastion } from "../../types/chat";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

const ChatBar = () => {
  const [conversations, setConversations] = useState<Conversastion[]>([]);
  const [loading, setLoading] = useState(false);
  const loggedInUser = useSelector((state: RootState) => state.auth.user);

  const loadConversations = async () => {
    setLoading(true);

    try {
      const response = await getUserConversations();
      setConversations(response?.data || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to fetch followers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  return (
    <aside className="w-72 shrink-0 h-full text-white flex flex-col">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <MessageCircle size={22} />
          <h2 className="text-xl font-semibold">Chats</h2>
        </div>
      </div>

      {/* Followers */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {loading && (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 animate-pulse"
              >
                {/* Avatar skeleton */}
                <div className="w-11 h-11 rounded-full bg-zinc-800" />

                {/* Text skeleton */}
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 rounded bg-zinc-800" />
                  <div className="h-2 w-32 rounded bg-zinc-900" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && conversations.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-5">
            <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center mb-3">
              <MessageCircle size={24} className="text-zinc-500" />
            </div>

            <p className="text-sm font-medium text-zinc-300">
              No Conversations
            </p>

            <p className="text-xs text-zinc-500 mt-1">
              Follow someone to start a conversation
            </p>
          </div>
        )}

        {/* Followers list */}
        {!loading && conversations.length > 0 && (
          <div className="space-y-1">
            {conversations.map((conversation) => {
              const otherUser = conversation.participants.find(
                (p) => p._id !== loggedInUser?._id,
              );
              // console.log(otherUser);

              return (
                <NavLink
                  key={conversation._id}
                  to={`/chat/${otherUser?.username}/rcid/${otherUser?._id}/cid/${conversation._id}`}
                  state={{
                    profileImage: otherUser?.profileImage,
                  }}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 p-3 rounded-xl transition text-left ${
                      isActive
                        ? "bg-zinc-800 text-white"
                        : "hover:bg-zinc-900 text-zinc-300"
                    }`
                  }
                >
                  {/* Avatar */}
                  <img
                    src={otherUser?.profileImage}
                    alt={otherUser?.username}
                    className="w-11 h-11 rounded-full object-cover border border-zinc-800"
                  />

                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {otherUser?.username}
                    </p>

                    <p className="text-xs text-zinc-500 truncate mt-0.5">
                      Start a conversation
                    </p>
                  </div>
                </NavLink>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};

export default ChatBar;
