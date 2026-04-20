import { config } from 'dotenv'; config()
import UserModel from "../model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import transporter from '../utils/Email.config.js'
import { UAParser } from 'ua-parser-js';
import requestIp from 'request-ip';
import { sendErrorResponse, sendNotFoundResponse, sendSuccessResponse } from '../utils/Response.utils.js';
import { sendSessionRevoked, sendLogoutAllDevices, sendRealTimeNotification, sendNewLoginAlert } from '../utils/socket.js';
import NotificationModel from '../model/notification.model.js';

export class AuthController {
  static JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
  static REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "your_refresh_token_secret";
  static otpMap = new Map(); // For temporary registration data

  // Helper to generate tokens
  static generateTokens(user, tokenHash = null) {
    const payload = {
      id: user._id,
      mobileNo: user.mobileNo,
      role: user.role,
      tokenHash: tokenHash || (user.refreshToken ? user.refreshToken.slice(-10) : null)
    };

    const accessToken = jwt.sign(payload, AuthController.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: user._id, tokenHash: payload.tokenHash }, AuthController.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

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
        if (existingUser.isUserDeleted) {
          return res.status(403).json({
            success: false,
            message: "Account is deleted. Please contact support to reactivate."
          });
        }
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
        if (user.isUserDeleted) {
          return res.status(403).json({
            success: false,
            message: "Account is deleted. Please contact support to reactivate."
          });
        }
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

      // Link session to token
      const sessionHash = Math.random().toString(36).substring(2, 12);
      const { accessToken, refreshToken } = AuthController.generateTokens(user, sessionHash);
 
       // --- Record Session ---
       const parser = new UAParser(req.headers['user-agent']);
       const ua = parser.getResult();
       const clientIp = requestIp.getClientIp(req);
 
       const newSession = {
         browser: ua.browser.name || 'Unknown',
         os: ua.os.name || 'Unknown',
         deviceType: ua.device.type || 'Web',
         ip: clientIp || 'Unknown',
         lastActive: new Date(),
         tokenHash: sessionHash
       };
 
       // Check if there are other active sessions before adding the new one
       const existingSessionsCount = (user.sessions || []).length;

       // Keep only last 5 sessions
       user.sessions = [newSession, ...(user.sessions || [])].slice(0, 5);
       user.refreshToken = refreshToken;
       await user.save();

       // If there were existing sessions, notify them about the new login
       if (existingSessionsCount > 0) {
        sendNewLoginAlert(user._id.toString(), {
          browser: newSession.browser,
          os: newSession.os,
          ip: newSession.ip,
          time: newSession.lastActive
        });
       }

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

      const tokens = AuthController.generateTokens(user, decoded.tokenHash);

      // Update refresh token in DB
      user.refreshToken = tokens.refreshToken;
      // Also update the tokenHash for the current session in sessions array if needed, 
      // but keeping it the same links it to the same logical session.
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

  // --- Session Management ---
  static async getSessions(req, res) {
    try {
      console.log('getSessions - req.user._id:', req.user._id);
      console.log('getSessions - req.user.tokenHash:', req.user.tokenHash);
      
      const user = await UserModel.findById(req.user._id).select('sessions refreshToken');
      if (!user) return sendNotFoundResponse(res, "User not found");

      // Get current token hash from the request
      const currentTokenHash = req.user.tokenHash;
      console.log('getSessions - currentTokenHash:', currentTokenHash);
      console.log('getSessions - user.sessions count:', user.sessions.length);

      const sessions = user.sessions.map(s => ({
        ...s.toObject(),
        isCurrent: s.tokenHash === currentTokenHash
      }));

      return sendSuccessResponse(res, "Sessions fetched successfully", sessions);
    } catch (error) {
      console.error('getSessions error:', error);
      return sendErrorResponse(res, 500, "Error fetching sessions", error.message);
    }
  }

  static async revokeSession(req, res) {
    try {
      const { sessionId } = req.params;
      console.log('revokeSession - sessionId:', sessionId);
      console.log('revokeSession - req.user._id:', req.user._id);
      console.log('revokeSession - req.user.tokenHash:', req.user.tokenHash);
      
      const user = await UserModel.findById(req.user._id);
      if (!user) return sendNotFoundResponse(res, "User not found");

      console.log('revokeSession - user.sessions before:', user.sessions.map(s => ({ _id: s._id.toString(), tokenHash: s.tokenHash })));

      // Find the session to revoke
      const sessionToRevoke = user.sessions.find(s => s._id.toString() === sessionId);
      console.log('revokeSession - sessionToRevoke:', sessionToRevoke ? { _id: sessionToRevoke._id.toString(), tokenHash: sessionToRevoke.tokenHash } : null);
      
      if (!sessionToRevoke) {
        return sendErrorResponse(res, 404, "Session not found");
      }

      // Prevent revoking current session
      if (sessionToRevoke.tokenHash === req.user.tokenHash) {
        return sendErrorResponse(res, 400, "Cannot revoke current session. Use logout instead.");
      }

    

      // Emit socket event to notify the revoked device
      sendSessionRevoked(user._id.toString(), sessionToRevoke.tokenHash);
      
      // Also send real-time notification to all OTHER active devices of the user
      // sendRealTimeNotification(user._id.toString(), notification);
        // Remove the session
      user.sessions = user.sessions.filter(s => s._id.toString() !== sessionId);
      await user.save();

      console.log('revokeSession - user.sessions after:', user.sessions.map(s => ({ _id: s._id.toString(), tokenHash: s.tokenHash })));
      console.log('revokeSession - Session revoked successfully');
      
      // Create a persistent notification for the user
      const notification = await NotificationModel.create({
        user: user._id,
        title: "Account Security Alert",
        message: `A session on ${sessionToRevoke.os || 'a device'} (${sessionToRevoke.browser || 'Unknown browser'}) has been revoked.`,
        type: "Account"
      });
      
      return sendSuccessResponse(res, "Session revoked successfully");
    } catch (error) {
      console.error('revokeSession error:', error);
      return sendErrorResponse(res, 500, "Error revoking session", error.message);
    }
  }

  static async logoutAllDevices(req, res) {
    try {
      const user = await UserModel.findById(req.user._id);
      if (!user) return sendNotFoundResponse(res, "User not found");

      user.sessions = [];
      user.refreshToken = null;
      await user.save();

      // Emit socket event to logout all devices
      sendLogoutAllDevices(user._id.toString());

      // Create a persistent notification
      await NotificationModel.create({
        user: user._id,
        title: "Security Update",
        message: "You have been logged out from all active devices.",
        type: "Account"
      });

      return sendSuccessResponse(res, "Logged out from all devices");
    } catch (error) {
      return sendErrorResponse(res, 500, "Error logging out from all devices", error.message);
    }
  }

  static async logout(req, res) {
    try {
      const user = await UserModel.findById(req.user._id);
      if (user) {
        // Remove current session
        user.sessions = user.sessions.filter(s => s.tokenHash !== req.user.tokenHash);
        await user.save();
      }

      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      // Notify other tabs/windows of the same session to logout
      if (req.user && req.user._id && req.user.tokenHash) {
        sendSessionRevoked(req.user._id.toString(), req.user.tokenHash);
      }

      return sendSuccessResponse(res, "Logged out successfully");
    } catch (error) {
      return sendErrorResponse(res, 500, "Error logging out", error.message);
    }
  }
}