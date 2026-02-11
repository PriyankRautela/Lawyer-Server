import mongoose from "mongoose";
import lawyerModel from "../../../models/Lawyer/auth/auth.model.js";
import {
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ConflictError,
} from "../../../util/errorHandler/customError.js";

const getMyLawyerProfile = async (req, res, next) => {
  try {
    const lawyerId = req?.user?.id || req?.user?._id;

    if (!lawyerId || !mongoose.Types.ObjectId.isValid(lawyerId)) {
      throw new UnauthorizedError("Invalid lawyer authentication");
    }

    const lawyer = await lawyerModel
      .findById(lawyerId)
      .select("-__v -password -createdBy -updateBy");

    if (!lawyer) {
      throw new NotFoundError("Lawyer profile not found");
    }

    res.status(200).json({
      success: true,
      lawyer,
    });
  } catch (error) {
    next(error);
  }
};
const updateMyLawyerProfile = async (req, res, next) => {
  try {
    const lawyerId = req?.user?.id || req?.user?._id;

    if (!lawyerId || !mongoose.Types.ObjectId.isValid(lawyerId)) {
      throw new UnauthorizedError("Invalid lawyer authentication");
    }

    const {
      name,
      barCouncilId,
      yearOfExperince,
      fee,
      contactNumber,
      state
    } = req.body || {};

    const image = req.file
      ? `${req.protocol}://${req.get("host")}/${req.file.path}`
      : undefined;

    if (
      !name &&
      !barCouncilId &&
      !yearOfExperince &&
      fee === undefined &&
      !contactNumber &&
      !image
    ) {
      throw new ValidationError("No valid fields provided for update");
    }

    if (barCouncilId) {
      const exists = await lawyerModel.findOne({
        barCouncilId,
        _id: { $ne: lawyerId },
      });

      if (exists) {
        throw new ConflictError("Bar Council ID already in use");
      }
    }

    if (contactNumber && String(contactNumber).length < 8) {
      throw new ValidationError("Invalid contact number");
    }

    if (fee !== undefined && fee < 0) {
      throw new ValidationError("Fee cannot be negative");
    }


    const updatePayload = {
      ...(name && { name: name.trim() }),
      ...(barCouncilId && { barCouncilId: barCouncilId.trim() }),
      ...(yearOfExperince && { yearOfExperince }),
      ...(fee !== undefined && { fee }),
      ...(state !==undefined&&{state}),
      ...(contactNumber && { contactNumber }),
      ...(image && { image }),
      updateBy: lawyerId,
    };

    const updatedLawyer = await lawyerModel.findByIdAndUpdate(
      lawyerId,
      { $set: updatePayload },
      {
        new: true,
        runValidators: true,
      }
    ).select("-__v -password -createdBy -updateBy");

    if (!updatedLawyer) {
      throw new NotFoundError("Lawyer profile not found");
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      lawyer: updatedLawyer,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getMyLawyerProfile,
  updateMyLawyerProfile,
};
