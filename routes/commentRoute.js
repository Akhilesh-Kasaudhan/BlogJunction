import express from "express";
import {
  writeComment,
  deleteComment,
  getCommentsForPost,
} from "../controllers/commentController.js";

import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, writeComment);
router.get("/:postId", getCommentsForPost);
router.delete("/:id", verifyToken, deleteComment);

export default router;
