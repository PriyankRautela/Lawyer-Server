import express from "express";
import authUser from "../../../middlewares/auth/authUser.middleware.js";
import { getMyProfile, updateMyProfile } from "../../../controllers/User/profile/profile.controller.js";
import { userProfileImageUploader } from "../../../middlewares/multer/user/profileUpload.js";

const profileRouter = express.Router();

profileRouter.get('/',authUser,getMyProfile);
profileRouter.put('/',authUser,userProfileImageUploader.single('image'),updateMyProfile);

export default profileRouter;