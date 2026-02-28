import express from "express";
import {
  createCase,
  getAllCases,
  getCaseById,
  updateCase,
  assignLawyer,
  getAssignedCasesByLawyer,
  getCasesOfUser,
} from "../../controllers/legalCase/lealCase.controller.js";

import  protect  from "../../middlewares/auth/authUser.middleware.js";
import isAdmin  from "../../middlewares/auth/authAdmin.middleware.js";
import {caseUploader}  from "../../middlewares/multer/FIR/caseUpload.js";
import authLawyer from "../../middlewares/auth/authLawyer.middleware.js"

const router = express.Router();

// Create case (upload FIR docs)
router.post(
  "/",
  protect,
  caseUploader.array("documents", 5),
  createCase
);

// Get single case (user/lawyer/admin)
router.get("/:id", protect, getCaseById);

// Get all cases (admin dashboard)
router.get("/", protect, isAdmin, getAllCases);

// Update case (status / remarks)
router.patch("/:id", protect, isAdmin, updateCase);

// Assign lawyer to case
router.post("/assign-lawyer", protect, isAdmin, assignLawyer);


// Get cases assigned to logged-in lawyer
router.get("/lawyer/assigned", authLawyer, getAssignedCasesByLawyer);


router.get("/my-cases", protect, getCasesOfUser);


export default router;