import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'
import { env } from '../constants.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY.CLOUD_NAME,
  api_key: env.CLOUDINARY.API_KEY,
  api_secret: env.CLOUDINARY.API_SECRET,
});

export const uploadToCloudinary = async(localFilePath:string)=>{
    try{
        console.log(localFilePath);
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type : "auto"
        })
        fs.unlinkSync(localFilePath)

    }catch(err){
       console.log("Cloudinary error", err);
       fs.unlinkSync(localFilePath)
    }
}