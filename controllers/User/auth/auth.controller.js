import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import userModel from "../../../models/User/auth/auth.model.js";
import Email from "../../../util/email/email.js";
import pendingUserModel from "../../../models/User/auth/pendingUser.model.js";
import { oauth2client } from "../../../config/OAuth/OAuthConfig.js";
import axios from "axios";
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError, ValidationError } from "../../../util/errorHandler/customError.js";
import { createAccessToken, createRefreshToken} from "../../../helpers/Token/token.js";
import blockUserModel from "../../../models/User/auth/blockUser.model.js";
import otpModel from '../../../models/Comman/Otp/otp.model.js';


//USER REGISTRATION
const userRegister = async (req, res, next) => {
  try {
    const { email  } = req?.body || {};

    const normalizedEmail = email?.trim().toLowerCase();

    const isBlocked = await blockUserModel.findOne({email:normalizedEmail});
    if(isBlocked){
      throw new BadRequestError("This email is blocked by admin")
    }

    const isMatch= await userModel.findOne({email:normalizedEmail});
    if(isMatch){
      throw new ConflictError("User already exist")
    }

    // Remove old OTPs
    await pendingUserModel.deleteMany({ email: normalizedEmail });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const pendingUser = await pendingUserModel.create({
      email: normalizedEmail,
      otp: hashedOtp,
    });
    const result = { email: pendingUser?.email };

    const emailP = new Email(pendingUser);
    await emailP?.sendOtp(otp);

    res.status(201).json({
      success: true,
      pendingUser: result,
      message: "User registered, OTP sent for verification",
    });
  } catch (error) {
    next(error)
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    let { email, otp, password, fullName, contact } = req.body || {};

    email = email?.trim().toLowerCase();
    otp = otp?.toString();

    if (password.length < 8) {
      throw new ValidationError("Password must be at least 8 characters");
    }

    const pendingUser = await pendingUserModel.findOne({
      email,
      isUsed: false,
    });

    if (!pendingUser) {
      throw new BadRequestError("Invalid or expired OTP");
    }

    const isMatch = await bcrypt.compare(otp, pendingUser.otp);
    if (!isMatch) {
      throw new BadRequestError("Invalid OTP");
    }

    if (pendingUser.isVerified) {
      throw new ConflictError("User already verified");
    }

    pendingUser.isUsed = true;
    pendingUser.isVerified = true;
    await pendingUser.save();

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      email,
      name: fullName.trim(),
      password: hashedPassword,
      contact,
      isVerified: true,
    });

    const refreshToken = createRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const safeUser = user.toObject();
    delete safeUser.password;
    delete safeUser.__v;
    delete safeUser.updatedAt;
    delete safeUser.createdAt;

    const accessToken = createAccessToken(safeUser);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    const emailP = new Email(user);
    emailP.sendWelcome();

    delete safeUser._id;

    return res.status(200).json({
      success: true,
      message: "Registration is complete",
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};


//  USER LOGIN
const userLogin = async (req, res, next) => {
  let { email, password } = req?.body || {};
  email = email = email?.trim().toLowerCase();
  try {
    let user = await userModel.findOne({ email }).select("+password");

    if (!user) {
     throw new NotFoundError("No user with this email")
    }
    const isMatch = await bcrypt.compare(password, user?.password);

    if (!isMatch) {
      throw new ValidationError("Wrong password or email")
    }

    const refreshToken = createRefreshToken(user?._id);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    user.refreshToken = refreshToken;
    user.save();
    user = user.toObject();
    delete user?.password;
    delete user?.__v;
    delete user?.updatedAt;
    delete user?.createdAt;
    delete user?.createdBy;
    delete user?.updatedBy;
    const accessToken = createAccessToken(user);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });
    delete user?._id;

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user,
    });
  } catch (error) {
    next(error)
  }
};

const logoutUser = async (req, res, next) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
    });

    return res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    next(error)
  }
};


const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body || {};

    const user = await userModel.findOne({ email });

    if (!user) {
      throw new NotFoundError("No account found ")
    }

    await otpModel.deleteMany({
      $or: [{ userId: user._id }],
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    const EmailService = new Email(user);
    await EmailService.sendPasswordReset(otp);

    await otpModel.create({
      otp: hashedOtp,
      userId:user?._id
    });

    return res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    next(error)
  }
}; 


