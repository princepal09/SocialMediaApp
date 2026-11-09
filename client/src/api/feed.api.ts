import api from "../lib/axios"



export const getFeedPosts = async() =>{
    const response = await api.get("post/all-posts");
    return response?.data
}

export const searchUsers = async(query:string, signal: AbortSignal) => {
    const response = await api.get("/users/search", { params: { query }, signal });
    return response.data

}
