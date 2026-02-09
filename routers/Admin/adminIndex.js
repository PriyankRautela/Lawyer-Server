import express from 'express'
import adminauthRouter from "./auth/auth.router.js";

const adminIndexRouter = express.Router();
adminIndexRouter.use("/auth", adminauthRouter);


export default adminIndexRouter;