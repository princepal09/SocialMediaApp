import { useEffect, useState } from "react";
import { Follower } from "../../types/followers";
import { toast } from "sonner";
import { getMyFollowers } from "../../api/chat.api";

const ChatBar = () => {
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchFollowers = async () => {
    setLoading(true);
    try {
      const response = await getMyFollowers();
      setFollowers(response?.data?.followers);
    } catch (err: any) {
      toast.error(err?.message || "Failed to fetch followers");
    }finally{
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchFollowers();
  }, []);

  return (
    <aside className="w-72 flex justify-center shrink-0 h-full border-l border-zinc-800 text-white">
      ChatBar
    </aside>
  );
};

export default ChatBar;
