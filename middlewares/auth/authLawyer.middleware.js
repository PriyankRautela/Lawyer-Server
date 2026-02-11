import jwt from "jsonwebtoken";
import {
  UnauthorizedError,
  ForbiddenError,
} from "../../util/errorHandler/customError.js";
import lawyerModel from "../../models/Lawyer/auth/auth.model.js";

const authLawyer = async (req, res, next) => {
  try {
    const authHeader =
      req.headers["authorization"] || req.cookies?.accessToken;

    // No token
    if (!authHeader) {
      throw new UnauthorizedError("No token provided");
    }

    // Extract token (Bearer or raw)
    const token =
      authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

    if (!token) {
      throw new UnauthorizedError("Token missing");
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const lawyerId = decoded?.id?._id || decoded?._id;
    if (!lawyerId) {
      throw new ForbiddenError("Invalid or malformed token");
    }

    // Fetch admin
    const lawyer = await lawyerModel.findById(lawyerId);
    if (!lawyer) {
      throw new UnauthorizedError("Admin not found");
    }

    // Attach admin info
    req.user = {
      id: lawyer._id}

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(
        new UnauthorizedError("Session expired. Please login again.")
      );
    }

    if (error.name === "JsonWebTokenError") {
      return next(
        new UnauthorizedError("Invalid token. Authentication failed.")
      );
    }

    next(error);
  }
};

export default authLawyer;
