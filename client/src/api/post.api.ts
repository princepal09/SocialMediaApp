import api from "../lib/axios"



export const createPost = async(formData:FormData) =>{
    const response = await api.post("/post/create-post", formData);
    return response.data;
}

export const deletePost = async(postId:string) =>{
    const response = await api.post(`/post/delete-post/${postId}`);
    return response.data;
}
export const updatePost = async(postId:string ,content:string) =>{
    const response = await api.post(`/post/update-post-content/${postId}`, {content});
    return response.data;
}