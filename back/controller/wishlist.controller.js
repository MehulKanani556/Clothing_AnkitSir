import mongoose from "mongoose";
import wishlistModel from "../model/wishlist.model.js";
import { sendBadRequestResponse, sendNotFoundResponse, sendSuccessResponse, sendErrorResponse } from "../utils/Response.utils.js";
import productModel from "../model/product.model.js";
import ProductVariant from "../model/productVariant.model.js";

export const toggleWishlist = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const { productId, productVariantId } = req.body;

        if (!productId) {
            return sendBadRequestResponse(res, "Product ID is required!");
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return sendBadRequestResponse(res, "Product ID is InValid!");
        }

        if (productVariantId && !mongoose.Types.ObjectId.isValid(productVariantId)) {
            return sendBadRequestResponse(res, "Product Variant ID is InValid!");
        }

        // Database Validation: Check if product exists
        const productExists = await productModel.findById(productId);
        if (!productExists) {
            return sendNotFoundResponse(res, "Product not found in database!");
        }

        // Database Validation: Check if variant exists and belongs to product
        if (productVariantId) {
            const variantExists = await ProductVariant.findOne({ 
                _id: productVariantId, 
                productId: productId 
            });
            if (!variantExists) {
                return sendNotFoundResponse(res, "Product variant not found or does not belong to this product!");
            }
        }

        // Find existing wishlist for this user
        let wishlist = await wishlistModel.findOne({ userId });

        if (!wishlist) {
            // If no wishlist exists, create a new one with the item
            wishlist = await wishlistModel.create({
                userId,
                items: [{ productId, productVariantId: productVariantId || null }]
            });
            return sendSuccessResponse(res, "Product added to wishlist", {
                isWishlisted: true,
                wishlistCount: 1,
                wishlist
            });
        }

        // Check if product (with same variant if provided) is already in wishlist
        const existingItemIndex = wishlist.items.findIndex(item =>
            item.productId.toString() === productId.toString() &&
            (productVariantId ? (item.productVariantId?.toString() === productVariantId.toString()) : true)
        );

        let isWishlisted = false;
        if (existingItemIndex !== -1) {
            // Remove item (Toggle OFF)
            wishlist.items.splice(existingItemIndex, 1);
            isWishlisted = false;
        } else {
            // Add item (Toggle ON)
            wishlist.items.push({ productId, productVariantId: productVariantId || null });
            isWishlisted = true;
        }

        await wishlist.save();

        return sendSuccessResponse(res,
            isWishlisted ? "Product added to wishlist" : "Product removed from wishlist",
            {
                isWishlisted,
                wishlistCount: wishlist.items.length,
                wishlist
            }
        );

    } catch (error) {
        console.error("Toggle Wishlist Error:", error.message);
        return sendErrorResponse(res, 500, "Error toggling wishlist", error.message);
    }
};

export const getWishlist = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;

        if (!userId) {
            return sendBadRequestResponse(res, "User ID is required!");
        }

        const wishlist = await wishlistModel.findOne({ userId }).populate({
            path: "items.productId",
            populate: { path: "variants" } // Populate variants if you need them for images/prices
        });

        if (!wishlist) {
            return sendSuccessResponse(res, "Wishlist is empty", {
                wishlistCount: 0,
                items: []
            });
        }

        return sendSuccessResponse(res, "Wishlist items fetched successfully", {
            wishlistCount: wishlist.items.length,
            items: wishlist.items
        });

    } catch (error) {
        console.error("Get Wishlist Error:", error.message);
        return sendErrorResponse(res, 500, "Error fetching wishlist", error.message);
    }
};