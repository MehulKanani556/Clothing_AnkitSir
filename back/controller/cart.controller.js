import mongoose from "mongoose";
import Cart from "../model/cart.model.js";
import Product from "../model/product.model.js";
import ProductVariant from "../model/productVariant.model.js";
import Coupon from "../model/coupon.model.js";
import { sendBadRequestResponse, sendErrorResponse, sendNotFoundResponse, sendSuccessResponse, sendForbiddenResponse } from "../utils/Response.utils.js";

// Helper strictly for calculating totals and formatting response
const fetchCartAndCalculateTotals = async (userId, res, message = "Cart fetched successfully") => {
  try {
    const cart = await Cart.findOne({ userId })
      .populate({
        path: "items.productId",
        select: "name productDetails badge slug",
      })
      .populate({
        path: "items.productVariantId",
        select: "color colorCode images options price stock",
      });

    if (!cart) {
      return sendSuccessResponse(res, message, {
        cartId: null,
        items: [],
        subtotal: 0,
        discount: 0,
        shipping: 0,
        total: 0,
        appliedCoupon: null
      });
    }

    let subtotal = 0;

    cart.items.forEach(item => {
      const variant = item.productVariantId;
      if (!variant) return;

      let itemPrice = 0;
      if (variant.options && variant.options.length > 0 && item.selectedSize) {
        const sizeObj = variant.options.find(s => s.size === item.selectedSize);
        if (sizeObj) itemPrice = sizeObj.price;
      } else {
        itemPrice = variant.price || 0;
      }
      subtotal += (itemPrice * item.quantity);
    });

    let discount = 0;
    if (cart.appliedCoupon && cart.appliedCoupon.code) {
      const { discountType, percentageValue, flatValue } = cart.appliedCoupon;
      if (discountType === "percentage") {
        discount = (subtotal * percentageValue) / 100;
      } else if (discountType === "flat") {
        discount = flatValue;
      }
      if (discount > subtotal) discount = subtotal; // Can't discount more than total
    }

    // Example Shipping Logic based on UI: Orders over $250 ship free!
    let shipping = subtotal >= 250 ? 0 : 25;
    if (subtotal === 0) shipping = 0;

    let total = subtotal - discount + shipping;
    if (total < 0) total = 0;

    return sendSuccessResponse(res, message, {
      cartId: cart._id,
      items: cart.items,
      subtotal,
      discount,
      shipping,
      total,
      appliedCoupon: cart.appliedCoupon
    });
  } catch (err) {
    return sendErrorResponse(res, 500, err.message);
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { productId, quantity = 1, selectedSize = null } = req.body;
    const productVariantId = req.body.productVariantId || req.body.productVarientId;

    if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(productVariantId)) {
      return sendBadRequestResponse(res, "Invalid product or variant ID.");
    }

    const product = await Product.findById(productId);
    if (!product) return sendNotFoundResponse(res, "Product not found.");

    const variant = await ProductVariant.findOne({ _id: productVariantId, productId });
    if (!variant) return sendNotFoundResponse(res, "Product variant not found.");

    let availableStock = 0;

    if (variant.options && variant.options.length > 0) {
      if (!selectedSize) {
        return sendBadRequestResponse(res, "Size selection is required for this product variant.");
      }

      const sizeObj = variant.options.find(o => o.size === selectedSize);
      if (!sizeObj) {
        return sendBadRequestResponse(res, `Size '${selectedSize}' not available.`);
      }

      availableStock = sizeObj.stock || 0;
    } else {
      // If variant has no options, ignore selectedSize if provided (generous validation)
      availableStock = variant.stock || 0;
    }

    if (availableStock < quantity) {
      return sendBadRequestResponse(res, `Insufficient stock. Only ${availableStock} available.`);
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [] });

    const itemIndex = cart.items.findIndex(
      item =>
        item.productId.toString() === productId &&
        item.productVariantId.toString() === productVariantId &&
        item.selectedSize === selectedSize
    );

    if (itemIndex > -1) {
      const newQty = cart.items[itemIndex].quantity + quantity;
      if (availableStock < newQty) return sendBadRequestResponse(res, `Insufficient stock. Allowed up to ${availableStock}.`);
      cart.items[itemIndex].quantity = newQty;
    } else {
      cart.items.push({
        productId,
        productVariantId,
        quantity,
        selectedSize
      });
    }

    // Reset coupon when cart changes
    cart.appliedCoupon = { couponId: null, code: null, discountAmount: 0, discountType: null };
    await cart.save();

    return fetchCartAndCalculateTotals(userId, res, "Item added to cart successfully.");
  } catch (error) {
    return sendErrorResponse(res, 500, error.message);
  }
};

