import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

dotenv.config({ path: "../../.env" });

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    });
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.log("failed to upload to cloudinary", error);
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteFromCloudinary = async (publicId, resourceType) => {
  if (!publicId) return null;
  publicId = publicId.split(".")[2].split("/").slice(5).join("/");

  try {
    let response = await cloudinary.uploader.destroy(publicId, {
      resource_type: `${resourceType}`
    });

    return response;
  } catch (error) {
    console.log("error while deleting from cloudinary", error);
    return null;
  }
};
export { uploadOnCloudinary, deleteFromCloudinary };
