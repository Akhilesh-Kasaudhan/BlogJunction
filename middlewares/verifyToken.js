
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import CustomError from "../utils/customError.js";
import asyncHandler from "../utils/asyncHandler.js";

const verifyToken = asyncHandler(async (req, res, next) => {
  // First check cookie, then Authorization header
  const authHeader = req.headers.authorization;

  const bearerToken =
    authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  const token = req.cookies?.token || bearerToken;

  if (!token) {
    throw new CustomError("Not authorized, token missing", 401);
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new CustomError("Invalid or expired token", 401);
  }

  const user = await User.findById(decoded.userId).select("-password");

  if (!user) {
    throw new CustomError("User not found", 401);
  }

  req.user = user;

  next();
});

export default verifyToken;
