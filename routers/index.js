import express from 'express';
import userIndexRouter from './User/userIndex.js';
import adminIndexRouter from './Admin/adminIndex.js';
import lawyerIndexRouter from './Lawyer/lawyerIndex.js';
import commanIndexRouter from './Comman/commanIndex.router.js';
import firRouter from './FIR/fir.router.js';
import webRouter from './FIR/firWebhook.router.js';

const router = express.Router();

router.use('/user',userIndexRouter);
router.use('/admin',adminIndexRouter);
router.use('/lawyer',lawyerIndexRouter);
router.use('/comman',commanIndexRouter);
router.use('/fir',firRouter);
router.use('/webhook',webRouter);


export default router;