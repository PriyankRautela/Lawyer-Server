import express from "express";
import { createFirDraft } from "../../controllers/FIR/firDraft.controller.js";
import { createFirPaymentSession } from "../../controllers/FIR/firPayment.js";
import { updateFirStatus } from "../../controllers/FIR/firAdmin.controller.js";
import { adminSendFirMessage, userSendFirMessage, getFirMessages } from "../../controllers/FIR/firAdmin.controller.js";

import  firUploader  from "../../middlewares/multer/FIR/firUploader.js";
import authUser from "../../middlewares/auth/authUser.middleware.js";
import authAdmin from "../../middlewares/auth/authAdmin.middleware.js";

const firRouter = express.Router();

firRouter.post(
  "/draft",authUser
  ,
  firUploader.fields([
    { name: "uploadedFirCopy", maxCount: 1 },
    { name: "idProof", maxCount: 1 },
  ]),
  createFirDraft
);

// Create Payment Session
firRouter.post(
  "/payment",
  authUser,
  createFirPaymentSession
);

// Get Conversation
firRouter.get(
  "/:requestId/messages",
  authUser,
  getFirMessages
);

// User send message
firRouter.post(
  "/:requestId/user/message",
  authUser,
  firUploader.single("attachment"),
  userSendFirMessage
);

/* ===============================
   ADMIN ROUTES
=============================== */

// Update FIR Status
firRouter.put(
  "/:id/status",
  authAdmin,
  firUploader.single("deliveredFile"),
  updateFirStatus
);

// Admin send message
firRouter.post(
  "/:requestId/admin/message",
  authAdmin,
  firUploader.single("attachment"),
  adminSendFirMessage
);

export default firRouter;