export const getMyCart = async (req, res) => {
  const userId = req.user.id || req.user._id;
  return fetchCartAndCalculateTotals(userId, res, "Cart fetched successfully.");
};

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { productId, selectedSize = null, quantity } = req.body;
    const productVariantId = req.body.productVariantId || req.body.productVarientId;

    if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(productVariantId)) {
      return sendBadRequestResponse(res, "Invalid product or variant ID.");
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) return sendNotFoundResponse(res, "Cart not found.");

    const itemIndex = cart.items.findIndex(
      item =>
        item.productId.toString() === productId &&
        item.productVariantId.toString() === productVariantId &&
        item.selectedSize === selectedSize
    );

    if (itemIndex === -1) return sendNotFoundResponse(res, "Item not found in cart.");

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      // Validate stock
      const variant = await ProductVariant.findById(productVariantId);
      let availableStock = 0;
      if (variant.options && variant.options.length > 0) {
        const sObj = variant.options.find(o => o.size === selectedSize);
        availableStock = sObj ? sObj.stock : 0;
      } else {
        availableStock = variant.stock || 0;
      }

      if (availableStock < quantity) {
        return sendBadRequestResponse(res, `Insufficient stock. Only ${availableStock} available.`);
      }
      cart.items[itemIndex].quantity = quantity;
    }

    cart.appliedCoupon = { couponId: null, code: null, discountAmount: 0, discountType: null };
    await cart.save();

    return fetchCartAndCalculateTotals(userId, res, "Cart updated successfully.");

  } catch (error) {
    return sendErrorResponse(res, 500, error.message);
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { productId, selectedSize = null } = req.body;
    const productVariantId = req.body.productVariantId || req.body.productVarientId;

    const cart = await Cart.findOne({ userId });
    if (!cart) return sendNotFoundResponse(res, "Cart not found.");

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      item =>
        !(item.productId.toString() === productId &&
          item.productVariantId.toString() === productVariantId &&
          item.selectedSize === selectedSize)
    );

    if (cart.items.length === initialLength) {
      return sendNotFoundResponse(res, "Item not found in cart.");
    }

    cart.appliedCoupon = { couponId: null, code: null, discountAmount: 0, discountType: null };
    await cart.save();

    return fetchCartAndCalculateTotals(userId, res, "Item removed from cart.");

  } catch (error) {
    return sendErrorResponse(res, 500, error.message);
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    await Cart.findOneAndDelete({ userId });
    return sendSuccessResponse(res, "Cart cleared successfully.");
  } catch (error) {
    return sendErrorResponse(res, 500, error.message);
  }
};

export const applyCoupon = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { code } = req.body;
    if (!code) return sendBadRequestResponse(res, "Coupon code is required");

    const coupon = await Coupon.isValidCoupon(code);
    if (!coupon) return sendBadRequestResponse(res, "Invalid or expired coupon.");

    let cart = await Cart.findOne({ userId })
      .populate("items.productVariantId", "price options colorCode");

    if (!cart || cart.items.length === 0) return sendBadRequestResponse(res, "Cart is empty.");

    let subtotal = 0;
    cart.items.forEach(item => {
      const variant = item.productVariantId;
      if (!variant) return;
      let itemPrice = 0;
      if (variant.options && variant.options.length > 0 && item.selectedSize) {
        const sizeObj = variant.options.find(s => s.size === item.selectedSize);
        if (sizeObj) itemPrice = sizeObj.price;
      } else {
        itemPrice = variant.price || 0;
      }
      subtotal += (itemPrice * item.quantity);
    });

    if (subtotal < coupon.minOrderValue) {
      return sendBadRequestResponse(res, `Order amount must be at least $${coupon.minOrderValue} to use this coupon.`);
    }

    cart.appliedCoupon = {
      couponId: coupon._id,
      code: coupon.code,
      discountType: coupon.discountType,
      percentageValue: coupon.percentageValue || 0,
      flatValue: coupon.flatValue || 0,
      discountAmount: 0 // dynamically computed during fetch
    };

    await cart.save();
    return fetchCartAndCalculateTotals(userId, res, "Coupon applied successfully!");

  } catch (error) {
    return sendErrorResponse(res, 500, error.message);
  }
};

export const removeCoupon = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const cart = await Cart.findOne({ userId });
    if (!cart) return sendNotFoundResponse(res, "Cart not found.");

    cart.appliedCoupon = {
      couponId: null,
      code: null,
      discountType: null,
      percentageValue: 0,
      flatValue: 0,
      discountAmount: 0
    };

    await cart.save();
    return fetchCartAndCalculateTotals(userId, res, "Coupon removed successfully!");
  } catch (error) {
    return sendErrorResponse(res, 500, error.message);
  }
};
