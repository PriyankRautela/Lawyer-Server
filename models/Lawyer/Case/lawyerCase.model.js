import mongoose from "mongoose";

const lawyerCaseSchema = new mongoose.Schema(
  {
    
    lawyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lawyer",
      required: true,
      index: true,
    },
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LegalCase",
      required: true,
      index: true,
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    assignmentStatus: {
      type: String,
      enum: [
        "Assigned",
        "Accepted",
        "Rejected",
        "Completed",
        "Withdrawn",
      ],
      default: "Assigned",
    },

    assignedAt: {
      type: Date,
      default: Date.now,
    },

    acceptedAt: Date,
    rejectedAt: Date,
    completedAt: Date,

    adminNotes: String,
    lawyerNotes: String,
  },
  { timestamps: true }
);

lawyerCaseSchema.index({ lawyerId: 1, caseId: 1 }, { unique: true });

const LawyerCase = mongoose.model("LawyerCase", lawyerCaseSchema);
export default LawyerCase;