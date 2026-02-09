import mongoose from "mongoose";

const blockUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "employe",
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "employe",
  },
});

const blockUserModel = mongoose.model("blockUser", blockUserSchema);
export default blockUserModel;

