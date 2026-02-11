import express from "express";
import { getVerifiedLawyers } from "../../../controllers/Comman/Lawyer/getVerifiedLawyer.js";

const lawyerRouter = express.Router();

lawyerRouter.get('/',getVerifiedLawyers);

export default lawyerRouter;