import express from "express";
import lawyerRouter from "./getLawyer/getLawyer.router.js";
import FAQRouter from "./UI/FAQ.router.js";

const commanIndexRouter = express.Router();

commanIndexRouter.use('/lawyers',lawyerRouter);
commanIndexRouter.use('/faq',FAQRouter);

export default commanIndexRouter;