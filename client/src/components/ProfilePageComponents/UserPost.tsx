import {
  CalendarDays,
  Heart,
  MessageCircle,
  Trash2,
  User2,
} from "lucide-react";
import { Post } from "../../types/userProfile";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { toggleLikePost } from "../../api/like.api";
import { toast } from "sonner";
import { CommentType } from "../../types/comment";
import {
  createComment,
  deleteComment,
  getCommentByPostId,
} from "../../api/comment.api";
import Spinner from "../general/Spinner";

interface UserPostProps {
  post: Post;
}

const UserPost = ({ post }: UserPostProps) => {
  const [likes, setLikes] = useState<string[]>(post.likes);
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [likeCount, setLikeCount] = useState<number>(post.likesCount);
  const isLikedByMe = user ? likes.includes(user._id) : false;

  const [createCommentLoading, setCreateCommentLoading] =
    useState<boolean>(false);
  const [commentsCount, setCommentsCount] = useState<number>(post.commentCount);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const [showComments, setShowComments] = useState<boolean>(false);
  const [comments, setComments] = useState<CommentType[]>([]);
  // console.log(comments)
  const [commentText, setcommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

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
    <section>
      {/* Header */}
      <div className="px-4">
        <p className="font-semibold text-white">@{post.owner.username}</p>

        <div className="mt-1 flex items-center gap-1 text-xs text-zinc-400">
          <CalendarDays size={13} />
          {new Date(post.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Post content */}
      <div className="relative mt-3 px-4">
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

      {/* Image */}
      {post.image && (
        <div className="mt-3 px-4">
          <img
            src={post.image}
            alt="Post"
            className="h-72 w-full rounded-xl object-cover"
          />
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center gap-8 px-4 py-3 text-zinc-400">
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleLike}
            disabled={loading}
            className="text-white transition hover:text-pink-500"
          >
            <Heart
              size={20}
              className={isLikedByMe ? "fill-pink-500 text-pink-500" : ""}
            />
          </button>

          <span>{likeCount}</span>
        </div>

        <button
          onClick={handleToggleComments}
          className="flex items-center gap-2 transition hover:text-white"
        >
          <MessageCircle size={20} />
          <span>{commentsCount}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="mt-4 space-y-3 px-4 pt-4">
          {loadingComments ? (
            <Spinner fullScreen={false} />
          ) : comments.length === 0 ? (
            <p className="text-sm text-zinc-400">No comments yet.</p>
          ) : (
            comments.map((comment) => {
              const isPostOwner = user?._id === post.owner._id;
              const isCommentOwner = user?._id === comment.commentedBy._id;

              const canDelete = isPostOwner || isCommentOwner;

              return (
                <div
                  key={comment._id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex gap-2">
                    {comment.commentedBy.profileImage ? (
                      <img
                        src={comment.commentedBy.profileImage}
                        alt={comment.commentedBy.username}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <User2 className="h-8 w-8 text-white" />
                    )}

                    <div className="rounded-lg bg-zinc-800 px-3 py-2">
                      <p className="text-sm font-semibold text-white">
                        {comment.commentedBy.username}
                      </p>

                      <p className="text-sm text-zinc-300">{comment.comment}</p>
                    </div>
                  </div>

                  {canDelete && (
                    <button
                      disabled={deleteLoading}
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-red-400 transition hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              );
            })
          )}

          {/* Add Comment */}
          <div className="flex gap-2 pt-2">
            <input
              value={commentText}
              onChange={(e) => setcommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 rounded-md bg-zinc-800 px-3 py-2 text-white outline-none"
            />

            <button
              disabled={createCommentLoading}
              onClick={handleAddComment}
              className="rounded-md bg-blue-600 px-4 text-white hover:bg-blue-700"
            >
              {createCommentLoading ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default UserPost;
