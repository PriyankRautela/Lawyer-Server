import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import adminModel from "../../../models/Admin/auth/auth.model.js"
import pendingUserModel from "../../../models/User/auth/pendingUser.model.js";
import otpModel from "../../../models/Comman/Otp/otp.model.js";
import Email from "../../../util/email/email.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../../util/errorHandler/customError.js";
import {
  createAccessToken,
  createRefreshToken,
} from "../../../helpers/Token/token.js";

const adminRegister = async (req, res, next) => {
  try {
    let { email } = req.body || {};
    email = email?.trim().toLowerCase();

    if (!email) throw new ValidationError("Email is required");

    const exists = await adminModel.findOne({ email });
    if (exists) throw new ConflictError("Admin already exists");

    await pendingUserModel.deleteMany({ email });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    const pendingAdmin = await pendingUserModel.create({
      email,
      otp: hashedOtp,
    });

    const emailService = new Email(pendingAdmin);
    await emailService.sendOtp(otp);

    res.status(201).json({
      success: true,
      message: "OTP sent to admin email",
      email,
    });
  } catch (error) {
    next(error);
  }
};

const verifyAdminOtp = async (req, res, next) => {
  try {
    let { email, otp, password, name } = req?.body || {};
    email = email?.trim().toLowerCase();

    const pendingAdmin = await pendingUserModel.findOne({
      email,
      isUsed: false,
    });

    if (!pendingAdmin) {
      throw new BadRequestError("Invalid or expired OTP");
    }

    const isMatch = await bcrypt.compare(otp, pendingAdmin.otp);
    if (!isMatch) throw new BadRequestError("Invalid OTP");

    pendingAdmin.isUsed = true;
    pendingAdmin.isVerified = true;
    await pendingAdmin.save();
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await adminModel.create({
      email,
      isVerified: true,
      password:hashedPassword,
      name
    });

    const refreshToken = createRefreshToken(admin._id);
    admin.refreshToken = refreshToken;
    await admin.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    admin = admin.toObject();
    delete admin?.password;

    const accessToken = createAccessToken(admin);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    delete admin?._id;

    const emailService = new Email(admin);
    emailService.sendWelcome();

    res.status(200).json({
      success: true,
      message: "Admin registration completed",
      admin,
    });
  } catch (error) {
    next(error);
  }
};


const adminLogin = async (req, res, next) => {
  try {
    let { email, password } = req.body || {};
    email = email?.trim().toLowerCase();

    let admin = await adminModel.findOne({ email }).select("+password");
    if (!admin) throw new NotFoundError("Admin not found");

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new ValidationError("Invalid credentials");

    const refreshToken = createRefreshToken(admin._id);
    admin.refreshToken = refreshToken;
    await admin.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    admin = admin.toObject();
    delete admin.password;

    const accessToken = createAccessToken(admin);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    delete admin._id;

    res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      admin,
    });
  } catch (error) {
    next(error);
  }
};

const logoutAdmin = async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.status(200).json({
    success: true,
    message: "Admin logged out successfully",
  });
};

const forgotAdminPassword = async (req, res, next) => {
  try {
    const { email } = req.body || {};

    const admin = await adminModel.findOne({ email });
    if (!admin) throw new NotFoundError("Admin not found");

    await otpModel.deleteMany({ userId: admin._id });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await otpModel.create({
      userId: admin._id,
      otp: hashedOtp,
    });

    const emailService = new Email(admin);
    await emailService.sendPasswordReset(otp);

    res.status(200).json({
      success: true,
      message: "OTP sent to admin email",
    });
  } catch (error) {
    next(error);
  }
};

const resetAdminPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    const admin = await adminModel.findOne({ email });
    if (!admin) throw new NotFoundError("Admin not found");

    const hashedPassword = await bcrypt.hash(password, 10);
    admin.password = hashedPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};


const refreshAdminAccessToken = async (req, res, next) => {
  try {
    let token =
      req.cookies?.refreshToken ||
      req.body?.refreshToken ||
      req.query?.refreshToken;

    if (!token) throw new UnauthorizedError("Refresh token missing");

    jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {
        if (err) {
          return res
            .status(403)
            .json({ success: false, message: "Invalid refresh token" });
        }

        const admin = await adminModel.findById(decoded.id).lean();
        if (!admin) throw new UnauthorizedError("Admin not found");

        delete admin.password;
        delete admin.__v;

        const accessToken = createAccessToken(admin);
        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          sameSite: "lax",
          maxAge: 24 * 60 * 60 * 1000,
        });

        res.json({ success: true, message: "Access token refreshed" });
      }
    );
  } catch (error) {
    next(error);
  }
};


const deleteAdminAccount = async (req, res, next) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) throw new UnauthorizedError("Unauthorized");

    await adminModel.findByIdAndDelete(adminId);

    res.status(200).json({
      success: true,
      message: "Admin account deleted",
    });
  } catch (error) {
    next(error);
  }
};

export {
  adminRegister,
  verifyAdminOtp,
  adminLogin,
  logoutAdmin,
  forgotAdminPassword,
  resetAdminPassword,
  refreshAdminAccessToken,
  deleteAdminAccount,
};
