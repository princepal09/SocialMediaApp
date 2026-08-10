import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { updatePostContent } from "../../api/post.api";
import EditPostEditor from "./EditPostEditor";
import { ArrowLeft, Upload, UploadIcon } from "lucide-react";

interface Props {
  content: string;
}

const EditPostContainer = ({ content }: Props) => {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [editorContent, setEditorContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (content) {
      setEditorContent(content);
    }
  }, [content]);

  const handlePostContent = async () => {
    if (
      !editorContent ||
      editorContent === "<p></p>" ||
      editorContent.replace(/<[^>]*>/g, "").trim() === ""
    ) {
      toast.error("Post cannot be empty");
      return;
    }

    if (!postId) {
      toast.error("Post ID missing");
      return;
    }

    try {
      setLoading(true);

      await updatePostContent(postId, editorContent);

      toast.success("Post updated successfully");

      navigate("/");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update post");
    } finally {
      setLoading(false);
    }
  };

  if (!content) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-600 border-t-white" />
          <span>Loading post...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0f] px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="mb-5 flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            <ArrowLeft size={14} />
            Back
          </button>

          <h1 className="text-2xl font-semibold tracking-tight">Edit Post</h1>

          <p className="mt-1 text-sm text-gray-500">
            Make changes to your post and save them when you're done.
          </p>
        </div>

        {/* Editor Card */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121217] shadow-2xl shadow-black/20">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <p className="text-sm font-medium text-gray-200">Post Content</p>

              <p className="mt-0.5 text-xs text-gray-500">
                Update your content below
              </p>
            </div>

            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400">
              Editing
            </div>
          </div>

          {/* Editor */}
          <div className="min-h-[300px]">
            <EditPostEditor value={editorContent} onChange={setEditorContent} />
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-3 border-t border-white/10 bg-white/[0.02] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500">
              Changes will be saved to your post.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={loading}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePostContent}
                disabled={loading}
                className="flex min-w-[120px] text-white cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#9929EA] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#7d0bce] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPostContainer;
