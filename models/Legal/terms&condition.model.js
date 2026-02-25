import mongoose from "mongoose";

const termsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "Terms & Conditions",
    },

    content: {
      type: String,
      required: true,
    },

    version: {
      type: Number,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Terms", termsSchema);