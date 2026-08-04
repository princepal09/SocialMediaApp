import api from "../lib/axios";

export const toggleLikePost = async (postId: string) => {
  const response = await api.post(`/likes/like-unlike/${postId}`);
  return response.data;
};
