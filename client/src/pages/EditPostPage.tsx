import React, { useEffect, useState } from "react";
import Navbar from "../components/general/Navbar";
import Sidebar from "../components/general/Sidebar";
import ChatBar from "../components/general/ChatBar";
import EditPostContainer from "../components/EditPostPageComponents/EditPostContainer";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { getPostById } from "../api/post.api";
import Spinner from "../components/general/Spinner";

const EditPostPage = () => {
  const { postId } = useParams();

  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const getPost = async () => {
    if (!postId) {
      toast.error("Post id not found");
      return;
    }
    try {
      const response = await getPostById(postId);
      setContent(response.data.content);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch post");
    } finally {
      setLoading(false)
    }
  };


  useEffect(() => {
    getPost();
  }, [postId]);

  

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        {/* Scrollable Center */}
        {loading ? (<Spinner/>) : (
          <div className="flex-1 overflow-y-auto">
          <EditPostContainer content={content} />
        </div>
        )}
        

        <ChatBar />
      </div>
    </div>
  );
};

export default EditPostPage;
