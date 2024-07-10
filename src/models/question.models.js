import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      required: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },

    options: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Question = mongoose.model("Question", questionSchema);
