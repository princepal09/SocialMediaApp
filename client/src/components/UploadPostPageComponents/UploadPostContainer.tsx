import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createPost } from "../../api/post.api";
import PostEditor from "./PostEditor";
import { Upload, X, Image, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const videoTypes = ["video/mp4", "video/webm", "video/quicktime"];

const UploadPostContainer = () => {
  const [content, setContent] = useState("");

  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState("");

  const [mediaType, setMediaType] = useState<
    "image" | "video" | null
  >(null);

  const [loading, setLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const navigate = useNavigate();

  // Create preview URL
  useEffect(() => {
    if (!media) { 
      setMediaPreview("");
      setMediaType(null);
      return;
    }

    const url = URL.createObjectURL(media);

    setMediaPreview(url);

    if (media.type.startsWith("image/")) {
      setMediaType("image");
    } else if (media.type.startsWith("video/")) {
      setMediaType("video");
    }

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [media]);

  const handleMediaChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setPreviewError(false);
    if (imageTypes.includes(file.type)) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        e.target.value = "";
        return;
      }

      setMedia(file);
      return;
    }

    if (videoTypes.includes(file.type)) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Video must be less than 50MB");
        e.target.value = "";
        return;
      }

      setMedia(file);
      return;
    }

    toast.error("Choose a JPG, PNG, WebP, GIF, AVIF, MP4, MOV, or WebM file.");

    e.target.value = "";
  };

  const removeMedia = () => {
    setMedia(null);
    setMediaPreview("");
    setMediaType(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCreatePost = async () => {
    const plainText = content.replace(/<[^>]*>/g, "").trim();

    if (!plainText && !media) {
      toast.error("Post cannot be empty");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("content", content);

      if (media && mediaType === "image") {
        formData.append("image", media);
      }

      if (media && mediaType === "video") {
        formData.append("video", media);
      }

      await createPost(formData);

      toast.success("Post uploaded successfully");

      setContent("");
      removeMedia();

      navigate("/feed");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create post"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full p-5 max-w-2xl">
      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl shadow-black/20">
        {/* Header */}
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

        {/* Editor */}
        <div className="p-4">
          <PostEditor
            value={content}
            onChange={setContent}
          />
        </div>

        {/* Media Preview */}
        {mediaPreview && (
          <div className="px-4 pb-4">
            <div className="group relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
              {/* Image Preview */}
              {mediaType === "image" && (
                <img
                  src={mediaPreview}
                  alt="Post preview"
                  className="max-h-[420px] w-full object-cover"
                />
              )}

              {/* Video Preview */}
              {mediaType === "video" && (
                <>
                  <video
                    src={mediaPreview}
                    controls
                    playsInline
                    preload="metadata"
                    aria-label="Video preview"
                    onError={() => setPreviewError(true)}
                    className="max-h-[420px] w-full bg-black object-contain"
                  />
                  {previewError && (
                    <p role="status" className="p-3 text-sm text-neutral-300">
                      This browser can’t preview this file. Pixora converts it to MP4 when you post.
                    </p>
                  )}
                </>
              )}

              {/* Remove Button */}
              <button
                type="button"
                onClick={removeMedia}
                disabled={loading}
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white opacity-100 backdrop-blur-sm transition hover:bg-red-500 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Remove media"
              >
                <X size={18} />
              </button>

              {/* File Name */}
              <div className="absolute top-0  left-3 z-10 max-w-[80%] truncate rounded-lg bg-black/70 px-3 py-1.5 text-xs text-neutral-200 backdrop-blur-sm">
                {media?.name}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t border-neutral-800 bg-neutral-900/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              id="post-media"
              type="file"
              accept={[...imageTypes, ...videoTypes].join(",")}
              className="hidden"
              disabled={loading}
              onChange={handleMediaChange}
            />

            <label
              htmlFor="post-media"
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm font-medium text-neutral-300 transition hover:border-neutral-700 hover:bg-neutral-800 hover:text-white"
            >
              {mediaType === "video" ? (
                <Video size={16} />
              ) : (
                <Image size={16} />
              )}

              <span>Upload Media</span>

              <Upload size={14} />
            </label>
          </div>

          <button
            type="button"
            onClick={handleCreatePost}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#9929EA] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Posting...
              </>
            ) : (
              "Post"
            )}
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-neutral-600">
        <span>💡</span>
        <span>Share your thoughts, images and videos</span>
      </div>
    </div>
  );
};

export default UploadPostContainer;