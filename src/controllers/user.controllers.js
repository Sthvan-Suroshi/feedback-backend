import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AcademicYear } from "../models/academicYear.models.js";

const generateRefreshAndAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

export const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, college_id, accountType, academicYear, department } = req.body;

  if ([fullName, email, password, college_id, accountType, department].includes(undefined)) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ college_id }, { email }]
  });

  if (existedUser) {
    throw new ApiError(400, "User already exists!");
  }

  if (accountType === "student") {
    const isAcademicYearPresent = await AcademicYear.findOne({ _id: academicYear });
    if (!isAcademicYearPresent) {
      throw new ApiError(400, "Invalid academic year");
    }
  }

  const user = await User.create({
    fullName,
    email,
    password,
    college_id,
    accountType,
    department,
    academicYear: accountType === "student" ? academicYear : undefined
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refereshToken -accountType -college_id -department -academicYear"
  );

  if (!createdUser) {
    throw new ApiError(500, "Internal server error");
  }

  return res.status(200).json(new ApiResponse(200, createdUser, "User registered successfully"));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "User not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid credentials");
  }

  const { refreshToken, accessToken } = await generateRefreshAndAccessToken(user._id);

  const loggedIn = await User.findById(user._id).select("-password -refreshToken");

  if (!loggedIn) {
    throw new ApiError(500, "Internal server error");
  }

  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, loggedIn, "User logged in successfully"));
});

export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1
      }
    },
    {
      new: true
    }
  );

  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, { logout: true }, "User logged Out successfully"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, "User fetched successfully"));
});
