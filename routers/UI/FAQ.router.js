import express from "express";
import protectAdmin from "../../middlewares/auth/authAdmin.middleware.js";
import {
  createFaq,
  updateFaq,
  deleteFaq,
} from "../../controllers/UI/FAQ.controller.js";

const router = express.Router();

router.post("/", protectAdmin, createFaq);
router.put("/:id", protectAdmin, updateFaq);
router.delete("/:id", protectAdmin, deleteFaq);

export default router;