import express from "express";
import {
  lawyerRegister,
  verifyLawyerOtp,
  lawyerLogin,
  forgotLawyerPassword,
  resetLawyerPassword,
  logoutLawyer,
  deleteLawyerAccount,
} from "../../../controllers/Lawyer/auth/auth.controller.js";

import authMiddleware from "../../../middlewares/auth/authLawyer.middleware.js";

const lawyerauthRouter = express.Router();


lawyerauthRouter.post("/register", lawyerRegister);
lawyerauthRouter.post("/verify-otp", verifyLawyerOtp);

lawyerauthRouter.post("/login", lawyerLogin);
lawyerauthRouter.post("/logout", authMiddleware, logoutLawyer);


lawyerauthRouter.post("/forgot-password", forgotLawyerPassword);
lawyerauthRouter.post("/reset-password", resetLawyerPassword);


lawyerauthRouter.delete(
  "/delete-account",
  authMiddleware,
  deleteLawyerAccount
);

export default lawyerauthRouter;
