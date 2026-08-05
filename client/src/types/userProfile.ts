export interface IUserProfileInfo {
  _id: string;
  username: string;
  email: string;
  profileImage?: string | null;
  postCount: number;
  followersCount: number;
  followingCount: number;
  bio?: string;
}

export interface PostOwner {
  _id: string;
  username: string;
  profileImage: string;
}

export interface Comment {
}

export interface Post {
  _id: string;
  content: string;
  image: string;
  owner: PostOwner;
  createdAt: string; 
  commentCount: number;
  comments: Comment[];
}

export type PostsResponse = Post[];