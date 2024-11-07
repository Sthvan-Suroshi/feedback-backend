import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const imageFeedbackSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    imageUrls: {
      // Changed from imageUrl to imageUrls
      type: [String], // Array of strings to hold multiple image URLs
      required: true
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

imageFeedbackSchema.plugin(mongooseAggregatePaginate);

export const ImageFeedback = mongoose.model("ImageFeedback", imageFeedbackSchema);
