import { CalendarDays, Heart, MessageCircle } from "lucide-react";
import { Post } from "../../types/userProfile";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { toggleLikePost } from "../../api/like.api";
import { toast } from "sonner";

interface UserPostProps {
  post: Post;
}

const UserPost = ({ post }: UserPostProps) => {
  const [likes, setLikes] = useState<string[]>(post.likes);
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [likeCount, setLikeCount] = useState<number>(post.likesCount);
  const [commentCount, setCommentCount] = useState<number>(post.commentCount);
  const isLikedByMe = user ? likes.includes(user._id) : false;

  const handleToggleLike = async () => {
    if (!user) {
      toast.error("Please login to like the post");
      return;
    }

    setLoading(true);
    try {
      if (isLikedByMe) {
        setLikes((prev) => prev.filter((id) => id !== user._id));
        setLikeCount((prev) => prev - 1);
      } else {
        setLikes((prev) => [...prev, user._id]);
        setLikeCount((prev) => prev + 1);
      }

      await toggleLikePost(post._id);
    } catch (err: any) {
      console.log(err);
      if (isLikedByMe) {
        setLikes((prev) => prev.filter((id) => id !== user._id));
        setLikeCount((prev) => prev - 1);
      } else {
        setLikes((prev) => [...prev, user._id]);
        setLikeCount((prev) => prev + 1);
      }

      toast.error(err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
   <section className="mx-auto my-6 w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-lg">
  {/* Header */}
  <div className="flex items-center gap-3 p-4">
    <img
      src={post.owner.profileImage}
      alt={post.owner.username}
      className="h-10 w-10 rounded-full object-cover"
    />

    <div>
      <p className="font-semibold text-white">@{post.owner.username}</p>

      <div className="mt-1 flex items-center gap-1 text-xs text-zinc-400">
        <CalendarDays size={13} />
        {new Date(post.createdAt).toLocaleDateString()}
      </div>
    </div>
  </div>

  {/* Caption */}
  <div className="px-4 pb-3">
    <p className="text-sm text-zinc-200">{post.content}</p>
  </div>

  {/* Image */}
  {post.image && (
    <div className="px-4">
      <img
        src={post.image}
        alt="Post"
        className="w-full h-72 rounded-xl object-cover"
      />
    </div>
  )}

  {/* Footer */}
  <div className="mt-4 flex items-center gap-8 border-t border-zinc-800 px-4 py-3 text-zinc-400">
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggleLike}
        disabled={loading}
        className="text-white hover:text-pink-500 transition"
      >
        <Heart
          size={20}
          className={isLikedByMe ? "fill-pink-500 text-pink-500" : ""}
        />
      </button>
      <span>{likeCount}</span>
    </div>

    <div className="flex items-center gap-2">
      <MessageCircle size={20} />
      <span>{commentCount}</span>
    </div>
  </div>
</section>
  );
};

export default UserPost;
