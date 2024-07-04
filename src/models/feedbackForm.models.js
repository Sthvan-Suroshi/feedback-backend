import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  questionNumber: {
    type: Number,
    required: true,
  },

  question: {
    type: String,
    required: true,
  },

  options: [
    {
      type: String,
    },
  ],
});

const feedbackFormSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    questions: [questionSchema],
  },
  {
    timestamps: true,
  },
);

export const FeedBackForm = mongoose.model("FeedbackForm", feedbackFormSchema);
