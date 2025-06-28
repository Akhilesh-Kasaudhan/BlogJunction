import Post from "../models/Post.js";
import asyncHandler from "../utils/asyncHandler.js";
import CustomError from "../utils/customError.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import fs from "fs";
import { generateBlogContent } from "../utils/geminiAI.js";
import mongoose from "mongoose";

export const createPost = asyncHandler(async (req, res) => {
  const { title, desc, content, category, image } = req.body;

  if (!title || !desc || !content || !category) {
    throw new CustomError("All fields are required", 400);
  }

  let imageUrl = { public_id: "", secure_url: "" };

  if (req.file) {
    const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
    fs.unlinkSync(req.file.path);

    imageUrl = {
      public_id: cloudinaryResponse.public_id,
      secure_url: cloudinaryResponse.secure_url,
    };
  }

  const post = await Post.create({
    title,
    desc,
    content,
    category,
    image: imageUrl,
    author: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Post created successfully",
    post,
  });
});

export const toggleFeaturedStatus = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new CustomError("No post found", 404);
  }
  post.isFeatured = !post.isFeatured;
  await post.save();
  const updatedPost = await Post.findById(post._id).populate(
    "author",
    "username email"
  );
  res.status(200).json({
    success: true,
    message: "Post feature status updated",
    post: updatedPost,
  });
});

export const getFeaturedPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ isFeatured: true })
    .populate("author", "username email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    posts,
  });
});

export const getPostsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { category };

  const totalPosts = await Post.countDocuments(filter);

  if (totalPosts === 0) {
    throw new CustomError("No posts found in this category", 404);
  }

  const posts = await Post.find(filter)
    .populate("author", "username email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    category,
    totalPosts,
    currentPage: page,
    totalPages: Math.ceil(totalPosts / limit),
    posts,
  });
});

export const getPosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const totalPosts = await Post.countDocuments();
  const totalPages = Math.ceil(totalPosts / limit);
  if (page < 1 || page > totalPages) {
    throw new CustomError("Invalid page number", 400);
  }
  const posts = await Post.find()
    .populate("author", "username email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  if (posts.length === 0) {
    throw new CustomError("No posts found", 200);
  }

  res.status(200).json({
    success: true,
    totalPosts,
    currentPage: page,
    totalPages,
    posts,
    message: "Posts fetched successfully",
  });
});

export const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("author", "username email")
    .populate("likes", "username email");

  if (!post) {
    throw new CustomError("Post not found", 404);
  }

  res.status(200).json({
    success: true,
    post,
  });
});

export const updatePost = asyncHandler(async (req, res) => {
  const { title, desc, content, category } = req.body;
  const image = req.file?.path || "";

  if (!title || !desc || !content || !category) {
    throw new CustomError("All fields are required", 400);
  }

  const post = await Post.findByIdAndUpdate(
    req.params.id,
    {
      title,
      desc,
      content,
      category,
      image,
    },
    { new: true }
  );

  if (!post) {
    throw new CustomError("Post not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Post updated successfully",
    post,
  });
});

export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);

  if (!post) {
    throw new CustomError("Post not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Post deleted successfully",
  });
});

export const toggleLike = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const userId = req.user._id;

  const post = await Post.findById(postId);

  if (!post) {
    throw new CustomError("Post not found", 404);
  }

  const alreadyLiked = post.likes.includes(userId);

  if (alreadyLiked) {
    post.likes.pull(userId); // unlike
  } else {
    post.likes.push(userId); // like
  }

  const updatedPost = await post.save();

  res.status(200).json({
    success: true,
    message: alreadyLiked ? "Post unliked" : "Post liked",
    totalLikes: post.likes.length,
    post: updatedPost,
  });
});

export const getMostLikedPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .sort({ likes: -1 })
    .limit(10)
    .populate("author", "username email");

  res.status(200).json({
    success: true,
    message: "Most liked posts fetched successfully",
    posts,
  });
});

export const getPostsByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new CustomError("Invalid user ID", 400);
  }
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { author: userId };

  const totalPosts = await Post.countDocuments(filter);

  if (totalPosts === 0) {
    throw new CustomError("No posts found for this user", 404);
  }

  const posts = await Post.find(filter)
    .populate("author", "username email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    userId,
    totalPosts,
    currentPage: page,
    totalPages: Math.ceil(totalPosts / limit),
    posts,
  });
});

export const summarizeBlogContent = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);
  if (!post) throw new CustomError("Post not found", 404);

  if (post.summary) {
    return res.status(200).json({ success: true, summary: post.summary });
  }

  const prompt = `Summarize the following blog content in 4-5 lines:\n\n${post.content}`;

  const summary = await generateBlogContent(prompt);

  post.summary = summary;
  await post.save();

  res.status(200).json({ success: true, summary });
});

export const generateContent = asyncHandler(async (req, res) => {
  const { title, desc } = req.body;
  if (!title || !desc) {
    throw new CustomError("Title and description are required", 400);
  }
  const prompt = `Write a detailed blog post of minimum 200 words on the topic: "${title}". Make it engaging, informative and relevant to the description "${desc}" `;

  const result = await generateBlogContent(prompt);

  const content =
    typeof result === "string"
      ? result
      : result?.text || result?.response?.text?.();

  if (!content) {
    throw new CustomError("AI response is empty or malformed", 500);
  }
  res.status(200).json({
    success: true,
    content,
  });
});
