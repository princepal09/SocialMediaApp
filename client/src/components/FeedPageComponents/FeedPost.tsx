import { useSelector } from "react-redux";
import { FeedPostType } from "../../types/feed";
import { RootState } from "../../store/store";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { toggleLikePost } from "../../api/like.api";
import { Heart, MessageCircle, Trash2, User2 } from "lucide-react";
import { Link } from "react-router-dom";
import { CommentType } from "../../types/comment";
import {
  createComment,
  deleteComment,
  getCommentByPostId,
} from "../../api/comment.api";
import Spinner from "../general/Spinner";
import HlsVideoPlayer from "../general/HlsVideoPlayer";

interface FeedPostProps {
  post: FeedPostType;
}

const FeedPost = ({ post }: FeedPostProps) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [likes, setLikes] = useState<string[]>(post.likes);
  const [likeCount, setLikeCount] = useState<number>(post.likesCount);
  const [loading, setLoading] = useState<boolean>(false);
  const [createCommentLoading, setCreateCommentLoading] =
    useState<boolean>(false);
  const [commentsCount, setCommentsCount] = useState<number>(
    post.commentsCount,
  );
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const [showComments, setShowComments] = useState<boolean>(false);
  const [comments, setComments] = useState<CommentType[]>([]);
  // console.log(comments)
  const [commentText, setcommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  const isLikedByMe = user ? likes.includes(user._id) : false;

  const [expanded, setExpanded] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false);

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

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const response = await getCommentByPostId(post._id);
      setComments(response.data);
    } catch (err: any) {
      console.log(err?.message);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleToggleComments = () => {
    setShowComments((prev) => !prev);
    if (!showComments) {
      fetchComments();
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      toast.error("Login to comment");
      return;
    }

    if (!commentText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    setCreateCommentLoading(true);
    try {
      const newComment = await createComment(post._id, commentText);
      setComments((prev) => [newComment.data, ...prev]);
      setCommentsCount((prev) => prev + 1);
      setcommentText("");
      toast.success("Comment added");
    } catch (err: any) {
      toast.error(err.message || "Failed to add comment");
    } finally {
      setCreateCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setDeleteLoading(true);
    try {
      await deleteComment(post._id, commentId);
      setComments((prev) =>
        prev.filter((comment) => comment._id !== commentId),
      );
      setCommentsCount((prev) => prev - 1);
      toast.success("Comment Deleted Successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete the comment");
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    if (contentRef.current) {
      const element = contentRef.current;
      setIsOverflowing(element.scrollHeight > element.clientHeight);
    }
  }, [post.content]);

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

        {/* Post Media */}
        {(post.image || post.video) && (
          <div className="mt-3 px-4">
            {/* Image */}
            {post.image && (
              <img
                src={post.image}
                alt="Post"
                className="max-h-[500px] w-full rounded-xl object-cover"
              />
            )}

            {/* Video */}
            {post.video && (
              <HlsVideoPlayer
                src={post.video}
                className="max-h-[500px] w-full rounded-xl bg-black object-contain"
              />
            )}
          </div>
        )}
        {/* Post content with read more */}
        <div className="relative">
          <div
            ref={contentRef}
            className={`prose prose-invert max-w-none text-white transition-all duration-300 ${
              expanded ? "" : "line-clamp-3 overflow-hidden"
            }`}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {isOverflowing && (
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="mt-1 text-sm text-blue-400 hover:underline"
            >
              {expanded ? "Read less" : "Read more"}
            </button>
          )}
        </div>
        {/* <div
          className="prose prose-invert max-w-none text-white"
          dangerouslySetInnerHTML={{ __html: post.content }}
        ></div> */}

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
          {/* <div className="flex items-center cursor-pointer disabled:opacity-50 gap-2 hover:text-white/50 transition-all text-white">
            <MessageCircle size={20} />
            <span className="text-sm">{post?.commentsCount}</span>
          </div> */}

          <button
            onClick={handleToggleComments}
            className="flex items-center gap-1 cursor-pointer text-white/50 hover:text-white transition-all"
          >
            <MessageCircle size={20} />
            <span className="text-sm">{commentsCount}</span>
          </button>
        </div>

        {/* Comments Section  */}

        {showComments && (
          <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
            {loadingComments ? (
              <Spinner fullScreen={false} />
            ) : comments.length === 0 ? (
              <p className="text-white/60 text-sm">No Comments Yet</p>
            ) : (
              comments?.map((comment) => {
                const isPostOwner = user?._id === post?.owner?._id;
                const isCommentOwner = user?._id === comment.commentedBy._id;
                const canDelete = isPostOwner || isCommentOwner;
                return (
                  <div
                    key={comment._id}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex  gap-2">
                      <img
                        className="w-8 h-8 rounded-full object-cover"
                        src={comment.commentedBy?.profileImage}
                      />
                      <div className="bg-white/5 px-3 py-2 rounded-lg">
                        <p className="text-sm text-white font-bold">
                          {comment?.commentedBy?.username}
                        </p>
                        <p className="text-sm text-white/80 ">
                          {comment.comment}
                        </p>
                      </div>
                    </div>
                    {canDelete && (
                      <button
                        disabled={deleteLoading}
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-red-400 hover:text-red-500 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                );
              })
            )}

            {/* Add Comment  */}
            <div className="flex gap-2 pt-2">
              <input
                value={commentText}
                onChange={(e) => setcommentText(e.target.value)}
                className="flex-1 bg-white/5 text-white px-3 py-2 rounded-md"
                placeholder="Write a comment"
              />
              <button
                disabled={createCommentLoading}
                onClick={handleAddComment}
                className="bg-blue-600 cursor-pointer px-4 rounded-md text-white"
              >
                {createCommentLoading ? "Posting" : "Post"}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeedPost;
