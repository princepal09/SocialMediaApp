import { Post } from '../../types/post'

interface FeedSectionProp {
    post : Post
}

const FeedSection = ({post} : FeedSectionProp) => {
  return (
    <div>{post?.owner?.username}</div>
  )
}

export default FeedSection