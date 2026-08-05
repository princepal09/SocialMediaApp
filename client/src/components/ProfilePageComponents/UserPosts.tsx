import { CalendarDays, Heart, MessageCircle } from "lucide-react";
import { PostsResponse } from "../../types/userProfile";

interface UserPostsProps {
  userPosts: PostsResponse | null;
}

const UserPosts = ({ userPosts }: UserPostsProps) => {
  if (!userPosts?.length) {
    return (
      <div className="py-10 text-center text-zinc-400">
        No posts yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-4">
      {userPosts.map((post) => (
        <div
          key={post._id}
          className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-lg transition-all duration-300 hover:border-zinc-700 hover:shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-4">
            <img
              src={post.owner.profileImage}
              alt={post.owner.username}
              className="h-11 w-11 rounded-full object-cover ring-2 ring-zinc-700"
            />

            <div>
              <p className="font-semibold text-white">
                @{post.owner.username}
              </p>

              <div className="mt-1 flex items-center gap-1 text-xs text-zinc-400">
                <CalendarDays size={13} />
                {new Date(post.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Caption */}
          <div className="px-4 pb-4">
            <p className="text-zinc-200">{post.content}</p>
          </div>

          {/* Image */}
          {post.image && (
            <img
              src={post.image}
              alt="Post"
              className="w-full max-h-[500px] object-cover"
            />
          )}

          {/* Footer */}
          <div className="flex items-center gap-8 border-t border-zinc-800 p-4 text-zinc-400">
            <button className="flex items-center gap-2 transition hover:text-red-500">
              <Heart size={20} />
              <span>{post.likesCount}</span>
            </button>

            <button className="flex items-center gap-2 transition hover:text-sky-400">
              <MessageCircle size={20} />
              <span>{post.commentCount}</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserPosts;