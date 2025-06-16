import jwt from "jsonwebtoken";
import User from "../models/User.js";
import CustomError from "../utils/customError.js";
import asyncHandler from "../utils/asyncHandler.js";

const verifyToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    throw new CustomError("Not authorized, token missing", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select("-password"); // attach user info except password
    if (!req.user) {
      throw new CustomError("User not found", 401);
    }

    next();
  } catch (err) {
    throw new CustomError("Invalid or expired token", 401);
  }
});

export default verifyToken;
