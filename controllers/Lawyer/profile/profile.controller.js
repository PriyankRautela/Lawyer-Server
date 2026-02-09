import mongoose from "mongoose";
import lawyerModel from "../../../models/Lawyer/lawyer.model.js";
import {
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ConflictError,
} from "../../../util/errorHandler/customError.js";

/* =====================================
   GET LAWYER PROFILE (SELF)
===================================== */
const getMyLawyerProfile = async (req, res, next) => {
  try {
    const lawyerId = req?.user?.id || req?.user?._id;

    if (!lawyerId || !mongoose.Types.ObjectId.isValid(lawyerId)) {
      throw new UnauthorizedError("Invalid lawyer authentication");
    }

    const lawyer = await lawyerModel
      .findById(lawyerId)
      .select("-__v -createdBy -updateBy");

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

/* =====================================
   UPDATE LAWYER PROFILE (SELF)
===================================== */
const updateMyLawyerProfile = async (req, res, next) => {
  try {
    const lawyerId = req?.user?.id || req?.user?._id;

    if (!lawyerId || !mongoose.Types.ObjectId.isValid(lawyerId)) {
      throw new UnauthorizedError("Invalid lawyer authentication");
    }

    const {
      name,
      image,
      barCouncilId,
      yearOfExperince,
      fee,
      contactNumber,
      certificate,
      govId,
    } = req.body || {};

    // Nothing to update
    if (
      !name &&
      !image &&
      !barCouncilId &&
      !yearOfExperince &&
      fee === undefined &&
      !contactNumber &&
      !certificate &&
      !govId
    ) {
      throw new ValidationError("No valid fields provided for update");
    }

    /* -------------------------------
       Bar Council ID uniqueness
    -------------------------------- */
    if (barCouncilId) {
      const exists = await lawyerModel.findOne({
        barCouncilId,
        _id: { $ne: lawyerId },
      });

      if (exists) {
        throw new ConflictError("Bar Council ID already in use");
      }
    }

    /* -------------------------------
       Contact number validation
    -------------------------------- */
    if (contactNumber && String(contactNumber).length < 8) {
      throw new ValidationError("Invalid contact number");
    }

    /* -------------------------------
       Build safe update object
    -------------------------------- */
    const updatePayload = {
      ...(name && { name: name.trim() }),
      ...(image && { image }),
      ...(barCouncilId && { barCouncilId: barCouncilId.trim() }),
      ...(yearOfExperince && { yearOfExperince }),
      ...(fee !== undefined && { fee }),
      ...(contactNumber && { contactNumber }),
      ...(certificate && { certificate }),
      ...(govId && { govId }),
      updateBy: lawyerId,
    };

    const updatedLawyer = await lawyerModel.findByIdAndUpdate(
      lawyerId,
      { $set: updatePayload },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedLawyer) {
      throw new NotFoundError("Lawyer profile not found");
    }

    const lawyer = updatedLawyer.toObject();
    delete lawyer.__v;
    delete lawyer.createdBy;
    delete lawyer.updateBy;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      lawyer,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getMyLawyerProfile,
  updateMyLawyerProfile,
};