const verifyForgotOtp = async (req, res, next) => {
  try {
    const { email, otp } = req?.body || {};

    const user = await userModel.findOne({ email });

    if (!user) {
      throw new BadRequestError("Invalid email")
    }

    const otpRecord = await otpModel.findOne({
      $or: [{ userId: user?._id }],
      isUsed: false,
    });
    if (!otpRecord) {
      throw new BadRequestError("OTP expired")
    }

    const isMatch = await bcrypt.compare(otp, otpRecord?.otp);
    if (!isMatch) {
      throw new BadRequestError("Invalid OTP")
    }

    otpRecord.isUsed = true;
    await otpRecord.save();

    return res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    next(error)
  }
};

const addNewPassword = async (req, res, next) => {
  try {
    let { email, password } = req?.body || {};

    if (!email || !password) {
      throw new BadRequestError("Please enter the credentials")
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let user = await userModel.findOneAndUpdate(
      { email },
      {
        password: hashedPassword,
      },
      { new: true }
    );

    if (!user) {
      throw new NotFoundError("User not found")
    }

    const refreshToken = createRefreshToken(user?._id);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    user.updatedBy = user?._id;
    user.refreshToken = refreshToken;

    user.save();

    user = user.toObject();
    delete user?.password;
    delete user?.__v;
    delete user?.updatedAt;
    delete user?.createdAt;
    delete user?.createdBy;
    delete user?.updatedBy;

    const accessToken = createAccessToken(user);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    delete user?._id;

    return res.status(200).json({
      success: true,
      user,
      message: "Password updated",
    });
  } catch (error) {
    next(error)
  }
};

// GOOGLE AUTHENTICATION
const googleLogin = async (req, res, next) => {
  try {
    const  code  = req?.body?.code;
    const googleRes = await oauth2client?.getToken(code);
    oauth2client.setCredentials(googleRes?.tokens)
    
    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes?.tokens?.access_token}`
    );
   
    const { email, name, picture } = userRes?.data;

    const isBlocked = await blockUserModel.findOne({email:email})
    if(isBlocked){
      throw new BadRequestError("This email is blocked by admin")
    }
    let user = await userModel.findOne({ email });
    
    if (!user) {
      user = await userModel.create({ email, 
        
        name, image: picture});
    }
    const refreshToken = createRefreshToken(user?._id);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    user.refreshToken = refreshToken;
  
    user.save();

    user = user.toObject();
    delete user?.__v;
    delete user?.updatedAt;
    delete user?.createdAt;
    delete user?.createdBy;
    delete user?.updatedBy;
    delete user?.password;
    const accessToken = createAccessToken(user);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });
    delete user?._id;
    res.status(200).json({success:true,message:"Login Successfully",user})
  } catch (error) {
    next(error)
  }
};

// REFRESH TOKEN
const refreshAccessToken = async (req, res, next) => {
  try {
    const userId= req?.user?.id||req?.user?._id;
    let token =
      req?.cookies?.refreshToken ||
      req?.query?.refreshToken ||
      req?.body?.refreshToken ||
      {};

    if (!token) {
      const user = await userModel.findById(userId).select("+refreshToken");
      token = user?.refreshToken;
    }

    jwt.verify(token, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .json({ success: false, message: "Invalid refresh token" });
      }
      const userId = decoded?.id;
      const user = await userModel.findById( userId ).lean();

      delete user?.password;
      delete user?.__v;
      delete user?.updatedAt;
      delete user?.createdAt;
      delete user?.createdBy;
      delete user?.updatedBy;
      delete user?.joiningDate;

      const accessToken = createAccessToken(user);
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json({ success: true, message: "Access token created" });
    });
  } catch (error) {
   next(error)
  }
};
const deleteMyAccount = async(req,res)=>{
  try {
      const userId = req?.user?.id || req?.user?._id;
      if(!userId){
            throw new UnauthorizedError("User id not found")
      }
      await userModel.findByIdAndDelete(userId);
      res.status(200).json({success:true,message:"User deleted"});
  } catch (error) {
    next(error)
  }
}

export {
  userRegister,
  verifyOtp,
  userLogin,
  logoutUser,
  refreshAccessToken,
  forgotPassword,
  verifyForgotOtp,
  addNewPassword,
  googleLogin,
  deleteMyAccount
};
