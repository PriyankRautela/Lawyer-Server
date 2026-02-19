import mongoose from "mongoose";

const firRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },

    firNumber: String,
    policeStation: String,
    district: String,
    state: String,
    incidentDate: Date,
    complainantName: String,

    uploadedFirCopy: String,
    idProof: String,

    amount: { type: Number, default: 999 },

    paymentId: String,
    paymentStatus: {
      type: String,
      enum: ["PAID"],
      default: "PAID",
    },

    invoiceNumber: String,

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    status: {
      type: String,
      enum: [
        "SUBMITTED",
        "UNDER_REVIEW",
        "IN_PROGRESS",
        "DELIVERED",
        "REJECTED",
      ],
      default: "SUBMITTED",
    },

    deliveredFile: String,
    rejectionReason: String,
  },
  { timestamps: true }
);

export default mongoose.model("FirRequest", firRequestSchema);
