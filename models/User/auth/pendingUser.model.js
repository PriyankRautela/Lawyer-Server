import mongoose from "mongoose";

const pendingUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  otp: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  expireAt: {  
    type: Date,
    default: Date.now,
    expires: 60 * 15 // 15 minutes
  }
}, { timestamps: true });

const pendingUserModel=mongoose.model("PendingUser", pendingUserSchema);

export default  pendingUserModel;