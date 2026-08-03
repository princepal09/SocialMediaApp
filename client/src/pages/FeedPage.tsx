import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import Spinner from "../components/general/Spinner";

import Navbar from "../components/general/Navbar";
import Sidebar from "../components/general/Sidebar";
import ChatBar from "../components/general/ChatBar";
import FeedSection from "../components/FeedPageComponents/FeedSection";
import { useEffect, useState } from "react";
import { Post } from "../types/post";
import { getFeedPosts } from "../api/feed.api";
import { toast } from "sonner";

const FeedPage = () => {
  const { loading } = useSelector((state: RootState) => state.auth);

  if (loading) {
    return <Spinner />;
  }

  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [loadingPosts, setloadingPosts] = useState<boolean>(false);

  console.log("Feed Posts", feedPosts);

  useEffect(() => {
    const getPosts = async () => {
      setloadingPosts(true);
      try {
        const response = await getFeedPosts();
        setFeedPosts(response?.data);
      } catch (err: any) {
        toast.error(err?.message || "Failed to load error");
      } finally {
        setloadingPosts(false);
      }
    };

    getPosts();
  }, []);
  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container flex text-white">
        <Sidebar />
        {loadingPosts ? (
          <Spinner />
        ) : feedPosts.length === 0 ? (
          <p>No Posts Found</p>
        ) : (
          feedPosts.map((feedPost) => (
            <FeedSection key={feedPost._id} post={feedPost} />
          ))
        )}

        <ChatBar />
      </div>
    </div>
  );
};

export default FeedPage;
