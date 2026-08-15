import { redisClient } from "../config/redis.js";

export const invalidatePostCaches = async(username?:string) => {
    try{
        await redisClient.del("home:posts");

        if(username){
             await redisClient.del(`user:posts:${username}`)
        }
        console.log("erererr")
    }catch(err){
        console.log("Invalidation failed error");
    }


}