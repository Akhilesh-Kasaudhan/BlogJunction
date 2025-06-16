import jwt from "jsonwebtoken";

const sendToken = (user, statusCode, res, message = "Success") => {
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  // Set token as cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    sameSite: "strict",
  });

  // Send response
  res.status(statusCode).json({
    success: true,
    message,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    token,
  });
};

export default sendToken;
