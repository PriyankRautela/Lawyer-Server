import lawyerModel from "../../../models/Lawyer/auth/auth.model.js";
import { ValidationError } from "../../../util/errorHandler/customError.js";

const getVerifiedLawyers = async (req, res, next) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if (page < 1 || limit < 1) {
      throw new ValidationError("Invalid pagination parameters");
    }

    const skip = (page - 1) * limit;

    const query = {
      kycVerified: true,
      isVerified: true,
    };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    const [lawyers, total] = await Promise.all([
      lawyerModel
        .find(query)
        .select("-password -__v -createdBy -updateBy")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      lawyerModel.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      lawyers,
    });
  } catch (error) {
    next(error);
  }
};

export { getVerifiedLawyers };
