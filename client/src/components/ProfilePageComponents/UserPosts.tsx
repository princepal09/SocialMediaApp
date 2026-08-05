import { PostsResponse } from "../../types/userProfile";

interface UserPostsProps {
  userPosts: PostsResponse | null;
}
const UserPosts = ({ userPosts }: UserPostsProps) => {
  if (!userPosts?.length) {
    return <div className="text-zinc-400 text-center">No post Yet</div>;
  }

  return <div>
    
  </div>;
};

export default UserPosts;
