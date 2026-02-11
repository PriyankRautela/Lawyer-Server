import mongoose from "mongoose";
import lawyerKycModel from "../../../models/Lawyer/auth/lawyerKyc.model.js";
import lawyerModel from "../../../models/Lawyer/auth/auth.model.js";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from "../../../util/errorHandler/customError.js";

export const getAllKyc = async (req, res, next) => {
  try {
    const { status, documentType, certificateType, lawyerId } = req?.query;

    const filter = {};

    if (status) filter.status = status;
    if (documentType) filter.documentType = documentType;
    if (certificateType) filter.certificateType = certificateType;
    if (lawyerId) filter.lawyerId = lawyerId;

    const kycs = await lawyerKycModel
      .find(filter)
      .populate("lawyerId", "name email contactNumber")
      .populate("reviewedBy", "name email")
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


const reviewLawyerKyc = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { kycId } = req.params;
    const { action, rejectionReason } = req.body;
    const adminId = req?.user?.id || req?.user?._id;

    if (!mongoose.Types.ObjectId.isValid(kycId)) {
      throw new ValidationError("Invalid KYC ID");
    }

    if (!["APPROVED", "REJECTED"].includes(action)) {
      throw new ValidationError("Invalid review action");
    }

    await session.withTransaction(async () => {
      const kyc = await lawyerKycModel
        .findById(kycId)
        .session(session);

      if (!kyc) {
        throw new NotFoundError("KYC request not found");
      }

      if (kyc.status !== "PENDING") {
        throw new ConflictError("KYC already reviewed");
      }

      if (action === "REJECTED" && !rejectionReason) {
        throw new ValidationError("Rejection reason is required");
      }

      kyc.status = action;
      kyc.reviewedBy = adminId;
      kyc.reviewedAt = new Date();

      if (action === "REJECTED") {
        kyc.rejectionReason = rejectionReason;
      }

      await kyc.save({ session });

      if (action === "APPROVED") {
        await lawyerModel.findByIdAndUpdate(
          kyc.lawyerId,
          {
            $set: {
              kycVerified: true,
              isVerified: true,
            },
          },
          { session }
        );
      }

      if (action === "REJECTED") {
        await lawyerModel.findByIdAndUpdate(
          kyc.lawyerId,
          {
            $set: {
              kycVerified: false,
            },
          },
          { session }
        );
      }
    });

    res.status(200).json({
      success: true,
      message:
        action === "APPROVED"
          ? "KYC approved successfully"
          : "KYC rejected successfully",
    });
  } catch (error) {
    next(error);
  } finally {
    session.endSession();
  }
};

export { reviewLawyerKyc };
