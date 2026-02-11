import express from "express";
import lawyerRouter from "./getLawyer/getLawyer.router.js";

const commanIndexRouter = express.Router();

commanIndexRouter.use('/lawyers',lawyerRouter);

export default commanIndexRouter;