import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ImageFeedback } from "../models/imageFeedback.models.js";
import { isValidObjectId } from "mongoose";

export const createImageFeedback = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  console.log(title);
  console.log(description);

  if (!title || !description) {
    throw new ApiError(400, "All fields are required");
  }

  const imageLocalPath = req.file?.path;

  console.log(imageLocalPath);

  if (!imageLocalPath) {
    throw new ApiError(400, "Image not found");
  }

  const imageUrl = await uploadOnCloudinary(imageLocalPath);
  console.log(imageUrl);

  if (!imageUrl) {
    throw new ApiError(
      500,
      "Something went wrong while uploading on cloudinary",
    );
  }

  const imageResponse = await ImageFeedback.create({
    title,
    description,
    imageUrl: imageUrl.url,
    userID: req.user._id,
  });

  const createdResponse = await ImageFeedback.findById(imageResponse._id);

  if (!imageResponse) {
    throw new ApiError(500, "Something went wrong");
  }

  return res.status(200).json(new ApiResponse(200, createdResponse, "Success"));
});

export const editImageFeedback = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const { id } = req.params;

  console.log(title, description);

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid id");
  }

  const exitingId = await ImageFeedback.findById(id);

  if (!exitingId) {
    throw new ApiError(400, "Invalid id");
  }

  if (!title && !description) {
    throw new ApiError(400, "All fields are required");
  }

  const imageLocalPath = req.file?.path;

  if (imageLocalPath) {
    var imageUrl = await uploadOnCloudinary(imageLocalPath);
    if (!imageUrl) {
      throw new ApiError(
        500,
        "Something went wrong while uploading on cloudinary",
      );
    }

    var deletefromCloud = await deleteFromCloudinary(
      exitingId.imageUrl,
      "image",
    );
    if (!deletefromCloud) {
      throw new ApiError(
        500,
        "Something went wrong while deleting from cloudinary",
      );
    }
  }

  const updateDetails = {
    title,
    description,
  };

  if (imageLocalPath) {
    updateDetails.imageUrl = imageUrl.url;
  }

  const imageResponse = await ImageFeedback.findByIdAndUpdate(
    id,
    updateDetails,
    {
      new: true,
    },
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, imageResponse, "Successfully updated the response"),
    );
});

export const deleteImageFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid id");
  }

  const imageResponse = await ImageFeedback.findById(id);

  if (!imageResponse) {
    throw new ApiError(500, "Something went wrong while fetching the response");
  }

  const deletefromCloud = await deleteFromCloudinary(
    imageResponse.imageUrl,
    "image",
  );

  if (!deletefromCloud) {
    throw new ApiError("Something went wrong while deleting from cloudinary");
  }

  await ImageFeedback.findByIdAndDelete(id);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { deleted: true },
        "Successfully deleted the response",
      ),
    );
});

export const getImageResponse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid id");
  }

  const imageResponse = await ImageFeedback.findById(id);

  if (!imageResponse) {
    throw new ApiError(500, "Something went wrong while fetching the response");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        imageResponse,
        "Successfully fetched image response",
      ),
    );
});

export const getAllUserImageResponses = asyncHandler(async (req, res) => {
  const imageResponses = await ImageFeedback.find({
    userID: req.user._id,
  }).sort({ createdAt: -1 });

  if (!imageResponses) {
    throw new ApiError(
      500,
      "Something went wrong while fetching your image response",
    );
  }
  return res.status(200).json(new ApiResponse(200, imageResponses, "Success"));
});

export const getAllImageResponses = asyncHandler(async (req, res) => {
  const imageResponses = await ImageFeedback.find().sort({ createdAt: -1 });

  if (!imageResponses) {
    throw new ApiError(
      500,
      "Something went wrong while fetching all image response",
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        imageResponses,
        "Successfully fetched all image responses",
      ),
    );
});
