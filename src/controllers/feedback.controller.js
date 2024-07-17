import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { isValidObjectId } from "mongoose";
import { Feedback } from "../models/feedback.models.js";
import { Form } from "../models/form.models.js";

export const createFeedback = asyncHandler(async (req, res) => {
  const { responses } = req.body;
  const { formId } = req.params;
  console.log(responses);

  console.log(formId);

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
      .json(new ApiResponse(200, false, "Not submitted yet"));
  }

  return res.status(200).json(new ApiResponse(200, true, "Submitted already"));
});

export const getAllFeedbacksToForm = asyncHandler(async (req, res) => {
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

  const feedbacks = await Feedback.find({ formId });

  if (!feedbacks) {
    throw new ApiError(404, "No feedbacks found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, feedbacks, "Feedbacks found"));
});
