import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true
  },

  password: {
    type: String,
    required: true
  },

  college_id: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return (
          /^2JR21(EC|CS|ME|CV|AI)\d{3}$/.test(v) ||
          /^JCER\d{3}$/.test(v) ||
          /^INST(EC|CS|ME|CV|AI)\d{3}$/.test(v)
        );
      },
      message: (props) => `${props.value} is not a valid code!`
    }
  },

  department: {
    type: String,
    required: true,
    enum: ["CSE", "ECE", "MECH", "CIVIL", "AIML", "ALL"]
  },

  accountType: {
    type: String,
    enum: ["student", "admin", "instructor"],
    default: "student",
    required: true
  },

  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicYear",
    required: function () {
      return this.accountType === "student";
    }
  },

  refreshToken: {
    type: String
  }
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      accountType: this.accountType,
      department: this.department,
      academicYear: this.academicYear
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      accountType: this.accountType,
      department: this.department
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  );
};

export const User = mongoose.model("User", userSchema);
