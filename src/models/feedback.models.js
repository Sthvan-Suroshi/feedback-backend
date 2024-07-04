import mongoose from "mongoose";

const responseSchema = new mongoose.Schema({
  questionID: {
    type: mongoose.Schema.Types.ObjectId,
  },
  responseText: {
    type: String,
    required: true,
  },
});

const feedbackSchema = new mongoose.Schema(
  {
    formID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeedbackForm",
      required: true,
    },

    responses: [responseSchema],
  },
  {
    timestamps: true,
  },
);

export const Feedback = mongoose.model("Feedback", feedbackSchema);