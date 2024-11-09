import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { isValidObjectId } from "mongoose";
import { Feedback } from "../models/feedback.models.js";
import { Form } from "../models/form.models.js";

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
    userID: req.user?._id
  });

  if (!createResponse) {
    throw new ApiError(500, "Something went wrong while creating feedback");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createResponse, "Successfully created feedback"));
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
    userID: req.user?._id
  });

  if (!Submitted) {
    return res.status(200).json(new ApiResponse(200, { submitted: false }, "Not submitted yet"));
  }

  return res.status(200).json(new ApiResponse(200, { submitted: true }, "Submitted already"));
});

export const getAllFeedbacksToForm = asyncHandler(async (req, res) => {
  const { formId } = req.params;

  // Validate formId in a single check
  if (!isValidObjectId(formId)) {
    throw new ApiError(400, "Invalid form ID");
  }

  // Use Promise.all to run queries in parallel
  const [form, feedbacks] = await Promise.all([
    Form.findById(formId).select("title description").lean(),
    Feedback.find({ formId })
      .populate({
        path: "responses.questionID",
        select: "question options"
      })
      .select("-userID -updatedAt -__v")
      .lean()
  ]);

  if (!form) {
    throw new ApiError(404, "Form not found");
  }

  if (!feedbacks.length) {
    throw new ApiError(404, "No feedbacks found");
  }

  // Pre-process the feedbacks to build optionCounts more efficiently
  const optionCounts = feedbacks.reduce((counts, feedback) => {
    feedback.responses.forEach(({ questionID, responseText }) => {
      const questionText = questionID.question;

      // Initialize question counts if not exists
      if (!counts[questionText]) {
        counts[questionText] = {
          ...Object.fromEntries((questionID.options || []).map((option) => [option, 0])),
          "Feedback Text": []
        };
      }

      // Update counts based on response type
      if (questionID.options?.includes(responseText)) {
        counts[questionText][responseText]++;
      } else {
        counts[questionText]["Feedback Text"].push(responseText);
      }
    });
    return counts;
  }, {});

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        formId,
        formTitle: form.title,
        formDescription: form.description,
        optionCounts
      },
      "Form details, option counts, and feedback text found"
    )
  );
});
