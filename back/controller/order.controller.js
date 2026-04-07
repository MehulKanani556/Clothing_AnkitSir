import mongoose from "mongoose";
import Order from "../model/order.model.js";
import Payment from "../model/payment.model.js";
import Cart from "../model/cart.model.js";
import ProductVariant from "../model/productVariant.model.js";
import User from "../model/user.model.js";
import { sendBadRequestResponse, sendErrorResponse, sendNotFoundResponse, sendSuccessResponse } from "../utils/Response.utils.js";
// Optional Stripe integration, if installed.
import Stripe from "stripe";
const STRIPE_SECRET = process.env.STRIPE_SECRET;
const stripe = new Stripe(STRIPE_SECRET);

export const placeOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user.id || req.user._id;
        const {
            paymentMethod,
            shippingAddress,
            cardNumber,
            cardHolderName,
            expiryDate,
            cvv,
            saveCardInfo,
            savedCardId
        } = req.body;

        if (!paymentMethod || !["Card", "Zip Pay", "After Pay"].includes(paymentMethod)) {
            await session.abortTransaction();
            return sendBadRequestResponse(res, "Invalid or missing payment method.");
        }

        const cart = await Cart.findOne({ userId })
            .populate("items.productId", "name")
            .populate("items.productVariantId", "sku price stock options")
            .session(session);

        if (!cart || cart.items.length === 0) {
            await session.abortTransaction();
            return sendBadRequestResponse(res, "Cannot place order because cart is empty.");
        }

        const user = await User.findById(userId).session(session);
        if (!user || user.address.length === 0) {
            await session.abortTransaction();
            return sendBadRequestResponse(res, "Please add a shipping address before placing order.");
        }

        const activeAddress = user.address.find(addr => addr._id.toString() === user.selectedAddress?.toString()) || user.address[0];

        if (!activeAddress) {
            await session.abortTransaction();
            return sendBadRequestResponse(res, "Please select a shipping address before placing order.");
        }

        let billingAmount = 0;
        const orderProducts = [];
        const outOfStockItems = [];

        // Check stock and compute subtotal
        for (const item of cart.items) {
            const product = item.productId;
            const variant = item.productVariantId;

            if (!product || !variant) continue;

            let availableStock = 0;
            let unitPrice = 0;
            let optionSku = variant.sku;

            if (variant.options && variant.options.length > 0 && item.selectedSize) {
                const sizeObj = variant.options.find(o => o.size === item.selectedSize);
                if (sizeObj) {
                    availableStock = sizeObj.stock;
                    unitPrice = sizeObj.price;
                    optionSku = sizeObj.sku || optionSku;
                }
            } else {
                availableStock = variant.stock;
                unitPrice = variant.price;
            }

            if (availableStock < item.quantity) {
                outOfStockItems.push({
                    name: product.name,
                    size: item.selectedSize,
                    requested: item.quantity,
                    available: availableStock
                });
            } else {
                const subtotal = unitPrice * item.quantity;
                billingAmount += subtotal;

                orderProducts.push({
                    productId: product._id,
                    variantId: variant._id,
                    sku: optionSku,
                    name: product.name,
                    quantity: item.quantity,
                    price: unitPrice,
                    subtotal,
                    selectedSize: item.selectedSize
                });
            }
        }

        if (outOfStockItems.length > 0) {
            await session.abortTransaction();
            return sendBadRequestResponse(res, "Some items are out of stock.", { outOfStockItems });
        }

        // Coupon logic check
        let discountAmount = 0;
        if (cart.appliedCoupon && cart.appliedCoupon.code) {
            const { discountType, percentageValue, flatValue } = cart.appliedCoupon;
            if (discountType === "percentage") {
                discountAmount = (billingAmount * percentageValue) / 100;
            } else if (discountType === "flat") {
                discountAmount = flatValue;
            }
            if (discountAmount > billingAmount) discountAmount = billingAmount;

            // Lock in the tracked dollar amount for order history
            cart.appliedCoupon.discountAmount = discountAmount;
        }

        let shippingCost = 25;

        // Create Order
        let orderStatus = "Pending";
        let paymentStatus = "Pending";

        const newOrder = new Order({
            userId,
            products: orderProducts,
            billingAmount,
            discountAmount,
            shippingCost,
            // totalAmount will be auto calculated by pre-save hooks
            paymentStatus,
            paymentMethod,
            shippingAddress: activeAddress,
            orderStatus,
            appliedCoupon: cart.appliedCoupon || {},
            timeline: [{
                status: orderStatus,
                message: "Order placed successfully.",
                updatedBy: "system"
            }]
        });

        const savedOrder = await newOrder.save({ session });

        let clientSecret = null;
        let stripePaymentIntentId = null;

        let finalCardNumber = cardNumber;
        let finalCardHolderName = cardHolderName;
        let finalExpiryDate = expiryDate;
        let finalCvv = cvv;

        // --- Card Specific Data Prep ---
        if (paymentMethod === "Card") {
            if (savedCardId) {
                const matchingCard = user.savedCards.find(c => c._id.toString() === savedCardId.toString());
                if (!matchingCard) {
                    await session.abortTransaction();
                    return sendBadRequestResponse(res, "Selected saved card not found.");
                }
                finalCardNumber = matchingCard.cardNumber;
                finalCardHolderName = matchingCard.cardHolderName;
                finalExpiryDate = matchingCard.expiryDate;
                finalCvv = matchingCard.cvv;
            } else {
                if (!finalCardNumber || !finalExpiryDate || !finalCvv) {
                    await session.abortTransaction();
                    return sendBadRequestResponse(res, "Please provide Card Number, Expiry Date, and CVV.");
                }

                if (saveCardInfo) {
                    user.savedCards.push({
                        cardNumber: finalCardNumber,
                        cardHolderName: finalCardHolderName || "Unknown",
                        expiryDate: finalExpiryDate,
                        cvv: finalCvv,
                        cardType: "Card"
                    });
                    await user.save({ session });
                }
            }
        }

        // --- Stripe Payment Intent Generic Block ---
        if (["Card", "Zip Pay", "After Pay"].includes(paymentMethod)) {
            try {
                const amountInCents = Math.round(savedOrder.totalAmount * 100);
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: amountInCents,
                    currency: "aud",
                    automatic_payment_methods: { enabled: true },
                    metadata: {
                        orderId: savedOrder._id.toString(),
                        userId: userId.toString(),
                        methodSelected: paymentMethod
                    }
                });
                clientSecret = paymentIntent.client_secret;
                stripePaymentIntentId = paymentIntent.id;

                savedOrder.stripePaymentIntentId = stripePaymentIntentId;
                savedOrder.clientSecret = clientSecret;
                await savedOrder.save({ session });
            } catch (stripeError) {
                console.error("Stripe Error:", stripeError);
                await session.abortTransaction();
                return sendErrorResponse(res, 500, `Stripe payment creation failed for ${paymentMethod}.`, stripeError.message);
            }
        }

        // Create Payment Record
        const paymentRecord = new Payment({
            userId,
            orderId: savedOrder._id,
            amount: savedOrder.totalAmount,
            paymentMethod,
            paymentStatus,
            clientSecret,
            stripePaymentIntentId,
            cardDetails: paymentMethod === "Card" ? {
                cardNumber: finalCardNumber ? `**** **** **** ${finalCardNumber.slice(-4)}` : null,
                cardHolderName: finalCardHolderName,
                expiryDate: finalExpiryDate,
                cardType: "Card"
            } : undefined
        });

        await paymentRecord.save({ session });

        // Decrement Stock
        for (const item of orderProducts) {
            const variant = await ProductVariant.findById(item.variantId).session(session);
            if (variant.options && variant.options.length > 0 && item.selectedSize) {
                const sizeObj = variant.options.find(o => o.size === item.selectedSize);
                if (sizeObj) sizeObj.stock -= item.quantity;
            } else {
                variant.stock -= item.quantity;
            }
            await variant.save({ session });
        }

        // Empty Cart
        await Cart.deleteOne({ userId }, { session });

        await session.commitTransaction();

        return sendSuccessResponse(res, "Order placed successfully.", {
            orderId: savedOrder.orderId,
            _id: savedOrder._id,
            totalAmount: savedOrder.totalAmount,
            orderStatus: savedOrder.orderStatus,
            paymentStatus: savedOrder.paymentStatus,
            clientSecret,
            stripePaymentIntentId,
            message: `Use client_secret to confirm ${paymentMethod} payment on frontend`
        });

    } catch (error) {
        await session.abortTransaction();
        return sendErrorResponse(res, 500, "Error placing order.", error.message);
    } finally {
        session.endSession();
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const orders = await Order.find({ userId })
            .populate("products.productId", "name images slug")
            .populate("products.variantId", "color")
            .sort({ createdAt: -1 });

        return sendSuccessResponse(res, "Orders fetched successfully", orders);
    } catch (error) {
        return sendErrorResponse(res, 500, error.message);
    }
};

