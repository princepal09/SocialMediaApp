import { v2 as cloudinary } from "cloudinary";
import { env } from "../constants.js";
import { ApiError } from "./ApiError.js";

cloudinary.config({
  cloud_name: env.CLOUDINARY.CLOUD_NAME,
  api_key: env.CLOUDINARY.API_KEY,
  api_secret: env.CLOUDINARY.API_SECRET,
});

export const uploadToCloudinary = async (localFilePath: string) => {
  try {
    return await cloudinary.uploader.upload(localFilePath, { resource_type: "image" });
  } catch {
    throw new ApiError(502, "Image upload failed. Check the file or try again.");
  }
};

export const uploadVideoToCloudinary = async (localFilePath: string) => {
  try {
    return await cloudinary.uploader.upload(localFilePath, {
      resource_type: "video",
      eager: [{ streaming_profile: "full_hd", format: "m3u8" }],
      eager_async: false,
    });
  } catch {
    throw new ApiError(502, "Video upload failed. Check the file or try again.");
  }
};

export const removeFromCloudinary = async (imageUrl: string) => {
  try {
    const fileName = new URL(imageUrl).pathname.split("/").pop();
    const publicId = fileName?.slice(0, fileName.lastIndexOf("."));
    if (publicId) await cloudinary.uploader.destroy(publicId);
  } catch {
    console.error("Could not remove the image from Cloudinary.");
  }
};
