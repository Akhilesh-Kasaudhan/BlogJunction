import asyncHandler from "../utils/asyncHandler.js";
import CustomError from "../utils/customError.js";
import User from "../models/User.js";
import sendToken from "../utils/sendToken.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new CustomError("User with this email already exists", 400);
  }
  if (!username || !email || !password) {
    throw new CustomError("All fields are required", 400);
  }

  const newUser = new User({
    username,
    email,
    password,
    role,
  });

  await newUser.save();

  sendToken(newUser, 201, res, "User registered successfully");
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.length === 0) {
    throw new CustomError("Invalid email or password", 401);
  }
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new CustomError("Invalid email or password", 401);
  }
  sendToken(user, 200, res, "Logged in successfully");
});

export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: "none",
  });
  res
    .status(200)
    .json({ success: true, message: "User logged out successfully" });
});
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    throw new CustomError("User not found", 404);
  }
  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
});
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new CustomError("User not found", 404);
  }

  if (username) user.username = username;
  if (email) user.email = email;
  if (password) user.password = password;
  if (role) user.role = role;

  await user.save();

  sendToken(user, 200, res, "User profile updated successfully");
});
export const deleteUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.user.id);
  if (!user) {
    throw new CustomError("User not found", 404);
  }
  res.status(200).json({
    success: true,
    message: "User profile deleted successfully",
  });
});
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.status(200).json({
    success: true,
    users,
  });
});
