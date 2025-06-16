import asyncHandler from "../utils/asyncHandler.js";
import Post from "../models/Post.js";

export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = Post.schema.path("category").enumValues;

  res.status(200).json({
    success: true,
    categories,
  });
});
