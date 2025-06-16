import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import CustomError from "./customError.js";
import fs from "fs";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const uploadOnCloudinary = async (file) => {
  try {
    if (!file) {
      throw new CustomError("No file provided for upload", 400);
    }

    const result = await cloudinary.uploader.upload(file, {
      resource_type: "image",
      folder: "blog-posts",
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    });
    return result;
  } catch (error) {
    fs.unlinkSync(file);
    if (error instanceof CustomError) {
      throw error;
    }
    console.error("Cloudinary upload error:", error);
    throw new CustomError("Image upload failed", 500);
  }
};

export default uploadOnCloudinary;
