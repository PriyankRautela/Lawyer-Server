import bcrypt from "bcrypt";
import lawyerModel from "../../../models/Lawyer/auth/auth.model.js";
import pendingUserModel from "../../../models/User/auth/pendingUser.model.js";
import otpModel from "../../../models/Comman/Otp/otp.model.js";
import Email from "../../../util/email/email.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
} from "../../../util/errorHandler/customError.js";
import {
  createAccessToken,
  createRefreshToken,
} from "../../../helpers/Token/token.js";

const lawyerRegister = async (req, res, next) => {
  try {
    let { email } = req.body || {};
    email = email?.trim().toLowerCase();

    if (!email) throw new ValidationError("Email is required");

    const exists = await lawyerModel.findOne({ email });
    if (exists) throw new ConflictError("Lawyer already exists");

    await pendingUserModel.deleteMany({ email });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    const pendingLawyer = await pendingUserModel.create({
      email,
      otp: hashedOtp,
    });

    const emailService = new Email(pendingLawyer);
    await emailService.sendOtp(otp);

    res.status(201).json({
      success: true,
      message: "OTP sent to lawyer email",
      email,
    });
  } catch (err) {
    next(err);
  }
};

const verifyLawyerOtp = async (req, res, next) => {
  try {
    let { email, otp, password, contact,name } = req.body || {};
    email = email?.trim().toLowerCase();

    const pendingLawyer = await pendingUserModel.findOne({
      email,
      isUsed: false,
    });

    if (!pendingLawyer) {
      throw new BadRequestError("Invalid or expired OTP");
    }

    const isMatch = await bcrypt.compare(otp, pendingLawyer.otp);
    if (!isMatch) throw new BadRequestError("Invalid OTP");

    pendingLawyer.isUsed = true;
    pendingLawyer.isVerified = true;
    await pendingLawyer.save();

     const hashedPassword = await bcrypt.hash(password, 10);

    const lawyer = await lawyerModel.create({
      email,
      isVerified: true,
      password:hashedPassword,
      contact,
      name
    });
    const refreshToken = createRefreshToken(lawyer._id);
    lawyer.refreshToken = refreshToken;
    await lawyer.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    lawyer = lawyer.toObject();
    delete lawyer?.password;
    delete lawyer?.image

    const accessToken = createAccessToken(lawyer);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });
    delete lawyer._id;
   

    const emailService = new Email(lawyer);
    emailService.sendWelcome();

     res.status(200).json({
      success: true,
      message: "Lawyer registration completed",
      lawyer,
    });
  } catch (err) {
    next(err);
  }
};


const lawyerLogin = async (req, res, next) => {
  try {
    let { email, password } = req.body || {};
    email = email?.trim().toLowerCase();

    let lawyer = await lawyerModel.findOne({ email }).select("+password");
    if (!lawyer) throw new NotFoundError("Lawyer not found");

    const isMatch = await bcrypt.compare(password, lawyer.password);
    if (!isMatch) throw new ValidationError("Invalid credentials");

    const refreshToken = createRefreshToken(lawyer._id);
    lawyer.refreshToken = refreshToken;
    await lawyer.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    lawyer = lawyer.toObject();
    delete lawyer.password;

    const accessToken = createAccessToken(lawyer);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    delete lawyer._id;

    res.status(200).json({
      success: true,
      message: "Lawyer logged in successfully",
      lawyer,
    });
  } catch (err) {
    next(err);
  }
};

const forgotLawyerPassword = async (req, res, next) => {
  try {
    const { email } = req.body || {};

    const lawyer = await lawyerModel.findOne({ email });
    if (!lawyer) throw new NotFoundError("Lawyer not found");

    await otpModel.deleteMany({ userId: lawyer._id });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await otpModel.create({
      userId: lawyer._id,
      otp: hashedOtp,
    });

    const emailService = new Email(lawyer);
    await emailService.sendPasswordReset(otp);

    res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    next(err);
  }
};

const resetLawyerPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const lawyer = await lawyerModel.findOne({ email });

    if (!lawyer) throw new NotFoundError("Lawyer not found");

    const hashedPassword = await bcrypt.hash(password, 10);
    lawyer.password = hashedPassword;
    await lawyer.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    next(err);
  }
};

const logoutLawyer = async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.status(200).json({
    success: true,
    message: "Lawyer logged out successfully",
  });
};

const deleteLawyerAccount = async (req, res, next) => {
  try {
    const lawyerId = req.user?.id;
    if (!lawyerId) throw new UnauthorizedError("Unauthorized");

    await lawyerModel.findByIdAndDelete(lawyerId);

    res.status(200).json({
      success: true,
      message: "Lawyer account deleted",
    });
  } catch (err) {
    next(err);
  }
};

export {
  lawyerRegister,
  verifyLawyerOtp,
  lawyerLogin,
  forgotLawyerPassword,
  resetLawyerPassword,
  logoutLawyer,
  deleteLawyerAccount,
};
