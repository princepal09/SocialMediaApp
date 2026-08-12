import api from "../lib/axios";

export const getMyFollowers = async () => {
  const response = await api.get(`/users/get-followers`);
  return response.data;
};

export const getUserConversations = async () => {
  const response = await api.get("/chat/user-conversations");
  // console.log(response.data);

  return response.data;
};

export const getOrCreateConversations = async (recieverId: string) => {
  const response = await api.post(`/chat/conversation/${recieverId}`);
  return response.data;
};
