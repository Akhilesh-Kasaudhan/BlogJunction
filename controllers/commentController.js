import asyncHandler from "../utils/asyncHandler.js";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import CustomError from "../utils/customError.js";

export const writeComment = asyncHandler(async (req, res) => {
  const { content, postId } = req.body;
  const userId = req.user._id;

  const postExists = await Post.findById(postId);
  if (!postExists) {
    throw new CustomError("Post not found", 404);
  }

  const comment = await Comment.create({
    content,
    post: postId,
    user: userId,
  });

  res.status(201).json({
    success: true,
    message: "Comment added successfully",
    comment,
  });
});

export const getCommentsForPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const comments = await Comment.find({ post: postId })
    .populate("user", "username email") // Optional: return user info
    .sort({ createdAt: -1 }); // Latest comments first

  res.status(200).json({
    success: true,
    count: comments.length,
    comments,
  });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const commentId = req.params.id;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new CustomError("Comment not found", 404);
  }

  await Comment.findByIdAndDelete(commentId);

  res.status(200).json({
    success: true,
    message: "Comment deleted successfully",
  });
});
