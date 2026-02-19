import firDraftModel from "../../models/FIR/firDraftSchema.model.js";

export const createFirDraft = async (req, res, next) => {
  try {
    const userId = req?.user?.id;

    const draft = await firDraftModel.create({
      userId,
      ...req.body,
      uploadedFirCopy: req?.files?.uploadedFirCopy?.[0]?.path,
      idProof: req?.files?.idProof?.[0]?.path,
    });

    res.status(201).json({
      success: true,
      draftId: draft._id,
    });
  } catch (error) {
    next(error);
  }
};
