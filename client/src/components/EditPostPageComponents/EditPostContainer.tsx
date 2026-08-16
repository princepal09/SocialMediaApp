import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { updatePostContent } from "../../api/post.api";
import EditPostEditor from "./EditPostEditor";
import { ArrowLeft, Upload } from "lucide-react";

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
      <div className="flex min-h-[300px] w-full items-center justify-center px-4">
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <div className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-gray-600 border-t-white" />
          <span>Loading post...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        min-h-full
        w-full
        bg-[#080808]
        px-3
        py-4
        text-white

        sm:px-5
        sm:py-6

        md:px-6
        md:py-8

        lg:px-10
      "
    >
      <div className="mx-auto w-full max-w-3xl">
        {/* ================= HEADER ================= */}

        <div className="mb-5 sm:mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={loading}
            className="
              mb-4
              flex
              items-center
              gap-2
              text-sm
              text-gray-400
              transition
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <h1
            className="
              text-xl
              font-semibold
              tracking-tight

              sm:text-2xl
              md:text-3xl
            "
          >
            Edit Post
          </h1>

          <p
            className="
              mt-1
              max-w-xl
              text-sm
              leading-relaxed
              text-gray-500
            "
          >
            Make changes to your post and save them when you're done.
          </p>
        </div>

        {/* ================= EDITOR CARD ================= */}

        <div
          className="
            w-full
            overflow-hidden
            rounded-xl
            border
            border-white/10
            bg-[#121217]
            shadow-2xl
            shadow-black/20

            sm:rounded-2xl
          "
        >
          {/* ================= CARD HEADER ================= */}

          <div
            className="
              flex
              items-center
              justify-between
              gap-3
              border-b
              border-white/10
              px-4
              py-3

              sm:px-5
              sm:py-4
            "
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-200">Post Content</p>

              <p className="mt-0.5 text-xs text-gray-500">
                Update your content below
              </p>
            </div>

            <div
              className="
                shrink-0
                rounded-full
                border
                border-white/10
                bg-white/5
                px-2.5
                py-1
                text-xs
                text-gray-400

                sm:px-3
              "
            >
              Editing
            </div>
          </div>

          {/* ================= EDITOR ================= */}

          <div
            className="
              min-h-[280px]
              w-full
              overflow-hidden

              sm:min-h-[350px]
              md:min-h-[400px]
            "
          >
            <EditPostEditor value={editorContent} onChange={setEditorContent} />
          </div>

          {/* ================= FOOTER ================= */}

          <div
            className="
              flex
              flex-col
              gap-4
              border-t
              border-white/10
              px-4
              py-4

              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:px-5
            "
          >
            {/* INFO */}
            <p
              className="
                text-xs
                leading-relaxed
                text-gray-500
                sm:max-w-[220px]
              "
            >
              Changes will be saved to your post.
            </p>

            {/* BUTTONS */}
            <div
              className="
                flex
                w-full
                gap-3

                sm:w-auto
              "
            >
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={loading}
                className="
                  flex-1
                  rounded-lg
                  border
                  border-white/10
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-gray-300
                  transition

                  hover:bg-white/5
                  hover:text-white

                  active:scale-[0.98]

                  disabled:cursor-not-allowed
                  disabled:opacity-50

                  sm:flex-none
                  sm:py-2
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePostContent}
                disabled={loading}
                className="
                  flex
                  flex-1
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-[#9929EA]
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition

                  hover:bg-[#7d0bce]

                  active:scale-[0.98]

                  disabled:cursor-not-allowed
                  disabled:opacity-50

                  sm:min-w-[140px]
                  sm:flex-none
                  sm:py-2
                "
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    <span>Save Changes</span>
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
