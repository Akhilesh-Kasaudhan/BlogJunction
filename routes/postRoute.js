import express from "express";
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  getMostLikedPosts,
  getFeaturedPosts,
  getPostsByCategory,
  getPostsByUser,
  summarizeBlogContent,
  generateContent,
} from "../controllers/postController.js";
import verifyToken from "../middlewares/verifyToken.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.post("/", verifyToken, upload.single("image"), createPost);
router.get("/", getPosts);
router.get("/most-liked", getMostLikedPosts);
router.post("/generate-content", generateContent);
router.get("/:id", getPostById);
router.put("/:id", verifyToken, upload.single("image"), updatePost);
router.delete("/:id", verifyToken, deletePost);
router.put("/like/:postId", verifyToken, toggleLike);

router.get("/featured", getFeaturedPosts);
router.get("/category/:category", getPostsByCategory);
router.get("/user/:userId", verifyToken, getPostsByUser);
router.get("/summarize/:postId", summarizeBlogContent);

export default router;
