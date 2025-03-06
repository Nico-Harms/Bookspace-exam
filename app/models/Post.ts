import { Schema, model, Types, type InferSchemaType } from "mongoose";
import type { UserType } from "./User";

const postSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export type PostType = InferSchemaType<typeof postSchema> & {
  _id: Types.ObjectId;
  author: UserType | Types.ObjectId; // Can be populated or just ID
};

const Post = model<PostType>("Post", postSchema);
export default Post;
