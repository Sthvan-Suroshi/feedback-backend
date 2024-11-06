import mongoose from "mongoose";

const academicYearSchema = new mongoose.Schema({
  year: {
    type: String,
    required: true,
    unique: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

export const AcademicYear = mongoose.model("AcademicYear", academicYearSchema);
