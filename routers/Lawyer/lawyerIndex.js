import express from 'express'
import lawyerauthRouter from "./auth/auth.router.js";
import lawyerKycRouter from './Profile-Kyc/kyc.router.js';
import profileRouter from './Profile-Kyc/profile.router.js';

const lawyerIndexRouter = express.Router();
lawyerIndexRouter.use("/auth", lawyerauthRouter);
lawyerIndexRouter.use("/KYC",lawyerKycRouter);
lawyerIndexRouter.use("/profile",profileRouter);

export default lawyerIndexRouter;