import express from "express";
import { getAllKyc,reviewLawyerKyc } from "../../../controllers/Admin/kyc/kycVerification.controller.js";
import authAdmin from "../../../middlewares/auth/authAdmin.middleware.js";

const adminKycRouter = express.Router();

adminKycRouter.get("/", authAdmin, getAllKyc);
adminKycRouter.put(
  "/kyc/:kycId/review",authAdmin,reviewLawyerKyc
);

export default adminKycRouter;
