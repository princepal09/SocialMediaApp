import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { getPostById } from "../api/post.api";
import Spinner from "../components/general/Spinner";
import EditPostContainer from "../components/EditPostPageComponents/EditPostContainer";
import AppLayout from "../components/Layout/AppLayout";

const EditPostPage = () => {
  const { postId } = useParams();

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  const getPost = async () => {
    if (!postId) {
      toast.error("Post id not found");
      return;
    }

    try {
      setLoading(true);

      const response = await getPostById(postId);

      setContent(response.data.content);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch post");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPost();
  }, [postId]);

  return (
    <AppLayout>
      {loading ? (
        <div className="flex h-full items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <EditPostContainer content={content} />
      )}
    </AppLayout>
  );
};

export default EditPostPage;