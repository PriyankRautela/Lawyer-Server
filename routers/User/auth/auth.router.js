import express from "express";
import {
 userRegister,
  verifyOtp,
  userLogin,
  addPassword,
  logoutUser,
  refreshAccessToken,
  forgotPassword,
  verifyForgotOtp,
  addNewPassword,
  googleLogin,
  deleteMyAccount
} from "../../../controllers/User/auth/auth.controller.js";
import authUser from "../../../middlewares/auth/authUser.middleware.js";
const authRouter = express.Router();

// User Registration
authRouter.post("/register",  userRegister);

// Otp verfication
authRouter.post("/verify-otp", verifyOtp);

//addPassword
authRouter.post("/add-pass", addPassword);

// User Login
authRouter.post("/login", userLogin);

//User Logout
authRouter.post("/logout", logoutUser);

//Create access token
authRouter.post("/refresh", refreshAccessToken);

authRouter.post("/googleLogin", googleLogin);

authRouter.post("/delete", authUser, deleteMyAccount);

authRouter.post("/forgot", forgotPassword);

authRouter.post("/forgot/verify", verifyForgotOtp);

authRouter.post("/forgot/pass", addNewPassword);

export { authRouter };
