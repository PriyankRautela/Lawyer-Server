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
    documentFileKey: {
      type: String,
      required: true,
    },
    
    certificateFileKey: {
      type: String,
      required: true,
    },
    experince:{
      type:String,
      required:true
    },
    field:{
      type:[String],
      required:true
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    barCouncilId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
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
