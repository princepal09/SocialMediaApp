import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { env } from "../constants.js";

cloudinary.config({
  cloud_name: env.CLOUDINARY.CLOUD_NAME,
  api_key: env.CLOUDINARY.API_KEY,
  api_secret: env.CLOUDINARY.API_SECRET,
});

export const uploadToCloudinary = async (localFilePath: string) => {
  try {
    console.log(localFilePath);
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // console.log("File is uploaded on cloudinary", response.secure_url)
    fs.unlinkSync(localFilePath);
    return response;
  } catch (err) {
    console.log("Cloudinary error", err);
    fs.unlinkSync(localFilePath);
  }
};

export const removeFromCloudinary = async (imageUrl: string) => {
  try {
    const urlArray = imageUrl.split("/");
    const imageNameWithExtension = urlArray[urlArray.length - 1];

    const imageNameArray = imageNameWithExtension?.split(".");
    const imageName: string | undefined = imageNameArray?.[0];

    if (imageName) {
      await cloudinary.uploader.destroy(imageName);
    }
  } catch (err) {
    console.log("Cloudinary error", err);
  }
};
