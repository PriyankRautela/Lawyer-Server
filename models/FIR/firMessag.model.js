import mongoose from "mongoose";

const firMessageSchema = new mongoose.Schema(
  {
    firRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FirRequest",
      required: true,
      index: true,
    },

    senderType: {
      type: String,
      enum: ["USER", "ADMIN"],
      required: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    attachment: String, 

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("FirMessage", firMessageSchema);
