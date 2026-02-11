import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import userModel from "../../../models/User/auth/auth.model.js";
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
} from "../../../util/errorHandler/customError.js";

export const getMyProfile = async (req, res, next) => {
  try {
    const userId = req?.user?.id || req?.user?._id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new UnauthorizedError("Invalid user authentication");
    }

    const user = await userModel
      .findById(userId)
      .select("-password -refreshToken -__v -createdBy -updatedBy");

    if (!user) {
      throw new NotFoundError("User not found");
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const userId = req?.user?.id || req?.user?._id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new UnauthorizedError("Invalid user authentication");
    }

    const { name, contact, gender, dob } = req.body || {};

    const user = await userModel.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (gender) {
      if (user.gender) {
        throw new ConflictError("Gender can only be updated once");
      }

      if (!["Male", "Female", "Other"].includes(gender)) {
        throw new ValidationError("Invalid gender value");
      }

      user.gender = gender;
    }

    if (dob) {
      if (user.dob) {
        throw new ConflictError("Date of birth can only be updated once");
      }

      const parsedDob = new Date(dob);

      if (isNaN(parsedDob.getTime())) {
        throw new ValidationError("Invalid date format");
      }

      user.dob = parsedDob;
    }

    if (name) user.name = name.trim();
    if (contact) user.contact = contact;

    if (req.file) {
      const imageUrl = `${req.protocol}://${req.get("host")}/${req.file.path}`;

      if (
        user.image &&
        !user.image.includes("firebasestorage.googleapis.com")
      ) {
        const oldPath = path.join(process.cwd(), user.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      user.image = imageUrl;
    }

    user.updatedBy = userId;

    await user.save();

    const updatedUser = await userModel
      .findById(userId)
      .select("-password -refreshToken -__v -createdBy -updatedBy");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};



