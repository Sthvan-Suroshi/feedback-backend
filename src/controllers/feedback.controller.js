import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Feedback } from "../models/feedback.models.js";
import { Form } from "../models/form.models.js";
import { Question } from "../models/question.models.js";
export const createFeedback = asyncHandler(async (req, res) => {
  const { responses } = req.body;
  const { formId } = req.params;

  if (!formId || !responses || !Array.isArray(responses)) {
    throw new ApiError(400, "Form ID and responses are required");
  }

  if (!isValidObjectId(formId)) {
    throw new ApiError(400, "Invalid form ID");
  }

  const form = await Form.findById(formId);

  if (!form) {
    throw new ApiError(404, "Form not found");
  }

  const createResponse = await Feedback.create({
    formId,
    responses,
    userID: req.user?._id,
  });

  if (!createResponse) {
    throw new ApiError(500, "Something went wrong while creating feedback");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, createResponse, "Successfully created feedback"),
    );
});

export const checkFeedbackSubmission = asyncHandler(async (req, res) => {
  const { formId } = req.params;

  if (!formId) {
    throw new ApiError(400, "Form ID is required");
  }

  if (!isValidObjectId(formId)) {
    throw new ApiError(400, "Invalid form ID");
  }

  const form = await Form.findById(formId);

  if (!form) {
    throw new ApiError(404, "Form not found");
  }

  const Submitted = await Feedback.findOne({
    formId,
    userID: req.user?._id,
  });

  if (!Submitted) {
    return res
      .status(200)
      .json(new ApiResponse(200, { submitted: false }, "Not submitted yet"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { submitted: true }, "Submitted already"));
});

export const getAllFeedbacksToForm = asyncHandler(async (req, res) => {
  const { formId } = req.params;

  if (!formId || !mongoose.Types.ObjectId.isValid(formId)) {
    throw new ApiError(400, "Invalid form ID");
  }

  const form = await Form.findById(formId);
  if (!form) {
    throw new ApiError(404, "Form not found");
  }

  const formTitle = form.title;
  const formDescription = form.description;
  const optionCounts = {};

  const feedbacks = await Feedback.find({ formId })
    .populate({
      path: "responses.questionID",
      select: "question options",
    })
    .select("-userID -updatedAt -__v");

  if (feedbacks.length === 0) {
    throw new ApiError(404, "No feedbacks found");
  }

  feedbacks.forEach((feedback) => {
    feedback.responses.forEach((response) => {
      const question = response.questionID;
      const responseText = response.responseText;

      const questionOptions = question.options || [];

      if (!optionCounts[question.question]) {
        optionCounts[question.question] = {};
        questionOptions.forEach((option) => {
          optionCounts[question.question][option] = 0;
        });
      }

      if (questionOptions.includes(responseText)) {
        optionCounts[question.question][responseText]++;
      } else {
        if (!optionCounts[question.question]["Feedback Text"]) {
          optionCounts[question.question]["Feedback Text"] = [];
        }
        optionCounts[question.question]["Feedback Text"].push(responseText);
      }
    });
  });

  const responseObj = {
    formId: formId,
    formTitle: formTitle,
    formDescription: formDescription,
    optionCounts: optionCounts,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        responseObj,
        "Form details, option counts, and feedback text found",
      ),
    );
});
