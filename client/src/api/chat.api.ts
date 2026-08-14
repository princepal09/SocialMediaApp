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
export const markSeen = async (conversationId : string) => {
  const response = await api.patch(`/chat/seen/${conversationId}`);
  return response.data;
};

export const getOrCreateConversations = async (receiverId: string) => {
  const response = await api.post(`/chat/conversation/${receiverId}`);
  return response.data;
};

export const getMessages = async (conversationId: string) => {
  const response = await api.get(`/chat/messages/${conversationId}`);
  return response.data;
};

export const sendMessage = async(data : FormData) => {
  const response = await api.post(`/chat/message`, data);
  return response.data;
}

export const markConversationAsSeen = async (conversationId : string) =>{
  const response = await api.patch(`/chat/conversations/${conversationId}/seen`)
  return response.data;

}