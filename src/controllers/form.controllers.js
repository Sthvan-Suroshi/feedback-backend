import { Form } from "../models/form.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { isValidObjectId } from "mongoose";

export const createForm = asyncHandler(async (req, res) => {
  const { title, description, questions } = req.body;

  console.log(title, description);
  console.log(questions);

  if (!title || !description || !questions) {
    throw new ApiError(400, "All fields are required");
  }

  const form = await Form.create({
    createdBy: req.user._id,
    title,
    description,
    questions,
  });

  if (!form) {
    throw new ApiError(500, "Something went wrong");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, form, "Successfully created a form"));
});

export const editForm = asyncHandler(async (req, res) => {
  const { title, description, questions } = req.body;
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid id");
  }

  const form = await Form.findById(id);

  if (!form) {
    throw new ApiError(500, "No form found");
  }

  if (!title && !description && !questions) {
    throw new ApiError(400, "All fields are required");
  }

  const updatedForm = await Form.findByIdAndUpdate(
    id,
    {
      title,
      description,
      questions,
    },
    {
      new: true,
    },
  );

  if (!updatedForm) {
    throw new ApiError(500, "Something went wrong");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedForm, "Successfully updated the form"));
});

export const deleteForm = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid id");
  }

  const form = await Form.findById(id);
  const owner = req.user;

  if (!form) {
    throw new ApiError(500, "No form found");
  }

  if (form.createdBy.toString() !== owner._id.toString()) {
    throw new ApiError(400, "You are not authorized to delete this form");
  }

  await Form.findByIdAndDelete(id);

  return res
    .status(200)
    .json(
      new ApiResponse(200, { deleted: true }, "Successfully deleted the form"),
    );
});
