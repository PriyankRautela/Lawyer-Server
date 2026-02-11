import express from "express";
import authLawyer from "../../../middlewares/auth/authLawyer.middleware";
import { getMyLawyerProfile, updateMyLawyerProfile } from "../../../controllers/Lawyer/profile/profile.controller";

const profileRouter = express.Router();

profileRouter.get('/',authLawyer,getMyLawyerProfile);
profileRouter.put('/',authLawyer,updateMyLawyerProfile);

export default profileRouter;