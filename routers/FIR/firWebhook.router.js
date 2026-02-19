import express from "express";
import { stripeWebhook } from "../../controllers/FIR/firWebhook.controller.js";

const webRouter = express.Router();

webRouter.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

export default webRouter;
