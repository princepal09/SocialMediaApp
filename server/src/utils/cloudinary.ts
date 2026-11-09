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
      format: "mp4",
      transformation: [{ crop: "limit", width: 1280, height: 1280, quality: "auto", video_codec: "h264" }],
      timeout: 90_000,
    });
  } catch {
    throw new ApiError(502, "Video upload failed. Check the file or try again.");
  }
};

export const removeFromCloudinary = async (url: string, resourceType: "image" | "video" = "image") => {
  try {
    const fileName = new URL(url).pathname.split("/").pop();
    const publicId = fileName?.slice(0, fileName.lastIndexOf("."));
    if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch {
    console.error("Could not remove media from Cloudinary.");
  }
};
