import express from "express";
import { getAllKyc } from "../../../controllers/Lawyer/profile/Kyc.controller.js";
import authAdmin from "../../../middlewares/auth/authAdmin.middleware.js";

const adminKycRouter = express.Router();

adminKycRouter.get("/", authAdmin, getAllKyc);

export default adminKycRouter;