export const confirmStripePayment = async (req, res) => {
    // Boilerplate for confirming payment after front-end handles clientSecret
    try {
        const { paymentIntentId, orderId } = req.body;
        if (!paymentIntentId || !orderId) return sendBadRequestResponse(res, "Payment Intent ID and Order ID are required.");

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status !== "succeeded") {
            return sendErrorResponse(res, 400, `Payment not completed. Status: ${paymentIntent.status}`);
        }

        const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
        if (payment) {
            payment.paymentStatus = "Paid";
            payment.paymentDate = new Date();
            await payment.save();
        }

        const order = await Order.findById(orderId);
        if (order) {
            order.orderStatus = "Order Confirmed";
            order.paymentStatus = "Paid";
            order.timeline.push({
                status: "Order Confirmed",
                message: "Payment successful.",
                updatedBy: "system"
            });
            await order.save();
        }

        return sendSuccessResponse(res, "Payment confirmed successfully", { orderId: order._id, paymentStatus: "Paid" });
    } catch (err) {
        return sendErrorResponse(res, 500, err.message);
    }
};

export const orderSummaryController = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return sendErrorResponse(res, 400, "Valid User ID is required.");
        }

        const cart = await Cart.findOne({ userId })
            .populate("items.productId", "name images slug")
            .populate("items.productVariantId", "sku price stock options color");

        if (cart && cart.items.length > 0) {
            let subtotal = 0;

            cart.items.forEach((item) => {
                const variant = item.productVariantId;
                if (!variant) return;

                let effectivePrice = variant.price || 0;

                // Handle nested size options
                if (variant.options && variant.options.length > 0 && item.selectedSize) {
                    const sizeObj = variant.options.find(o => o.size === item.selectedSize);
                    if (sizeObj) {
                        effectivePrice = sizeObj.price;
                    }
                }

                subtotal += effectivePrice * item.quantity;
            });

            let discountAmount = 0;
            let discountDetails = null;

            if (cart.appliedCoupon && cart.appliedCoupon.code) {
                const { discountType, percentageValue, flatValue } = cart.appliedCoupon;
                if (discountType === "percentage") {
                    discountAmount = (subtotal * percentageValue) / 100;
                } else if (discountType === "flat") {
                    discountAmount = flatValue;
                }
                if (discountAmount > subtotal) discountAmount = subtotal;

                discountDetails = {
                    code: cart.appliedCoupon.code,
                    discountType: discountType,
                    discountAmount: discountAmount
                };
            }

            // Fixed defaults matching system, can be integrated with AusPost later if they paste the util.
            const estimatedDelivery = 25;

            const totalAmount = Math.max(0, subtotal - discountAmount) + estimatedDelivery;

            const summary = {
                cartId: cart._id,
                items: cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0),
                subtotal: Math.round(subtotal * 100) / 100,
                discount: { amount: discountAmount, details: discountDetails },
                estimatedDelivery,
                total: Math.round(totalAmount * 100) / 100,
                appliedCoupon: discountDetails,
            };

            return sendSuccessResponse(res, "Order summary fetched successfully.", summary);
        }

        const zeroSummary = {
            cartId: null,
            items: 0,
            subtotal: 0,
            discount: { amount: 0, details: null },
            estimatedDelivery: 0,
            total: 0,
            appliedCoupon: null
        };

        return sendSuccessResponse(res, "Cart is empty. Returning zero summary.", zeroSummary);
    } catch (error) {
        console.error("Order Summary Error:", error.message);
        return sendErrorResponse(res, 500, "Error during order summary.", error.message);
    }
};

