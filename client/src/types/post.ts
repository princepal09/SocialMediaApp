export interface User {
  _id: string;
  username: string;
  email: string;
  posts: string[];
  bio: string;
  profileImage: string;
  followers: string[];
  following: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FullPost {
  _id: string;
  content: string;
  image?: string;
  owner: User;
  comments: any[];
  likes: string[];
  createdAt: string;
  updatedAt: string;
  commentsCount: number;
  likesCount: number;
}

export interface FeedPostsResponse {
  data: FullPost[];
}
