import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createPost } from "../../api/post.api";
import PostEditor from "./PostEditor";
import { Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UploadPostContainer = () => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (!image) {
      setImagePreview("");
      return;
    }

    const url = URL.createObjectURL(image);
    setImagePreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [image]);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setImage(file);
  };

  const removeImage = () => {
    setImage(null);
  };

  const handleCreatePost = async () => {
    const plainText = content
      .replace(/<[^>]*>/g, "")
      .trim();

    if (!plainText) {
      toast.error("Post cannot be empty");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("content", content);

      if (image) {
        formData.append("image", image);
      }

      await createPost(formData);

      toast.success("Post uploaded successfully");
      navigate("/feed");

      setContent("");
      setImage(null);
    } catch (err: any) {
      toast.error(
        err?.message || "Failed to create post"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl shadow-black/20">
        <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/80 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-lg shadow-lg shadow-indigo-500/20">
              ✍️
            </div>

            <div>
              <h2 className="text-sm font-semibold text-white">
                Create Your Post
              </h2>

              <p className="text-xs text-neutral-500">
                Share something with your community
              </p>
            </div>
          </div>

          <span className="hidden rounded-full border border-neutral-800 bg-neutral-800/60 px-3 py-1 text-[10px] font-semibold tracking-wider text-neutral-400 sm:block">
            NEW POST
          </span>
        </div>

        <div className="p-4">
          <PostEditor
            value={content}
            onChange={setContent}
          />
        </div>

        {imagePreview && (
          <div className="px-4 pb-4">
            <div className="group relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
              <img
                src={imagePreview}
                alt="Post preview"
                className="max-h-[420px] w-full object-cover"
              />

              <button
                type="button"
                onClick={removeImage}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-sm text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100 hover:bg-red-500"
              >
                ✕
              </button>

              <div className="absolute bottom-3 left-3 max-w-[80%] truncate rounded-lg bg-black/70 px-3 py-1.5 text-xs text-neutral-200 backdrop-blur-sm">
                {image?.name}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-neutral-800 bg-neutral-900/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <input
              id="post-image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />

            <label
              htmlFor="post-image"
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm font-medium text-neutral-300 transition hover:border-neutral-700 hover:bg-neutral-800 hover:text-white"
            >
              <span>Upload Image</span>
              <Upload size={12}/>
            </label>
            
          </div>

          <button
            type="button"
            onClick={handleCreatePost}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r bg-[#9929EA] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] hover:bg-[#9929EA] hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Posting...
              </>
            ) : (
              <>
                
                Post
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-neutral-600">
        <span>💡</span>
        <span>
          Share your thoughts, images and ideas
        </span>
      </div>
    </div>
  );
};

export default UploadPostContainer;

