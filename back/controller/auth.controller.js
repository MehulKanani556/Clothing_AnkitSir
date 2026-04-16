import { config } from 'dotenv'; config()
import UserModel from "../model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import transporter from '../utils/Email.config.js'
import { sendErrorResponse, sendNotFoundResponse, sendSuccessResponse } from '../utils/Response.utils.js';

export class AuthController {
  static JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
  static REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "your_refresh_token_secret";
  static otpMap = new Map(); // For temporary registration data

  // Helper to generate tokens
  static generateTokens(user) {
    const payload = {
      id: user._id,
      mobileNo: user.mobileNo,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, AuthController.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: user._id }, AuthController.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

    return { accessToken, refreshToken };
  }

  // 1. Send OTP (For both Login & Register)
  static async sendOtp(req, res) {
    try {
      const { mobileNo, role } = req.body;

      if (!mobileNo || !/^[0-9]{10}$/.test(mobileNo)) {
        return res.status(400).json({
          success: false,
          message: "A valid 10-digit mobile number is required!"
        });
      }

      const otp = Math.floor(1000 + Math.random() * 8000);
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Check if user exists
      const existingUser = await UserModel.findOne({ mobileNo });

      if (existingUser) {
        // LOGIN FLOW: Save OTP to existing user
        existingUser.otp = otp;
        existingUser.resetOtpExpiry = otpExpiry;
        await existingUser.save();
      } else {
        // REGISTER FLOW: Store in Map instead of DB
        AuthController.otpMap.set(mobileNo, {
          otp,
          expiry: otpExpiry,
          role: role || "user" // Default role is user
        });
      }

      // In a real app, send OTP via SMS service here
      console.log(`OTP for ${mobileNo}: ${otp}`);

      return res.status(200).json({
        success: true,
        message: "OTP sent successfully!",
        existingUser,
        otp: otp // Returning OTP for development convenience
      });

    } catch (error) {
      console.error("Send OTP Error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error sending OTP",
        error: error.message
      });
    }
  }

  // 2. Verify OTP & Login/Register
  static async verifyOtp(req, res) {
    try {
      const { mobileNo, otp } = req.body;

      if (!mobileNo || !otp) {
        return res.status(400).json({
          success: false,
          message: "Mobile number and OTP are required!"
        });
      }

      let user = await UserModel.findOne({ mobileNo });

      if (user) {
        // --- LOGIN VERIFICATION ---
        if (user.otp !== Number(otp) || new Date() > user.resetOtpExpiry) {
          return res.status(400).json({
            success: false,
            message: "Invalid or expired OTP!"
          });
        }
        // Clear OTP
        user.otp = null;
        user.resetOtpExpiry = null;
        user.verified = true;
      } else {
        // --- REGISTRATION VERIFICATION ---
        const tempData = AuthController.otpMap.get(mobileNo);

        if (!tempData || tempData.otp !== Number(otp) || new Date() > tempData.expiry) {
          return res.status(400).json({
            success: false,
            message: "Invalid or expired OTP!"
          });
        }

        // OTP Valid - Now Save User to DB
        user = await UserModel.create({
          mobileNo,
          role: tempData.role,
          verified: true
        });

        // Clear Map
        AuthController.otpMap.delete(mobileNo);
      }

      const { accessToken, refreshToken } = AuthController.generateTokens(user);

      // Save refresh token in DB
      user.refreshToken = refreshToken;
      await user.save();

      // Set Tokens in Cookies
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return res.status(200).json({
        success: true,
        message: user.isNew ? "Registered and logged in successfully" : "Logged in successfully",
        user,
        accessToken,
        refreshToken
      });

    } catch (error) {
      console.error("Verify OTP Error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error verifying OTP",
        error: error.message
      });
    }
  }

  // 3. Refresh Access Token
  static async refreshAccessToken(req, res) {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: "Refresh token is required!"
        });
      }

      // Verify refresh token
      let decoded;
      try {
        decoded = jwt.verify(refreshToken, AuthController.REFRESH_TOKEN_SECRET);
      } catch (err) {
        return res.status(403).json({
          success: false,
          message: "Invalid or expired refresh token!"
        });
      }

      const user = await UserModel.findById(decoded.id);

      if (!user) {
        return res.status(403).json({
          success: false,
          message: "User not found!"
        });
      }

      const tokens = AuthController.generateTokens(user);

      // Update refresh token in DB
      user.refreshToken = tokens.refreshToken;
      await user.save();

      // Set New Tokens in Cookies
      res.cookie("accessToken", tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000
      });

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.status(200).json({
        success: true,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      });

    } catch (error) {
      console.error("Refresh Token Error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error refreshing token",
        error: error.message
      });
    }
  }

  static async getUser(req, res) {
    try {
      const id = req.user._id;

      const user = await UserModel.findById(id).select("-refreshToken -otp -resetOtpExpiry -password");
      if (!user) {
        return sendNotFoundResponse(res, "User not found");
      }

      return sendSuccessResponse(res, "User fetched successfully...", user);

    } catch (error) {
      console.error("Get User Error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error Fetching user Data",
        error: error.message
      });
    }
  }

  static async updateFcmToken(req, res) {
    try {
      const userId = req.user._id;
      const { fcmToken } = req.body;

      if (!fcmToken) {
        return res.status(400).json({
          success: false,
          message: "fcmToken is required!"
        });
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found!"
        });
      }

      user.fcmToken = fcmToken;
      await user.save();

      return res.status(200).json({
        success: true,
        message: "FCM Token updated successfully"
      });
    } catch (error) {
      console.error("Update FCM Token Error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error updating FCM Token",
        error: error.message
      });
    }
  }
}