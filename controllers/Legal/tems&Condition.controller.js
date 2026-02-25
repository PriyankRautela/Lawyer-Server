import termsModel from "../../models/Legal/terms&condition.model.js";

export const createTerms = async (req, res, next) => {
  try {
    const adminId = req?.user?.id;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    // get last version
    const lastTerms = await termsModel
      .findOne()
      .sort({ version: -1 });

    const newVersion = lastTerms ? lastTerms.version + 1 : 1;

    // deactivate old version
    await termsModel.updateMany(
      { isActive: true },
      { isActive: false }
    );

    const terms = await termsModel.create({
      content,
      version: newVersion,
      createdBy: adminId,
    });

    res.status(201).json({
      success: true,
      message: "New Terms version created",
      data: terms,
    });
  } catch (error) {
    next(error);
  }
};


export const getLatestTerms = async (req, res, next) => {
  try {
    const terms = await termsModel.findOne({ isActive: true });

    res.json({
      success: true,
      data: terms,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllTermsVersions = async (req, res, next) => {
  try {
    const terms = await termsModel
      .find()
      .sort({ version: -1 });

    res.json({
      success: true,
      data: terms,
    });
  } catch (error) {
    next(error);
  }
};