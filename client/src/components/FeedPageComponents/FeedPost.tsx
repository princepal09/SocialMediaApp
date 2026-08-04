import { useSelector } from "react-redux";
import { Post } from "../../types/post";
import { RootState } from "../../store/store";
import { useState } from "react";
import { toast } from "sonner";
import { toggleLikePost } from "../../api/like.api";

interface FeedPostProps {
  post: Post;
}

const FeedPost = ({ post }: FeedPostProps) => {

  const {user} = useSelector((state:RootState) => state.auth);

  const[likes, setLikes] = useState<string[]>(post.likes);
  const[likeCount, setLikeCount] = useState<number>(post.likesCount);
  const [loading, setLoading] = useState<boolean>(false)
  

  const isLikedByMe = user ? likes.includes(user._id) : false;


  const handleToggleLike = async() =>{
    if(!user){
      toast.error("Please login to like the post")
      return;
    }

    setLoading(true);
    try{
      if(isLikedByMe){
        setLikes((prev) => prev.filter((id) => id!== user._id ))
        setLikeCount((prev) => prev - 1)
      }else{
        setLikes((prev) => [...prev, user._id]);
        setLikeCount((prev) => prev + 1);
      }

      await toggleLikePost(post._id);

    }catch (err: any) {
      console.log(err);
      if(isLikedByMe){
        setLikes((prev) => prev.filter((id) => id!== user._id ))
        setLikeCount((prev) => prev - 1)
      }else{
        setLikes((prev) => [...prev, user._id]);
        setLikeCount((prev) => prev + 1);
      }

      toast.error(err?.message ?? "Something went wrong");
    } finally{
      setLoading(false);
    }
  }

  return (
    <section className="md:px-32 md:py-8 ">
      <div className="post-container flex flex-col gap-2">
        <div className="flex md:gap-2 items-center ">
          <img
            className="w-8 rounded-full object-cover aspect-square "
            src={post?.owner?.profileImage}
          />
          <span className="text-white">{post?.owner?.username}</span>
        </div>

        <span className="text-xs text-white">
          {new Date(post?.createdAt).toLocaleString()}
        </span>

        {post.image && (
          <div className="md:my-2">
            <img src={post?.image} className="aspect-auto" />
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
