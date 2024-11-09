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

  const imageResponse = await ImageFeedback.create({
    title,
    description,
    imageUrls,
    userID: req.user._id
  });

  return res
    .status(200)
    .json(new ApiResponse(200, imageResponse, "Image feedback created successfully"));
});

export const editImageFeedback = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const { id } = req.params;

  console.log(title, description);

  if (!title || !description) {
    throw new ApiError(400, "All fields are required");
  }

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid ID");
  }

  const updatedFeedback = await ImageFeedback.findByIdAndUpdate(
    id,
    { title, description },
    { new: true, runValidators: true }
  );

  if (!updatedFeedback) {
    throw new ApiError(400, "Feedback entry not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedFeedback, "Image feedback updated successfully"));
});

export const deleteSingleImageFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params; // Document ID
  const { imageUrlToDelete } = req.body; // Single image URL to delete

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid ID");
  }

  const imageResponse = await ImageFeedback.findById(id);

  if (!imageResponse) {
    throw new ApiError(404, "Feedback entry not found");
  }

  // Check if the image URL exists in the document
  if (!imageResponse.imageUrls.includes(imageUrlToDelete)) {
    throw new ApiError(400, "Image URL not found in this feedback entry");
  }

  await ImageFeedback.findByIdAndUpdate(
    id,
    { $pull: { imageUrls: imageUrlToDelete } },
    { new: true }
  );

  // Delete the image from Cloudinary after the image URL is removed from the document
  const deleteResult = await deleteFromCloudinary(imageUrlToDelete, "image");

  if (!deleteResult) {
    throw new ApiError(500, "Error deleting the image from Cloudinary");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Successfully deleted the specified image"));
});

export const deleteImageFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params; // Document ID

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid ID");
  }

  const imageResponse = await ImageFeedback.findByIdAndDelete(id);

  console.log(imageResponse);

  if (!imageResponse) {
    throw new ApiError(404, "Feedback entry not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Successfully deleted the image feedback entry"));
});

export const getImageResponse = asyncHandler(async (req, res) => {
  const { id } = req.params; //Send the Document ID here from the frontend

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
  const { page = 1, limit = 10 } = req.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10)
  };

  const aggregation = [{ $match: { userID: req.user?._id } }, { $sort: { createdAt: -1 } }];

  const paginatedResponses = await ImageFeedback.aggregatePaginate(aggregation, options);

  if (!paginatedResponses || paginatedResponses.docs.length === 0) {
    throw new ApiError(404, "No image responses found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        imageResponses: paginatedResponses.docs,
        totalResponses: paginatedResponses.totalDocs, // Total documents count for pagination
        page: paginatedResponses.page,
        limit: paginatedResponses.limit
      },
      "Successfully fetched all image responses for the user"
    )
  );
});

export const getAllImageResponses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10)
  };

  const aggregation = [{ $sort: { createdAt: -1 } }];

  const paginatedResponses = await ImageFeedback.aggregatePaginate(aggregation, options);

  if (!paginatedResponses || paginatedResponses.docs.length === 0) {
    throw new ApiError(404, "No image responses found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        imageResponses: paginatedResponses.docs, // Paginated results
        totalResponses: paginatedResponses.totalDocs, // Total documents count for pagination
        page: paginatedResponses.page,
        limit: paginatedResponses.limit
      },
      "Successfully fetched all image responses"
    )
  );
});
