import firDraftModel from "../../models/FIR/firDraftSchema.model.js";
import { ValidationError } from "../../util/errorHandler/customError.js";

export const createFirDraft = async (req, res, next) => {
  try {
    const userId = req?.user?.id;

    const {
      firNumber,
      policeStation,
      district,
      state,
      incidentDate,
      complainantName,
      legalDeclarationAccepted,
    } = req?.body||{};

    if (!legalDeclarationAccepted) {
      throw new ValidationError("Legal declaration is required");
    }

    if (!policeStation || !district || !state || !complainantName) {
      throw new ValidationError("Required fields missing");
    }

    const uploadedFirCopy =
      req?.files?.uploadedFirCopy?.[0]?.path || null;

    const idProof =
      req?.files?.idProof?.[0]?.path || null;

    const draft = await firDraftModel.create({
      userId,
      firNumber,
      policeStation,
      district,
      state,
      incidentDate,
      complainantName,
      legalDeclarationAccepted,
      uploadedFirCopy,
      idProof,
    });

    res.status(201).json({
      success: true,
      message: "FIR draft created successfully",
      draftId: draft._id,
    });
  } catch (error) {
    next(error);
  }
};