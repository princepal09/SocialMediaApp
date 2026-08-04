import { useSelector } from "react-redux";
import { Post } from "../../types/post";
import { RootState } from "../../store/store";
import { useState } from "react";
import { toast } from "sonner";
import { toggleLikePost } from "../../api/like.api";
import { Heart, MessageCircle, User2 } from "lucide-react";
import { Link } from "react-router-dom";

interface FeedPostProps {
  post: Post;
}

const FeedPost = ({ post }: FeedPostProps) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [likes, setLikes] = useState<string[]>(post.likes);
  const [likeCount, setLikeCount] = useState<number>(post.likesCount);
  const [loading, setLoading] = useState<boolean>(false);

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
    <section className="md:px-32 md:py-8 ">
      <div className="post-container flex flex-col gap-2">
        <div className="flex flex-col gap-3">
          {/* Upper Row */}
          <div className="flex items-center gap-x-3">
            <Link to={`/profile/${post?.owner?.username}`}>
              {post?.owner?.profileImage ? (
                <img
                  src={post?.owner?.profileImage}
                  className="w-8 h-8 rounded-full object-cover"
                  alt={post?.owner?.username}
                />
              ) : (
                <User2 className="w-8 h-8 text-white" />
              )}
            </Link>
              <div className="flex items-center">
            <Link to={`/profile/${post?.owner?.username}`}>
              <span className="text-white font-medium">
                {post?.owner?.username}
              </span>
            </Link>
          </div>
           </div>

          

          {/* Bottom Row */}
            <span className="text-[10px] text-gray-400 mt-1">
              {new Date(post?.createdAt).toLocaleString()}
            </span>
         
        
        </div>

        {post.image && (
          <div className="md:my-2">
            <img src={post?.image} className="rounded-xl max-h-105" />
          </div>
        )}

        <p className="text-white">{post?.content}</p>

        <div className="flex items-center gap-5">
          {/* Likes */}
          <div className="flex items-center gap-2">
            <button
              className="flex items-center justify-center text-white hover:text-pink-500 transition disabled:opacity-50 cursor-pointer"
              onClick={handleToggleLike}
              disabled={loading}
            >
              <Heart
                size={20}
                className={`transition ${
                  isLikedByMe ? "fill-pink-500 text-pink-500" : ""
                }`}
              />
            </button>

            <span className="text-sm text-white">{likeCount}</span>
          </div>

          {/* Comments */}
          <div className="flex items-center cursor-pointer disabled:opacity-50 gap-2 hover:text-white/50 transition-all text-white">
            <MessageCircle size={20} />
            <span className="text-sm">{post?.commentsCount}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeedPost;
