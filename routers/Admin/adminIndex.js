import express from 'express'
import adminauthRouter from "./auth/auth.router.js";
import adminKycRouter from './Kyc/lawyerKyc.router.js';

const adminIndexRouter = express.Router();
adminIndexRouter.use("/auth", adminauthRouter);
adminIndexRouter.use("/KYC",adminKycRouter);


export default adminIndexRouter;