import express from 'express';
import { authRouter } from './auth/auth.router.js';

const userIndexRouter =  express.Router();

userIndexRouter.use('/auth',authRouter);

export default userIndexRouter;