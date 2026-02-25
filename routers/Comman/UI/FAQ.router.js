import express from "express";
import {
  getAllFaqs,
  getSingleFaq,
} from "../../../controllers/UI/FAQ.controller.js";

const FAQRouter = express.Router();

FAQRouter.get("/", getAllFaqs);
FAQRouter.get("/:id", getSingleFaq);

export default FAQRouter;