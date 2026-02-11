import express from "express";
import authUser from "../../../middlewares/auth/authUser.middleware";
import { getMyProfile, updateMyProfile } from "../../../controllers/User/profile/profile.controller";

const profileRouter = express.Router();

profileRouter.get('/',authUser,getMyProfile);
profileRouter.put('/',authUser,updateMyProfile.single('image'),updateMyProfile);

export default profileRouter;