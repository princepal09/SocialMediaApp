import { PostsResponse } from "../../types/userProfile";
import UserPost from "./UserPost";

interface UserPostsProps {
  userPosts: PostsResponse | null;
  onDeletePost : (postId:string) => void;
}

const UserPosts = ({ userPosts, onDeletePost }: UserPostsProps) => {
  if (!userPosts?.length) {
    return (
      <div className="py-10 text-center text-zinc-400">
        No posts yet.
      </div>
    );
  }

  return (
    <div className="mt-6 flex w-full flex-col items-center gap-4 sm:gap-6">
      {userPosts.map((post) => (
        <div
          key={post._id}
          className="w-full max-w-2xl"
        >
          <UserPost
            onDeletePost={onDeletePost}
            post={post}
          />
        </div>
      ))}
    </div>
  );
};
export default UserPosts;