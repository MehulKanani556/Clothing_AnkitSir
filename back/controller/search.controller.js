import SearchHistory from "../model/searchHistory.model.js";
import productModel from "../model/product.model.js";
import { sendSuccessResponse, sendBadRequestResponse } from "../utils/Response.utils.js";
import { ThrowError } from "../utils/Error.utils.js";

export const logSearch = async (req, res) => {
    try {
        const { query } = req.body;
        const userId = req.user ? req.user._id : null;

        if (!query) {
            return sendBadRequestResponse(res, "Search query is required");
        }

        const normalizedQuery = query.trim().toLowerCase();

        // Update or create search entry for this user/query combination
        // We use findOneAndUpdate to increment count if same user searches same thing
        // To keep recent history unique-ish
        await SearchHistory.findOneAndUpdate(
            { query: normalizedQuery, userId: userId },
            { $inc: { count: 1 } },
            { upsert: true, new: true }
        );

        return sendSuccessResponse(res, "Search logged successfully");
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

export const getPopularSearches = async (req, res) => {
    try {
        // Aggregate total counts across all users
        const popular = await SearchHistory.aggregate([
            {
                $group: {
                    _id: "$query",
                    totalCount: { $sum: "$count" }
                }
            },
            { $sort: { totalCount: -1 } },
            { $limit: 10 }
        ]);

        const result = popular.map(p => p._id);
        return sendSuccessResponse(res, "Popular searches fetched", result);
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

export const getRecentSearches = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : null;
        if (!userId) {
            return sendSuccessResponse(res, "No user logged in", []);
        }

        const recent = await SearchHistory.find({ userId })
            .sort({ updatedAt: -1 })
            .limit(5);

        const result = recent.map(r => r.query);
        return sendSuccessResponse(res, "Recent searches fetched", result);
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

export const getTrendingProducts = async (req, res) => {
    try {
        // Fetch featured products as trending
        const trending = await productModel.find({ isFeatured: true, isActive: true })
            .populate("variants")
            .limit(4);

        return sendSuccessResponse(res, "Trending products fetched", trending);
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};
