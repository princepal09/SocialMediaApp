import { useEffect, useState } from "react";
import { Follower } from "../../types/followers";
import { toast } from "sonner";
import { getMyFollowers } from "../../api/chat.api";
import { MessageCircle } from "lucide-react";

const ChatBar = () => {
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFollowers = async () => {
    setLoading(true);

    try {
      const response = await getMyFollowers();
      setFollowers(response?.data?.followers || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to fetch followers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowers();
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
        {!loading && followers.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-5">
            <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center mb-3">
              <MessageCircle size={24} className="text-zinc-500" />
            </div>

            <p className="text-sm font-medium text-zinc-300">No followers</p>

            <p className="text-xs text-zinc-500 mt-1">
              Follow someone to start a conversation
            </p>
          </div>
        )}

        {/* Followers list */}
        {!loading && followers.length > 0 && (
          <div className="space-y-1">
            {followers.map((follower) => (
              <button
                key={follower._id}
                className="w-full flex items-center gap-3 p-3 rounded-xl
                           hover:bg-zinc-900 transition text-left"
              >
                {/* Avatar */}
                <img
                  src={follower.profileImage}
                  alt={follower.username}
                  className="w-11 h-11 rounded-full object-cover border border-zinc-800"
                />

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {follower.username}
                  </p>

                  <p className="text-xs text-zinc-500 truncate mt-0.5">
                    Start a conversation
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

export default ChatBar;
