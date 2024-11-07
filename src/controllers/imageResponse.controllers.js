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

  // Use the $pull operator to remove the image URL from the array
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
      "Success"
    )
  );
});

export const getAllImageResponses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10)
  };

  const aggregation = [
    { $sort: { createdAt: -1 } } // Sort by createdAt in descending order
  ];

  // Apply pagination using aggregatePaginate
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
