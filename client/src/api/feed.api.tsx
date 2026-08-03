import api from "../lib/axios"



export const getFeedPosts = async() =>{
    const response = await api.get("post/all-posts");
    return response?.data
}