import mongoose from "mongoose"
const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", 
    },
    employeId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "employe", 
    },
    otp: {
      type:String,
      required: true,
      expired:"15m"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    isUsed:{
      type:Boolean,
      default:false
    }
  },
  { timestamps: true }
);

const otpModel = mongoose.model("otps", otpSchema);
export default otpModel;
