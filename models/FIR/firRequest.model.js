import mongoose from "mongoose";

const firRequestSchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
    index: true,
  },

  // Same FIR form data (copied from draft)
  firNumber: String,
  policeStation: String,
  district: String,
  state: String,
  incidentDate: Date,
  complainantName: String,
  uploadedFirCopy: String,
  idProof: String,

  // Payment info
  amount: { type: Number, default: 999 },
  paymentId: { type: String, required: true },
  invoiceNumber: String,

  // Admin workflow
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