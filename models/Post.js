import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    desc: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      public_id: {
        type: String,
        default: "",
      },
      secure_url: {
        type: String,
        default: "",
      },
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Technology",
        "Lifestyle",
        "Travel",
        "Food & Cooking",
        "Health & Fitness",
        "Business",
        "Education",
        "Entertainment",
        "Sports",
        "Fashion",
        "Photography",
        "DIY & Crafts",
      ],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    summary: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // creates createdAt and updatedAt
  }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
