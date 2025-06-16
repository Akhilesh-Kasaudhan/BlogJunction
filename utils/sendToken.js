import jwt from "jsonwebtoken";

const sendToken = (user, statusCode, res, message = "Success") => {
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: "none",
  });

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
