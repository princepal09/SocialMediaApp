import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPostById } from "../api/post.api";
import Spinner from "../components/general/Spinner";
import EditPostContainer from "../components/EditPostPageComponents/EditPostContainer";
import AppLayout from "../components/Layout/AppLayout";

const EditPostPage = () => {
  const { postId } = useParams();
  return (
    <AppLayout>
      <EditPost key={postId} postId={postId} />
    </AppLayout>
  );
};

function EditPost({ postId }: { postId?: string }) {
  const [content, setContent] = useState<string>();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!postId) return;
    let active = true;
    getPostById(postId)
      .then(({ data }) => {
        if (active) setContent(data.content ?? "");
      })
      .catch((err: { message?: string }) => {
        if (active) setError(err.message || "This post could not be loaded.");
      });
    return () => { active = false; };
  }, [postId]);

  if (error || !postId) {
    return (
      <div className="space-y-4 p-8 text-center">
        <p role="alert">{error || "This post could not be found."}</p>
        <Link to="/feed" className="text-[#d8c6ff] underline">Back to feed</Link>
      </div>
    );
  }
  return content === undefined
    ? <Spinner fullScreen={false} text="Loading post…" />
    : <EditPostContainer content={content} />;
}

export default EditPostPage;
