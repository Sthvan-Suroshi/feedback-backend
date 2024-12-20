import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select("-password -refereshToken");

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error has occured in auth middleware ");
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export const isStudent = asyncHandler(async (req, _, next) => {
  if (req.user?.accountType !== "student") {
    throw new ApiError(401, "Unauthorized request to student");
  }
  next();
});

export const isAdmin = asyncHandler(async (req, _, next) => {
  if (req.user?.accountType !== "admin") {
    throw new ApiError(401, "Unauthorized request to admin");
  }
  next();
});

export const isInstructor = asyncHandler(async (req, _, next) => {
  if (req.user?.accountType !== "instructor") {
    throw new ApiError(401, "Unauthorized request to instructor");
  }
  next();
});

export const isAdminOrInstructor = asyncHandler(async (req, _, next) => {
  if (req.user?.accountType !== "admin" && req.user?.accountType !== "instructor") {
    throw new ApiError(401, "Unauthorized request to admin or instructor");
  }
  next();
});
