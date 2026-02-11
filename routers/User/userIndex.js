import express from 'express';
import { authRouter } from './auth/auth.router.js';
import profileRouter from './profile/profile.router.js';

const userIndexRouter =  express.Router();

userIndexRouter.use('/auth',authRouter);
userIndexRouter.use('/profile',profileRouter);

export default userIndexRouter;