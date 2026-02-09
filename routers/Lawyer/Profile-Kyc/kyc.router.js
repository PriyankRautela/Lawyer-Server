import express from "express";
import {
  addLawyerKyc,
  getMyKycList,
  getKycById,
  deleteKyc,
} from "../../../controllers/Lawyer/profile/Kyc.controller.js";

import authLawyer from "../../../middlewares/auth/authLawyer.middleware.js";
import lawyerKycUpload from "../../../middlewares/multer/lawyer/lawyerKycUpload.js";

const lawyerKycRouter = express.Router();

lawyerKycRouter.post(
  "/",
  authLawyer,
  lawyerKycUpload.fields([
    { name: "documentFile", maxCount: 1 },
    { name: "certificateFile", maxCount: 1 },
  ]),
  addLawyerKyc
);

lawyerKycRouter.get("/", authLawyer, getMyKycList);
lawyerKycRouter.get("/:kycId", authLawyer, getKycById);

lawyerKycRouter.delete("/:kycId", authLawyer, deleteKyc);

export default lawyerKycRouter;
