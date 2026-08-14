export interface IUserProfileInfo {
  _id: string;
  username: string;
  email: string;
  profileImage?: string | null;
  postCount: number;
  followersCount: number;
  followingCount: number;
  bio?: string;
  isFollowing : boolean
}

export interface PostOwner {
  _id: string;
  username: string;
  profileImage: string;
}

export interface Comment {
}

export interface UserProfilePost {
  _id: string;
  content: string;
  image: string;
  owner: PostOwner;
  createdAt: string; 
  commentCount: number;
  likesCount : number
  comments: Comment[];
  likes : string[]
}

export type PostsResponse = UserProfilePost[];