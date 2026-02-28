import mongoose from "mongoose";

const caseMessageSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LegalCase",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    senderRole: {
      type: String,
      enum: ["User", "Lawyer", "Admin"],
      required: true,
    },

    messageType: {
      type: String,
      enum: ["text", "file", "image"],
      default: "text",
    },

    message: {
      type: String,
      trim: true,
    },

    attachments: [
      {
        url: String,
        publicId: String,
        fileType: String,
        name: String,
      },
    ],

    isReadBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// for fast chat loading
caseMessageSchema.index({ caseId: 1, createdAt: -1 });

const CaseMessage = mongoose.model("CaseMessage", caseMessageSchema);
export default CaseMessage;