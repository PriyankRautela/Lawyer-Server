import express from "express";
import protectAdmin  from "../../middlewares/auth/authAdmin.middleware.js"
import {
  createTerms,
  getAllTermsVersions,
  getLatestTerms,
} from "../../controllers/Legal/tems&Condition.controller.js"

const termRouter = express.Router();

termRouter.post("/", protectAdmin, createTerms);
termRouter.get("/latest",getLatestTerms)
termRouter.get("/", protectAdmin, getAllTermsVersions);

export default termRouter;