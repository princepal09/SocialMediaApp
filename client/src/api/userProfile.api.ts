import api from "../lib/axios"


export const getUserProfileInfo = async(username : string) =>{
    const response = await api.get(`/users/get-user-profile-data/${username}`);
    return response.data;
}


export const geUserPosts = async(username:string) =>{
      const response = await api.get(`/post/get-user-posts/${username}`)
      return response.data;
}