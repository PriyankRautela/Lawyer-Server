import LegalCase from "../../models/LegalCase/legalCase.model.js";
import LawyerCase from "../../models/Lawyer/Case/lawyerCase.model.js";

export const createCase = async (req, res) => {
  try {
    const files = req.files ?? [];

    const documents = files.map((file) => ({
      url: file.path,
      name: file.filename,
      fileType: file.mimetype,
    }));

    const legalCase = await LegalCase.create({
      caseOwner: req.user?.id,
      firDetails: {
        firNumber: req.body?.firNumber,
        policeStation: req.body?.policeStation,
        district: req.body?.district,
        state: req.body?.state,
        firDate: req.body?.firDate,
        courtName: req.body?.courtName,
      },
      caseTitle: req.body?.caseTitle,
      caseDescription: req.body?.caseDescription,
      caseCategory: req.body?.caseCategory,
      urgencyLevel: req.body?.urgencyLevel,
      budgetRange: req.body?.budgetRange,
      documents,
    });

    res.status(201).json({
      success: true,
      message: "Case created successfully",
      data: legalCase,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getAllCases = async (req, res) => {
  try {
    const page = Number(req.query?.page) || 1;
    const limit = Number(req.query?.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query?.status) filter.status = req.query.status;
    if (req.query?.category) filter.caseCategory = req.query.category;

    const cases = await LegalCase.find(filter)
      .populate("caseOwner", "name email")
      .populate("assignedLawyer", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await LegalCase.countDocuments(filter);

    res.json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      data: cases,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getCaseById = async (req, res) => {
  try {
    const caseData = await LegalCase.findById(req.params.id)
      .populate("caseOwner", "name email contact")
      .populate("assignedLawyer", "name email");

    if (!caseData)
      return res.status(404).json({ message: "Case not found" });

    res.json({ success: true, data: caseData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCase = async (req, res) => {
  try {
    const updated = await LegalCase.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const assignLawyer = async (req, res) => {
  try {
    const { caseId, lawyerId } = req?.body||{};

    const legalCase = await LegalCase.findById(caseId);
    if (!legalCase)
      return res.status(404).json({ message: "Case not found" });

    // create assignment record
    await LawyerCase.create({
      lawyerId,
      caseId,
      assignedBy: req?.user?.id,
    });

    // update case quick reference
    legalCase.assignedLawyer = lawyerId;
    legalCase.assignedAt = new Date();
    legalCase.status = "Lawyer Assigned";
    await legalCase.save();

    res.json({ success: true, message: "Lawyer assigned successfully" });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: "Lawyer already assigned" });

    res.status(500).json({ success: false, message: err.message });
  }
};


export const getAssignedCasesByLawyer = async (req, res) => {
  try {
    const lawyerId = req.user?.id;

    if (!lawyerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const page = Number(req.query?.page) || 1;
    const limit = Number(req.query?.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { lawyerId };

    // optional filter → Assigned / Accepted / Rejected / Completed
    if (req.query?.status) {
      filter.assignmentStatus = req.query.status;
    }

    const assignments = await LawyerCase.find(filter)
      .populate({
        path: "caseId",
        populate: {
          path: "caseOwner",
          select: "name email contact",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await LawyerCase.countDocuments(filter);

    const cases = assignments.map((item) => item.caseId);

    res.json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      totalCases: total,
      data: cases,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getCasesOfUser = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const page = Number(req.query?.page) || 1;
    const limit = Number(req.query?.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { caseOwner: userId };

    // optional filters
    if (req.query?.status) filter.status = req.query.status;
    if (req.query?.category) filter.caseCategory = req.query.category;

    const cases = await LegalCase.find(filter)
      .populate("assignedLawyer", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await LegalCase.countDocuments(filter);

    res.json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      totalCases: total,
      data: cases,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};