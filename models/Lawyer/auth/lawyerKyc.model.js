import mongoose from "mongoose";

const lawyerKycSchema = new mongoose.Schema(
  {
    lawyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lawyer",
      required: true,
      index: true,
    },
    
    documentType: {
      type: String,
      enum: ["AADHAR", "PAN", "PASSPORT"],
      required: true,
    },

    certificateType: {
      type: String,
      enum: [
        "BAR_CERTIFICATE",
        "LAW_DEGREE",
        "ENROLLMENT_CERTIFICATE",
        "EXPERIENCE_CERTIFICATE",
      ],
      required: true,
    },

    fileKey: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    reviewedAt: Date,
    rejectionReason: String,
  },
  { timestamps: true }
);


const lawyerKycModel = mongoose.model("LawyerKyc", lawyerKycSchema);
export default lawyerKycModel;
