import mongoose from "mongoose";

const legalCaseSchema = new mongoose.Schema(
  {
    // user who needs lawyer
    caseOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    // FIR DETAILS (already registered in police)
    firDetails: {
      firNumber: {
        type: String,
        required: true,
        trim: true,
      },
      policeStation: {
        type: String,
        required: true,
      },
      district: String,
      state: String,
      firDate: Date,
      courtName: String,
    },

    // CASE INFORMATION
    caseTitle: {
      type: String,
      required: true,
    },

    caseDescription: {
      type: String,
      required: true,
    },

    caseCategory: {
      type: String,
      enum: [
        "Cyber Crime",
        "Theft",
        "Fraud",
        "Harassment",
        "Domestic Violence",
        "Property Dispute",
        "Criminal",
        "Civil",
        "Other",
      ],
      required: true,
    },

    // upload FIR copy / evidence
    documents: [
      {
        url: String,
        publicId: String,
        fileType: String,
        name: String,
      },
    ],

    // OPTIONAL but VERY useful for lawyer matching
    urgencyLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    budgetRange: {
      type: String,
      enum: ["Not Sure", "5k-10k", "10k-25k", "25k-50k", "50k+"],
      default: "Not Sure",
    },

    // ADMIN FLOW
    status: {
      type: String,
      enum: [
        "Pending",          // user requested lawyer
        "Under Review",     // admin checking case
        "Lawyer Assigned",
        "Lawyer Rejected",  // lawyer declined
        "In Progress",
        "Closed",
      ],
      default: "Pending",
    },

    adminRemarks: String,

    // LAWYER ASSIGNMENT
    assignedLawyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      default: null,
    },

    assignedAt: Date,
  },
  { timestamps: true }
);

const LegalCase = mongoose.model("LegalCase", legalCaseSchema);
export default LegalCase;