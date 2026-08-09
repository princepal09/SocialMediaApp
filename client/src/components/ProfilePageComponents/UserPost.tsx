import {
  CalendarDays,
  Heart,
  MessageCircle,
  Pencil,
  Trash,
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
import { Link } from "react-router-dom";
import { deletePost } from "../../api/post.api";
import ConfirmationModal from "../general/ConfirmationModal";

interface UserPostProps {
  post: Post;
  onDeletePost: (postId: string) => void;
}

const UserPost = ({ post, onDeletePost }: UserPostProps) => {
  const [likes, setLikes] = useState<string[]>(post.likes);
  const { user } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(false);
  const [likeCount, setLikeCount] = useState<number>(post.likesCount);

  const isLikedByMe = user ? likes.includes(user._id) : false;

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [createCommentLoading, setCreateCommentLoading] = useState(false);
  const [commentsCount, setCommentsCount] = useState<number>(
    post.commentCount
  );

  const [deleteLoading, setDeleteLoading] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

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
      if (isLikedByMe) {
        setLikes((prev) => [...prev, user._id]);
        setLikeCount((prev) => prev + 1);
      } else {
        setLikes((prev) => prev.filter((id) => id !== user._id));
        setLikeCount((prev) => prev - 1);
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
      toast.error(err?.message || "Failed to fetch comments");
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
      const newComment = await createComment(
        post._id,
        commentText
      );

      setComments((prev) => [newComment.data, ...prev]);
      setCommentsCount((prev) => prev + 1);
      setCommentText("");

      toast.success("Comment added");
    } catch (err: any) {
      toast.error(err?.message || "Failed to add comment");
    } finally {
      setCreateCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setDeleteLoading(true);

    try {
      await deleteComment(post._id, commentId);

      setComments((prev) =>
        prev.filter((comment) => comment._id !== commentId)
      );

      setCommentsCount((prev) => Math.max(0, prev - 1));

      toast.success("Comment deleted successfully");
    } catch (err: any) {
      toast.error(
        err?.message || "Failed to delete the comment"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    if (contentRef.current) {
      const element = contentRef.current;

      setIsOverflowing(
        element.scrollHeight > element.clientHeight
      );
    }
  }, [post.content]);

  const handleDeletePost = () => {
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      const response = await deletePost(post._id);

      onDeletePost(post._id);

      toast.success(
        response.message || "Post deleted successfully",);

      setShowConfirm(false);
    } catch (err: any) {
      toast.error(
        err?.message || "Failed to delete post",);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <section>
        <div className="px-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">
                @{post.owner.username}
              </p>

              <div className="mt-1 flex items-center gap-1 text-xs text-zinc-400">
                <CalendarDays size={13} />

                {new Date(
                  post.createdAt
                ).toLocaleDateString()}
              </div>
            </div>

            {user?.username === post.owner.username && (
              <div className="flex items-center justify-center gap-5">
                <Link
                  className="text-[#9929EA] transition hover:text-[#5f1792]"
                  to={`/profile/${user.username}/post/edit/${post._id}`}
                >
                  <Pencil size={18} />
                </Link>

                <button
                  type="button"
                  onClick={handleDeletePost}
                  className="cursor-pointer text-red-500 transition-all hover:text-red-800"
                >
                  <Trash size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="relative mt-3 px-4">
          <div
            ref={contentRef}
            className={`prose prose-invert max-w-none text-white transition-all duration-300 ${
              expanded
                ? ""
                : "line-clamp-3 overflow-hidden"
            }`}
            dangerouslySetInnerHTML={{
              __html: post.content,
            }}
          />

          {isOverflowing && (
            <button
              type="button"
              onClick={() =>
                setExpanded((prev) => !prev)
              }
              className="mt-1 text-sm text-blue-400 hover:underline"
            >
              {expanded ? "Read less" : "Read more"}
            </button>
          )}
        </div>

        {post.image && (
          <div className="mt-3 px-4">
            <img
              src={post.image}
              alt="Post"
              className="h-72 w-full rounded-xl object-cover"
            />
          </div>
        )}

        <div className="mt-4 flex items-center gap-8 px-4 py-3 text-zinc-400">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleLike}
              disabled={loading}
              className="text-white transition hover:text-pink-500"
            >
              <Heart
                size={20}
                className={
                  isLikedByMe
                    ? "fill-pink-500 text-pink-500"
                    : ""
                }
              />
            </button>

            <span>{likeCount}</span>
          </div>

          <button
            type="button"
            onClick={handleToggleComments}
            className="flex items-center gap-2 transition hover:text-white"
          >
            <MessageCircle size={20} />
            <span>{commentsCount}</span>
          </button>
        </div>

        {showComments && (
          <div className="mt-4 space-y-3 px-4 pt-4">
            {loadingComments ? (
              <Spinner fullScreen={false} />
            ) : comments.length === 0 ? (
              <p className="text-sm text-zinc-400">
                No comments yet.
              </p>
            ) : (
              comments.map((comment) => {
                const isPostOwner =
                  user?._id === post.owner._id;

                const isCommentOwner =
                  user?._id === comment.commentedBy._id;

                const canDelete =
                  isPostOwner || isCommentOwner;

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

                        <p className="text-sm text-zinc-300">
                          {comment.comment}
                        </p>
                      </div>
                    </div>

                    {canDelete && (
                      <button
                        type="button"
                        disabled={deleteLoading}
                        onClick={() =>
                          handleDeleteComment(comment._id)
                        }
                        className="text-red-400 transition hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                );
              })
            )}

            <div className="flex gap-2 pt-2">
              <input
                value={commentText}
                onChange={(e) =>
                  setCommentText(e.target.value)
                }
                placeholder="Write a comment..."
                className="flex-1 rounded-md bg-zinc-800 px-3 py-2 text-white outline-none"
              />

              <button
                type="button"
                disabled={createCommentLoading}
                onClick={handleAddComment}
                className="rounded-md bg-blue-600 px-4 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {createCommentLoading
                  ? "Posting..."
                  : "Post"}
              </button>
            </div>
          </div>
        )}
      </section>

      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
      />
    </>
  );
};

export default UserPost;