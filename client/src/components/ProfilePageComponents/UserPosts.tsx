import { PostsResponse } from "../../types/userProfile";
import UserPost from "./UserPost";

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
    <div className="flex flex-col gap-6">
      {userPosts.map((post) => (
        <UserPost key={post._id} post={post} />
      ))}
    </div>
  );
};

export default UserPosts;