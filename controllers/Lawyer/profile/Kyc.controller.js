import mongoose  from "mongoose";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../../../util/errorHandler/customError.js";
import lawyerKycModel from "../../../models/Lawyer/auth/lawyerKyc.model.js";


export const addLawyerKyc = async (req, res, next) => {
  try {
    const lawyerId = req.user?.id || req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(lawyerId)) {
      throw new UnauthorizedError("Invalid lawyer authentication");
    }

    const { documentType, certificateType, experince, field } = req.body || {};

    if (!documentType || !certificateType) {
      throw new BadRequestError(
        "documentType and certificateType are required"
      );
    }

    if (
      !req.files ||
      !req.files.documentFile ||
      !req.files.certificateFile
    ) {
      throw new BadRequestError(
        "Both documentFile and certificateFile are required"
      );
    }

    // Prevent duplicate uploads
    const exists = await lawyerKycModel.findOne({
      lawyerId,
      documentType,
      certificateType,
    });

    if (exists) {
      throw new ConflictError(
        "This identity and certificate already exist"
      );
    }

    const documentFileKey =
      `/uploads/kyc/lawyer/${req.files.documentFile[0].filename}`;

    const certificateFileKey =
      `/uploads/kyc/lawyer/${req.files.certificateFile[0].filename}`;

    const kyc = await lawyerKycModel.create({
      lawyerId,
      documentType,
      certificateType,
      documentFileKey,
      certificateFileKey,
      experince,
      field
    });

    res.status(201).json({
      success: true,
      message: "KYC uploaded successfully",
      kyc,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyKycList = async (req, res, next) => {
  try {
    const lawyerId = req.user?.id || req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(lawyerId)) {
      throw new UnauthorizedError("Invalid lawyer authentication");
    }

    const kycs = await lawyerKycModel
      .find({ lawyerId })
      .select("-__v")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: kycs.length,
      kycs,
    });
  } catch (error) {
    next(error);
  }
};

 export const getKycById = async (req, res, next) => {
  try {
    const lawyerId = req.user?.id || req.user?._id;
    const { kycId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(lawyerId) ||
      !mongoose.Types.ObjectId.isValid(kycId)
    ) {
      throw new BadRequestError("Invalid ID");
    }

    const kyc = await lawyerKycModel.findOne({
      _id: kycId,
      lawyerId,
    });

    if (!kyc) {
      throw new NotFoundError("KYC record not found");
    }

    res.status(200).json({
      success: true,
      kyc,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteKyc = async (req, res, next) => {
  try {
    const lawyerId = req.user?.id || req.user?._id;
    const { kycId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(lawyerId) ||
      !mongoose.Types.ObjectId.isValid(kycId)
    ) {
      throw new BadRequestError("Invalid ID");
    }

    const kyc = await lawyerKycModel.findOne({
      _id: kycId,
      lawyerId,
    });

    if (!kyc) {
      throw new NotFoundError("KYC record not found");
    }

    if (kyc.status === "APPROVED") {
      throw new BadRequestError(
        "Approved KYC cannot be deleted. Contact support."
      );
    }

    await lawyerKycModel.deleteOne({ _id: kycId });

    res.status(200).json({
      success: true,
      message: "KYC deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
