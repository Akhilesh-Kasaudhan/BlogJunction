import express from "express";
const app = express();
import dotenv from "dotenv";
import cors from "cors";
import errorHandler from "./middlewares/errorHandler.js";
import cookieParser from "cookie-parser";
import postRoutes from "./routes/postRoute.js";
import authRoutes from "./routes/authRoute.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import commentRoutes from "./routes/commentRoute.js";
import connectDB from "./config/db.js";
import bodyParser from "body-parser";
dotenv.config();

const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://blogjunction-ai.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    // preflightContinue: false,
    // optionsSuccessStatus: 204,
    allowedHeaders: "Content-Type,Authorization",
    methods: "GET,POST,PUT,DELETE",
  })
);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
