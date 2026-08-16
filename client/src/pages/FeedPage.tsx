import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import Spinner from "../components/general/Spinner";
import { useEffect, useState } from "react";
import { getFeedPosts } from "../api/feed.api";
import { toast } from "sonner";
import FeedPost from "../components/FeedPageComponents/FeedPost";
import { getSocket } from "../socket";
import { FeedPostType } from "../types/feed";
import AppLayout from "../components/Layout/AppLayout";

const FeedPage = () => {
  const { loading } = useSelector((state: RootState) => state.auth);

  const [feedPosts, setFeedPosts] = useState<FeedPostType[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    const getPosts = async () => {
      setLoadingPosts(true);

      try {
        const response = await getFeedPosts();
        setFeedPosts(response?.data || []);
      } catch (err: any) {
        toast.error(err?.message || "Failed to load feed");
      } finally {
        setLoadingPosts(false);
      }
    };

    getPosts();
  }, []);

  useEffect(() => {
    const socket = getSocket();

    if (!socket) return;

    const handleNewPost = (newPost: FeedPostType) => {
      setFeedPosts((prev) => {
        if (prev.some((p) => p._id === newPost._id)) {
          return prev;
        }

        return [newPost, ...prev];
      });
    };

    socket.on("new_post", handleNewPost);

    return () => {
      socket.off("new_post", handleNewPost);
    };
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    <AppLayout>
      <div className="min-h-full w-full bg-black">
        <div className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-5 sm:py-6 md:px-8 lg:px-10 xl:px-12">
          {/* Feed Header */}
          <div className="mb-6 flex items-end justify-between sm:mb-8">
            <div>
             
            </div>
          </div>

          {loadingPosts ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <Spinner />
            </div>
          ) : feedPosts.length === 0 ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900/30 px-6 py-14 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-2xl">
                  📷
                </div>

                <h2 className="text-lg font-semibold text-white">
                  No posts yet
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                  When people start sharing, their posts will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-5xl space-y-6 sm:space-y-8">
              {feedPosts.map((feedPost) => (
                <FeedPost key={feedPost._id} post={feedPost} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default FeedPage;
