import { isValidObjectId } from "mongoose";
import { AcademicYear } from "../models/academicYear.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const addAcademicYear = asyncHandler(async (req, res) => {
  const { year } = req.body;

  if (!year) {
    throw new ApiError(400, "Year is required");
  }

  const isAcademicYearPresent = await AcademicYear.findOne({ year });

  if (isAcademicYearPresent) {
    throw new ApiError(400, "Academic year already exists");
  }

  const academicYear = await AcademicYear.create({
    year,
    createdBy: req.user?._id
  });

  if (!academicYear) {
    throw new ApiError(500, "Something went wrong, Academic year not created");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, academicYear, "Academic year created successfully"));
});

export const deleteAcademicYear = asyncHandler(async (req, res) => {
  const { academicYearId } = req.params;

  if (!academicYearId) {
    throw new ApiError(400, "Academic year ID is required");
  }

  if (!isValidObjectId(academicYearId)) {
    throw new ApiError(400, "Invalid academic year ID");
  }

  const academicYear = await AcademicYear.findById(academicYearId);

  if (!academicYear) {
    throw new ApiError(404, "Academic year not found");
  }

  if (academicYear.createdBy.toString() !== req.user?._id.toString() && !req.user.isAdmin) {
    throw new ApiError(403, "You are not authorized to delete this academic year");
  }

  const deletedAcademicYear = await AcademicYear.findByIdAndDelete(academicYearId);

  if (!deletedAcademicYear) {
    throw new ApiError(500, "Something went wrong while deleting the academic year");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedAcademicYear, "Academic year deleted successfully"));
});
