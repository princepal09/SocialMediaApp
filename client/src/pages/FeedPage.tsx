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

  console.log("Feed Posts", feedPosts);

  useEffect(() => {
    const getPosts = async () => {
      try {
        const response = await getFeedPosts();
        setFeedPosts(response?.data);
      } catch (err: any) {
        toast.error(err?.message);
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

        {feedPosts.length > 0 && feedPosts.map((feedPost) => <FeedSection />)}

        <ChatBar />
      </div>
    </div>
  );
};

export default FeedPage;
