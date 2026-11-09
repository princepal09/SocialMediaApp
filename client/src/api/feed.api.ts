import api from "../lib/axios";
import type { FeedPostType } from "../types/feed";



export const getFeedPosts = async (signal: AbortSignal, before?: string) => {
  const response = await api.get<{ data: FeedPostType[]; nextCursor?: string | null }>("/post/all-posts", {
    signal,
    params: { limit: 15, before },
  });
  return response.data;
};

export const searchUsers = async(query:string, signal: AbortSignal) => {
    const response = await api.get("/users/search", { params: { query }, signal });
    return response.data

}