export const getAllOrdersAdmin = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const count = await Order.countDocuments();

        const orders = await Order.find()
            .populate("userId", "firstName lastName email mobileNo")
            .populate("products.productId", "name images slug")
            .populate("products.variantId", "color sku options")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return sendSuccessResponse(res, "All orders fetched successfully", {
            orders,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            totalOrders: count
        });

    } catch (error) {
        return sendErrorResponse(res, 500, "Error fetching orders", error.message);
    }
};

export const updateOrderStatusAdmin = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;
        const { orderStatus } = req.body;

        const validStatuses = [
            "Pending", "Order Confirmed", "Processing", "Shipped",
            "Out For Delivery", "Delivered", "Cancelled"
        ];

        if (!orderStatus || !validStatuses.includes(orderStatus)) {
            await session.abortTransaction();
            return sendBadRequestResponse(res, `Invalid order status. Allowed values: ${validStatuses.join(", ")}`);
        }

        const order = await Order.findById(id).session(session);
        if (!order) {
            await session.abortTransaction();
            return sendNotFoundResponse(res, "Order not found");
        }

        // Prevent redundant updates
        if (order.orderStatus === orderStatus) {
            await session.abortTransaction();
            return sendBadRequestResponse(res, `Order is already marked as ${orderStatus}`);
        }

        order.orderStatus = orderStatus;

        // Add to timeline
        order.timeline.push({
            status: orderStatus,
            message: `Status updated to ${orderStatus} by admin.`,
            updatedBy: "admin"
        });

        await order.save({ session });
        await session.commitTransaction();

        return sendSuccessResponse(res, "Order status updated successfully", order);

    } catch (error) {
        await session.abortTransaction();
        console.error("Order Status Update Error:", error);
        return sendErrorResponse(res, 500, "Error updating order status", error.message);
    } finally {
        session.endSession();
    }
};