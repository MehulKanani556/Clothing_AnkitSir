import jwt from "jsonwebtoken";
import UserModel from "../model/user.model.js";
import { sendErrorResponse, sendForbiddenResponse, sendUnauthorizedResponse, sendNotFoundResponse } from '../utils/Response.utils.js';
import { config } from 'dotenv';
config();

export const UserAuth = async (req, res, next) => {
    try {
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not configured');
            return sendErrorResponse(res, 500, 'Server configuration error');
        }

        const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.accessToken || req.query.token;

        if (!token) {
            return sendUnauthorizedResponse(res, "Access denied. No token provided.");
        }

        try {
            const decodedObj = jwt.verify(token, process.env.JWT_SECRET);
            const { id } = decodedObj;

            const user = await UserModel.findById(id);
            if (!user) {
                return sendNotFoundResponse(res, "User not found");
            }

            req.user = user;
            next();
        } catch (err) {
            console.error('Token verification error:', err);
            return sendUnauthorizedResponse(res, "Invalid token.");
        }
    } catch (error) {
        return sendErrorResponse(res, 500, error.message);
    }
};

export const authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return async (req, res, next) => {
        try {
            if (!req.user) {
                return sendUnauthorizedResponse(res, "Authentication required");
            }

            if (roles.length && !roles.includes(req.user.role)) {
                return sendForbiddenResponse(res, `Access denied. ${roles.join(' or ')} role required.`);
            }

            next();
        } catch (error) {
            return sendErrorResponse(res, 500, error.message);
        }
    };
};

export const adminAuth = authorize('admin');
export const sellerAuth = authorize('seller');
export const sellerAndAdminAuth = authorize(['seller', 'admin']);

export const isAdmin = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== "admin") {
            return sendForbiddenResponse(res, "Access denied. Admin privileges required.");
        }
        next();
    } catch (error) {
        return sendErrorResponse(res, 500, error.message);
    }
};

export const isSeller = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== "seller") {
            return sendForbiddenResponse(res, "Access denied. Seller privileges required.");
        }
        next();
    } catch (error) {
        return sendErrorResponse(res, 500, error.message);
    }
};

export const isUser = async (req, res, next) => {
    try {
        if (!req.user) {
            return sendUnauthorizedResponse(res, "Authentication required");
        }
        next();
    } catch (error) {
        return sendErrorResponse(res, 500, error.message);
    }
};