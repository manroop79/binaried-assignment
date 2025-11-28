import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  images?: string[];
  likes: mongoose.Types.ObjectId[];
  replyTo?: mongoose.Types.ObjectId;
  replyCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 280,
    },
    images: [{
      type: String,
    }],
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
    replyCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ replyTo: 1 });

export default mongoose.model<IPost>('Post', PostSchema);

