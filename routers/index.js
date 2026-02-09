import express from 'express';
import userIndexRouter from './User/userIndex.js';
import adminIndexRouter from './Admin/adminIndex.js';
import lawyerIndexRouter from './Lawyer/lawyerIndex.js';

const router = express.Router();

router.use('/user',userIndexRouter);
router.use('/admin',adminIndexRouter);
router.use('/lawyer',lawyerIndexRouter);


export default router;