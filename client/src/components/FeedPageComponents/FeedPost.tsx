import { Post } from "../../types/post";

interface FeedPostProps {
  post: Post;
}

const FeedPost = ({ post }: FeedPostProps) => {
  return (
    <section className="md:px-32 md:py-8 ">
      <div className="post-container flex flex-col">
        <div className="flex md:gap-2 items-center md:my-2">
          <img
            className="w-8 rounded-full object-cover aspect-square "
            src={post?.owner?.profileImage}
          />
          <span className="text-white">{post?.owner?.username}</span>
        </div>

        <span className="text-xs text-white">
          {new Date(post.createdAt).toLocaleString()}
        </span>

        {post.image && (
          <div className="md:my-2">
            <img src={post.image} className="aspect-auto" />
          </div>
        )}

        <div className="post-content">
          <p className="text-white">{post?.content}</p>
        </div>
      </div>
    </section>
  );
};

export default FeedPost;
