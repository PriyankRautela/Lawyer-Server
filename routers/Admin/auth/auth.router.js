import express from "express";
import {
  adminRegister,
  verifyAdminOtp,
  adminLogin,
  logoutAdmin,
  forgotAdminPassword,
  resetAdminPassword,
  refreshAdminAccessToken,
  deleteAdminAccount,
} from "../../../controllers/Admin/auth/auth.controller.js";

import authMiddleware from "../../../middlewares/auth/authAdmin.middleware.js";

const adminAuthRouter = express.Router();

adminAuthRouter.post("/register", adminRegister);
adminAuthRouter.post("/verify-otp", verifyAdminOtp);

adminAuthRouter.post("/login", adminLogin);
adminAuthRouter.post("/logout", authMiddleware, logoutAdmin);

adminAuthRouter.post("/forgot-password", forgotAdminPassword);
adminAuthRouter.post("/reset-password", resetAdminPassword);

adminAuthRouter.post("/refresh-token", refreshAdminAccessToken);

adminAuthRouter.delete(
  "/delete-account",
  authMiddleware,
  deleteAdminAccount
);

export default adminAuthRouter;
