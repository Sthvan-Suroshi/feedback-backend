import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ImageFeedback } from "../models/imageFeedback.models.js";
import { isValidObjectId } from "mongoose";

export const createImageFeedback = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "All fields are required");
  }

  const imageFiles = req.files;

  if (!imageFiles || imageFiles.length === 0) {
    throw new ApiError(400, "Images not found");
  }

  // Upload each image to Cloudinary and store URLs in an array
  const imageUrls = await Promise.all(
    imageFiles.map(async (file) => {
      const imageUrl = await uploadOnCloudinary(file.path);
      if (!imageUrl) {
        throw new ApiError(500, "Error uploading to Cloudinary");
      }
      return imageUrl.url;
    })
  );

  // Create a single ImageFeedback document with all image URLs
  const imageResponse = await ImageFeedback.create({
    title,
    description,
    imageUrls, // Store the array of URLs here
    userID: req.user._id
  });

  return res
    .status(200)
    .json(new ApiResponse(200, imageResponse, "Image feedback created successfully"));
});

export const editImageFeedback = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid ID");
  }

  const existingFeedback = await ImageFeedback.findById(id);

  if (!existingFeedback) {
    throw new ApiError(400, "Feedback entry not found");
  }

  // Prepare update details for title and description
  const updateDetails = {};
  if (title) updateDetails.title = title;
  if (description) updateDetails.description = description;

  // Manage images only if new images are provided
  if (req.files && req.files.length > 0) {
    // Upload new images to Cloudinary and collect their URLs
    const newImageUrls = await Promise.all(
      req.files.map(async (file) => {
        const newImageUrl = await uploadOnCloudinary(file.path);
        if (!newImageUrl) {
          throw new ApiError(500, "Error uploading new images to Cloudinary");
        }
        return newImageUrl.url;
      })
    );

    // Optional: Remove old images if being replaced
    if (existingFeedback.imageUrls && existingFeedback.imageUrls.length > 0) {
      await Promise.all(
        existingFeedback.imageUrls.map(async (url) => {
          await deleteFromCloudinary(url, "image");
        })
      );
    }

    // Update imageUrls with new images
    updateDetails.imageUrls = newImageUrls;
  }

  // Update the feedback entry in the database
  const updatedFeedback = await ImageFeedback.findByIdAndUpdate(id, updateDetails, { new: true });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedFeedback, "Feedback updated successfully"));
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

  const deletefromCloud = await deleteFromCloudinary(imageResponse.imageUrl, "image");

  if (!deletefromCloud) {
    throw new ApiError("Something went wrong while deleting from cloudinary");
  }

  await ImageFeedback.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, { deleted: true }, "Successfully deleted the response"));
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
    .json(new ApiResponse(200, imageResponse, "Successfully fetched image response"));
});

export const getAllUserImageResponses = asyncHandler(async (req, res) => {
  const imageResponses = await ImageFeedback.find({
    userID: req.user._id
  }).sort({ createdAt: -1 });

  if (!imageResponses) {
    throw new ApiError(500, "Something went wrong while fetching your image response");
  }
  return res.status(200).json(new ApiResponse(200, imageResponses, "Success"));
});

export const getAllImageResponses = asyncHandler(async (req, res) => {
  const imageResponses = await ImageFeedback.find().sort({ createdAt: -1 });

  if (!imageResponses) {
    throw new ApiError(500, "Something went wrong while fetching all image response");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, imageResponses, "Successfully fetched all image responses"));
});
