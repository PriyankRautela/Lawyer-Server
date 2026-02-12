import mongoose from "mongoose";

const lawyerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      select: false,
    },
    barCouncilId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    image: {
      type: String,
      default:
        "https://firebasestorage.googleapis.com/v0/b/learning-63a18.appspot.com/o/users%2F21bed273-2706-4708-a35b-7d9bd0b8140e-1733399052578.jpeg?alt=media&token=b235cc0c-d341-4216-9e33-e95bded48224",
    },
    yearOfExperince: {
      type: String,
    },
    state:{
      type:String
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    avilable:{
      type:Boolean,
      default:true
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    kycVerified: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lawyer",
    },

    updateBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lawyer",
    },
  },
  { timestamps: true },
);

const lawyerModel = mongoose.model("Lawyer", lawyerSchema);

export default lawyerModel;
