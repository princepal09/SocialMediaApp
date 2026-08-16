import { useSelector } from "react-redux";
import { FeedPostType } from "../../types/feed";
import { RootState } from "../../store/store";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { toggleLikePost } from "../../api/like.api";
import {
  Heart,
  MessageCircle,
  Trash2,
  User2,
  Send,
} from "lucide-react";
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

  const [commentText, setCommentText] = useState("");

  const [loadingComments, setLoadingComments] = useState(false);

  const isLikedByMe = user ? likes.includes(user._id) : false;

  const [expanded, setExpanded] = useState<boolean>(false);

  const contentRef = useRef<HTMLDivElement | null>(null);

  const [isOverflowing, setIsOverflowing] =
    useState<boolean>(false);

  const handleToggleLike = async () => {
    if (!user) {
      toast.error("Please login to like the post");
      return;
    }

    setLoading(true);

    try {
      if (isLikedByMe) {
        setLikes((prev) =>
          prev.filter((id) => id !== user._id),
        );

        setLikeCount((prev) => prev - 1);
      } else {
        setLikes((prev) => [...prev, user._id]);

        setLikeCount((prev) => prev + 1);
      }

      await toggleLikePost(post._id);
    } catch (err: any) {
      console.log(err);

      if (isLikedByMe) {
        setLikes((prev) =>
          prev.filter((id) => id !== user._id),
        );

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
      const newComment = await createComment(
        post._id,
        commentText,
      );

      setComments((prev) => [
        newComment.data,
        ...prev,
      ]);

      setCommentsCount((prev) => prev + 1);

      setCommentText("");

      toast.success("Comment added");
    } catch (err: any) {
      toast.error(
        err.message || "Failed to add comment",
      );
    } finally {
      setCreateCommentLoading(false);
    }
  };

  const handleDeleteComment = async (
    commentId: string,
  ) => {
    setDeleteLoading(true);

    try {
      await deleteComment(post._id, commentId);

      setComments((prev) =>
        prev.filter(
          (comment) =>
            comment._id !== commentId,
        ),
      );

      setCommentsCount((prev) => prev - 1);

      toast.success("Comment Deleted Successfully");
    } catch (err: any) {
      toast.error(
        err.message ||
          "Failed to delete comment",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    if (contentRef.current) {
      const element = contentRef.current;

      setIsOverflowing(
        element.scrollHeight >
          element.clientHeight,
      );
    }
  }, [post.content]);

  return (
    <section className="w-full">
      <article className="overflow-hidden bg-[#0a0a0a] text-white sm:rounded-2xl sm:border sm:border-white/10">

        {/* ================= HEADER ================= */}

        <div className="flex items-center justify-between px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">

            {/* Avatar */}

            <Link
              to={`/profile/${post?.owner?.username}`}
              className="shrink-0"
            >
              <div className="h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-purple-700 p-[2px]">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-zinc-900">
                  {post?.owner?.profileImage ? (
                    <img
                      src={post.owner.profileImage}
                      alt={post.owner.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User2
                      size={19}
                      className="text-zinc-300"
                    />
                  )}
                </div>
              </div>
            </Link>

            {/* User Info */}

            <div className="min-w-0">
              <Link
                to={`/profile/${post?.owner?.username}`}
                className="block"
              >
                <p className="truncate text-sm font-semibold text-white hover:text-violet-400">
                  {post?.owner?.username}
                </p>
              </Link>

              <p className="mt-0.5 text-xs text-zinc-500">
                {new Date(
                  post?.createdAt,
                ).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* ================= CONTENT ================= */}

        {post.content && (
          <div className="px-4 pb-3 sm:px-5">
            <div
              ref={contentRef}
              className={`prose prose-invert max-w-none text-sm leading-relaxed text-zinc-200 sm:text-[15px] ${
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
                onClick={() =>
                  setExpanded((prev) => !prev)
                }
                className="mt-2 text-sm font-medium text-zinc-500 transition hover:text-white"
              >
                {expanded
                  ? "Show less"
                  : "more"}
              </button>
            )}
          </div>
        )}

        {/* ================= MEDIA ================= */}

        {(post.image || post.video) && (
          <div className="w-full rounded-2xl  border-y border-white/10 bg-black">

            {post.image && (
              <img
                src={post.image}
                alt="Post"
                className="max-h-[75vh] w-full rounded-2xl object-contain sm:max-h-[650px]"
              />
            )}

            {post.video && (
              <HlsVideoPlayer
                src={post.video}
                className="max-h-[75vh] w-full bg-black object-contain sm:max-h-[650px]"
              />
            )}

          </div>
        )}

        {/* ================= ACTIONS ================= */}

        <div className="px-4 py-3 sm:px-5">

          <div className="flex items-center gap-4">

            {/* Like */}

            <button
              onClick={handleToggleLike}
              disabled={loading}
              className={`group flex items-center gap-2 transition ${
                isLikedByMe
                  ? "text-pink-500"
                  : "text-white hover:text-pink-500"
              }`}
            >
              <Heart
                size={23}
                className={`transition-transform duration-200 group-hover:scale-110 ${
                  isLikedByMe
                    ? "fill-pink-500"
                    : ""
                }`}
              />

              <span className="text-sm font-medium">
                {likeCount}
              </span>
            </button>

            {/* Comment */}

            <button
              onClick={handleToggleComments}
              className={`group flex items-center gap-2 transition ${
                showComments
                  ? "text-violet-400"
                  : "text-zinc-300 hover:text-violet-400"
              }`}
            >
              <MessageCircle
                size={22}
                className="transition-transform group-hover:scale-110"
              />

              <span className="text-sm font-medium">
                {commentsCount}
              </span>
            </button>

          </div>
        </div>

        {/* ================= COMMENTS ================= */}

        {showComments && (
          <div className="border-t border-white/10 bg-white/[0.015] px-4 py-4 sm:px-5">

            {/* Comments */}

            <div className="space-y-4">

              {loadingComments ? (
                <div className="py-4">
                  <Spinner fullScreen={false} />
                </div>
              ) : comments.length === 0 ? (
                <div className="py-4 text-center">
                  <MessageCircle
                    size={22}
                    className="mx-auto mb-2 text-zinc-600"
                  />

                  <p className="text-sm text-zinc-500">
                    No comments yet
                  </p>
                </div>
              ) : (
                comments.map((comment) => {
                  const isPostOwner =
                    user?._id ===
                    post?.owner?._id;

                  const isCommentOwner =
                    user?._id ===
                    comment.commentedBy._id;

                  const canDelete =
                    isPostOwner ||
                    isCommentOwner;

                  return (
                    <div
                      key={comment._id}
                      className="group flex items-start justify-between gap-3"
                    >
                      <div className="flex min-w-0 gap-3">

                        {/* Comment Avatar */}

                        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-zinc-800">
                          {comment.commentedBy
                            ?.profileImage ? (
                            <img
                              src={
                                comment.commentedBy
                                  .profileImage
                              }
                              alt={
                                comment.commentedBy
                                  .username
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <User2
                                size={15}
                                className="text-zinc-500"
                              />
                            </div>
                          )}
                        </div>

                        {/* Comment */}

                        <div className="min-w-0">
                          <div className="inline-block rounded-2xl bg-white/[0.06] px-3.5 py-2.5">
                            <p className="text-xs font-semibold text-white">
                              {
                                comment
                                  .commentedBy
                                  ?.username
                              }
                            </p>

                            <p className="mt-1 break-words text-sm leading-relaxed text-zinc-300">
                              {comment.comment}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Delete */}

                      {canDelete && (
                        <button
                          disabled={deleteLoading}
                          onClick={() =>
                            handleDeleteComment(
                              comment._id,
                            )
                          }
                          className="shrink-0 rounded-lg p-2 text-zinc-600 opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100 disabled:opacity-40"
                          title="Delete comment"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  );
                })
              )}

            </div>

            {/* ================= ADD COMMENT ================= */}

            <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4">

              {/* User Avatar */}

              <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-zinc-800">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <User2
                      size={16}
                      className="text-zinc-500"
                    />
                  </div>
                )}
              </div>

              {/* Input */}

              <input
                value={commentText}
                onChange={(e) =>
                  setCommentText(e.target.value)
                }
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !createCommentLoading
                  ) {
                    handleAddComment();
                  }
                }}
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-zinc-600"
                placeholder="Add a comment..."
              />

              {/* Send */}

              <button
                disabled={
                  createCommentLoading ||
                  !commentText.trim()
                }
                onClick={handleAddComment}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#9929EA] text-white transition hover:scale-105 hover:bg-[#7d0bce] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {createCommentLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Send size={16} />
                )}
              </button>

            </div>
          </div>
        )}
      </article>
    </section>
  );
};

export default FeedPost;