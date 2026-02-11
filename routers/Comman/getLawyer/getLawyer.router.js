import express from "express";
import { getVerifiedLawyers } from "../../../controllers/Comman/Lawyer/getVerifiedLawyer";

const lawyerRouter = express.Router();

lawyerRouter.get('/',getVerifiedLawyers);

export default lawyerRouter;