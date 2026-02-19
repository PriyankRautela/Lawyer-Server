import mongoose from "mongoose";

const firDraftSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },

    firNumber: String,
    policeStation: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    incidentDate: Date,
    complainantName: { type: String, required: true },

    uploadedFirCopy: String,
    idProof: String,

    legalDeclarationAccepted: {
      type: Boolean,
      required: true,
    },

    paymentSessionId: String,

    status: {
      type: String,
      enum: ["PAYMENT_PENDING", "PAID", "EXPIRED"],
      default: "PAYMENT_PENDING",
    },
  },
  { timestamps: true }
);

export default mongoose.model("FirDraft", firDraftSchema);
