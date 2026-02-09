import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim:true
    },
    password: {
      type: String,
      select: false
    },
    dob: { type: Date },
    image: {
      type: String,
      default:
        "https://firebasestorage.googleapis.com/v0/b/learning-63a18.appspot.com/o/users%2F21bed273-2706-4708-a35b-7d9bd0b8140e-1733399052578.jpeg?alt=media&token=b235cc0c-d341-4216-9e33-e95bded48224",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      select: false
    },
    contact: {
      type: Number,
      required:true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    refreshToken:{
      type:String,
      select: false
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      select: false
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model("Users", userSchema);
export default userModel;
