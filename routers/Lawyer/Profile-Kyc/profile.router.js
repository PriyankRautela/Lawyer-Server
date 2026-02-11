import express from "express";
import authLawyer from "../../../middlewares/auth/authLawyer.middleware.js";
import { getMyLawyerProfile, updateMyLawyerProfile } from "../../../controllers/Lawyer/profile/profile.controller.js";
import { profileImageUploader } from "../../../middlewares/multer/lawyer/profileUpload.js";

const profileRouter = express.Router();

profileRouter.get('/',authLawyer,getMyLawyerProfile);
profileRouter.put('/',authLawyer,profileImageUploader.single("image"),updateMyLawyerProfile);

export default profileRouter;