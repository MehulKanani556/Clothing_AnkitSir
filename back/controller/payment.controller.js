import mongoose from "mongoose";
import { sendErrorResponse, sendNotFoundResponse, sendSuccessResponse, sendBadRequestResponse } from "../utils/Response.utils.js";
import Order from "../model/order.model.js";
import paymentModel from "../model/payment.model.js";
import PDFDocument from "pdfkit";
import productModel from "../model/product.model.js";
import ProductVariant from "../model/productVariant.model.js";
import Stripe from 'stripe'
import orderModel from "../model/order.model.js";
import UserModel from "../model/user.model.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STRIPE_SECRET = process.env.STRIPE_SECRET;
const stripe = new Stripe(STRIPE_SECRET)

export const myPaymentController = async (req, res) => {
  try {
    const userId = req?.user?.id;
    if (!userId) {
      return sendBadRequestResponse(res, "User ID is required");
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const payments = await paymentModel.find({ userId })
      .populate("userId", "firstName lastName email mobileNo profilePicture")
      .populate({
        path: "orderId",
        select: "-__v -updatedAt",
        populate: [
          {
            path: "products.productId",
            model: "Product",
            select: "title productName mainCategory subCategory brand images name",
          },
          {
            path: "products.variantId",
            model: "ProductVariant",
            select: "variantTitle color images sku Artical_Number moreDetails brandIdentifying product_highlight weight sizeGuideId Occasion Outer_material Type_For_Casual Heel_Height options"
          }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPayments = await paymentModel.countDocuments({ userId });
    const totalPages = Math.ceil(totalPayments / limit);

    const estimatedDelivery = 25;
    const platformFee = 0;

    const enhancedPayments = payments.map(payment => {
      const order = payment.orderId;

      if (!order) {
        return {
          ...payment,
          orderSummary: null
        };
      }

      const productsWithSelectedSize = order.products.map(product => ({
        ...product,
        variantTitle: product.variantTitle || product.variantId?.variantTitle || null,
        selectedSize: product.selectedSize || null
      }));

      const orderAmount = order.totalAmount;
      const finalTotal = payment.amount;

      const calculatedTotal = orderAmount + estimatedDelivery + platformFee;

      return {
        ...payment,
        orderId: {
          ...order,
          products: productsWithSelectedSize
        },
        orderSummary: {
          items: order.products.reduce((sum, product) => sum + product.quantity, 0),
          subtotal: order.billingAmount,
          discount: order.discountAmount,
          giftWrapAmount: order.giftWrapAmount || 0,
          orderAmount: orderAmount,
          estimatedDelivery: estimatedDelivery,
          platformFee: platformFee,
          finalTotal: finalTotal,
          orderStatus: order.orderStatus,
          deliveryExpected: order.deliveryExpected,
          calculationMatches: finalTotal === calculatedTotal
        }
      };
    });

    const response = {
      payments: enhancedPayments,
      pagination: {
        currentPage: page,
        totalPages,
        totalPayments,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };

    return sendSuccessResponse(res, "User payments fetched successfully", response);

  } catch (error) {
    console.error("My Payment Controller Error:", error.message);
    return sendErrorResponse(res, 500, "Server error", error.message);
  }
};

export const getSellerPaymentsController = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    let filter = {};

    if (userRole === "seller") {
      filter = { sellerIds: { $in: [userId] } };
    }
    else if (userRole === "admin") {
      filter = { userId: userId };
    }

    const payments = await paymentModel
      .find(filter)
      .populate("userId", "name email mobileNo")
      .populate("sellerIds", "name email shopName")
      .populate({ path: "orderId", select: "-payment" })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const downloadInvoiceController = async (req, res) => {
  let doc;
  try {
    const { orderId } = req.params;
    const { mode } = req.query;

    if (mode !== 'stream') {
      const protocol = req.protocol;
      const host = req.get("host");
      const token = req.header('Authorization')?.replace('Bearer ', '');
      const downloadUrl = `${protocol}://${host}/api/payment/invoice/${orderId}?mode=stream&token=${token}`;

      return res.status(200).json({
        success: true,
        message: "Invoice link generated successfully",
        downloadUrl
      });
    }

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Valid order ID is required" });
    }

    const order = await Order.findById(orderId)
      .populate("userId", "firstName lastName email")
      .populate({
        path: "products.productId",
        select: "title productName brand mainCategory subCategory",
        populate: [
          { path: "brand", select: "brandName" }
        ],
      })
      .populate("products.variantId");

    if (!order) {
      if (!res.headersSent) return res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    const payment = await paymentModel.findOne({ orderId });
    if (!payment) {
      if (!res.headersSent) return res.status(404).json({ success: false, message: "Payment not found for this order" });
      return;
    }

    doc = new PDFDocument({ size: "A4", margin: 50 });

    const fileName = `INVOICE_${order.orderId}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    doc.pipe(res);

    doc
      .fillColor("#2E86C1")
      .fontSize(26)
      .text("YOUR STORE", { align: "left" })
      .moveUp()
      .fontSize(24)
      .text("INVOICE", { align: "right", underline: true });
    doc.moveDown(1.5);

    const user = order.userId;
    const addr = order.shippingAddress || {};

    const invoiceData = [
      ["Invoice ID", payment._id.toString()],
      ["Order ID", order.orderId],
      ["Payment Method", payment.paymentMethod],
      ["Payment Status", payment.paymentStatus],
      ["Payment Date", payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "N/A"],
      ["Customer Name", `${user?.firstName || ""} ${user?.lastName || ""}`.trim()],
      ["Email", user?.email || "N/A"]
    ];

    if (addr && addr.address) {
      invoiceData.push(
        ["Billing Address", `${addr.address}, ${addr.city || ""}, ${addr.state || ""} - ${addr.zipcode || ""}`],
        ["Phone", addr.phone || "N/A"]
      );
    }

    let y = doc.y;
    const tableStartX = 50;
    const rowHeight = 20;

    invoiceData.forEach(row => {
      doc.fillColor("#000").fontSize(10).font("Helvetica-Bold")
        .text(row[0], tableStartX + 5, y + 5, { width: 150, align: "left" });
      doc.font("Helvetica").text(row[1] || "N/A", tableStartX + 160, y + 5, { width: 335, align: "left" });
      y += rowHeight;
    });

    y += 20;

    const products = order.products || [];
    if (products.length > 0) {
      const headers = ["#", "Product", "SKU", "Size", "Qty", "Price", "Subtotal"];
      const widths = [30, 150, 80, 50, 40, 70, 80];
      let x = tableStartX;

      doc.font("Helvetica-Bold").fontSize(10);
      headers.forEach((header, i) => {
        doc.text(header, x + 5, y, { width: widths[i], align: "left" });
        x += widths[i];
      });
      y += rowHeight;

      products.forEach((item, i) => {
        const variant = item.variantId || {};
        const product = item.productId || {};
        const price = item.price || 0;
        const subtotal = item.subtotal || price * item.quantity;
        const name = product.title || product.productName || product.name || "Unnamed";
        const color = variant.color || "";
        const size = item.selectedSize || "N/A";

        const rowData = [
          (i + 1).toString(),
          `${name} ${color}`,
          variant.sku || "N/A",
          size,
          item.quantity.toString(),
          `$${price.toFixed(2)} AUD`,
          `$${subtotal.toFixed(2)} AUD`,
        ];

        x = tableStartX;
        rowData.forEach((val, j) => {
          doc.font("Helvetica").fontSize(9).text(val, x + 5, y, { width: widths[j], align: "left" });
          x += widths[j];
        });
        y += rowHeight;
      });
    }

    y += 20;

    const totals = [
      ["Subtotal", `$${order.billingAmount.toFixed(2)}`],
      ["Discount", `-$${order.discountAmount.toFixed(2)}`],
      ["Shipping", `$${order.shippingCost.toFixed(2)}`],
      ["Total", `$${order.totalAmount.toFixed(2)}`],
    ];

    totals.forEach(([key, val], i) => {
      doc.font(i === totals.length - 1 ? "Helvetica-Bold" : "Helvetica")
        .fontSize(10)
        .text(key, tableStartX + 300, y, { width: 100, align: "left" })
        .text(val, tableStartX + 400, y, { width: 100, align: "right" });
      y += 18;
    });

    y += 30;
    doc.font("Helvetica").fontSize(10).fillColor("#666")
      .text("Thank you for your purchase!", tableStartX, y, { align: "center" });

    doc.end();

  } catch (error) {
    if (doc) doc.end();
    console.error("Invoice stream error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

export const paymentStatusChangeController = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    const { orderId } = req.params;
    let { paymentStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Valid payment ID required" });
    }

    paymentStatus = paymentStatus?.toLowerCase();

    const statusMap = {
      pending: "Pending",
      paid: "Paid",
      failed: "Failed"
    };

    const mappedStatus = statusMap[paymentStatus];
    if (!mappedStatus) {
      return res.status(400).json({
        success: false,
        message: `Payment status must be one of: ${Object.keys(statusMap).join(", ")}`
      });
    }

    const payment = await paymentModel.findOne({ orderId: orderId }).session(session);
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

    const order = await orderModel.findById(payment.orderId).session(session);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (req.user.role === "seller") {
      if (order.sellerId && order.sellerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You cannot update payment of this order"
        });
      }
    }

    const oldPaymentStatus = payment.paymentStatus;
    payment.paymentStatus = mappedStatus;
    order.paymentStatus = mappedStatus;

    if (mappedStatus === "Paid" && oldPaymentStatus !== "Paid") {
      payment.paymentDate = new Date();
      order.orderStatus = "Order Confirmed";
    }

    await payment.save({ session });
    await order.save({ session });
    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: `Payment updated to ${mappedStatus}`,
      result: { payment, order }
    });

  } catch (error) {
    await session.abortTransaction();
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    session.endSession();
  }
};

export const confirmStripePaymentController = async (req, res) => {
  if (!req.user || !req.user.id) {
    return sendErrorResponse(res, 401, "Authentication required. Please log in.");
  }

  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    const userId = req.user.id;
    const { paymentIntentId, orderId, testMode } = req.body;

    if (!paymentIntentId || !orderId) {
      return sendBadRequestResponse(res, "Payment Intent ID and Order ID are required");
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // If testing in Postman without a frontend UI taking the fake card, pass "testMode": true
    if (!testMode && paymentIntent.status !== 'succeeded') {
      return sendErrorResponse(res, 400, `Payment not completed. Status: ${paymentIntent.status}`);
    }

    const payment = await paymentModel.findOne({
      stripePaymentIntentId: paymentIntentId,
      userId: userId
    }).session(session);

    if (!payment) {
      return sendNotFoundResponse(res, "Payment record not found");
    }

    const order = await orderModel.findById(orderId).session(session);

    if (!order) {
      return sendNotFoundResponse(res, "Order not found");
    }

    if (order.userId.toString() !== userId.toString()) {
      return sendErrorResponse(res, 403, "You are not authorized to confirm this order");
    }

    payment.paymentStatus = "Paid";
    payment.paymentDate = new Date();
    await payment.save({ session });

    order.orderStatus = "Order Confirmed";
    order.paymentStatus = "Paid";
    order.timeline.push({
      status: "Order Confirmed",
      message: "Payment received successfully. Order confirmed.",
      updatedBy: "system"
    });

    await order.save({ session });

    // Deduct stock natively for standard custom product variant arrays
    for (const item of order.products) {
      const variant = await ProductVariant.findById(item.variantId).session(session);

      if (variant?.options && variant.options.length > 0) {
        for (let i = 0; i < variant.options.length; i++) {
          if (variant.options[i].size === item.selectedSize && variant.options[i].stock >= item.quantity) {
            variant.options[i].stock -= item.quantity;
            break;
          }
        }
      } else if (variant) {
        if (variant.stock >= item.quantity) variant.stock -= item.quantity;
      }
      if (variant) await variant.save({ session });
    }

    await session.commitTransaction();

    return sendSuccessResponse(res, "Payment confirmed successfully", {
      paymentId: payment._id,
      orderId: order._id,
      orderStatus: order.orderStatus,
      paymentStatus: payment.paymentStatus,
      amount: payment.amount,
      currency: "AUD"
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Payment confirmation error:", error);
    return sendErrorResponse(res, 500, "Error confirming payment", error.message);
  } finally {
    session.endSession();
  }
};


export const getPaymentStatusController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId } = req.params;

    const payment = await paymentModel.findOne({
      orderId,
      userId
    }).populate('orderId');

    if (!payment) {
      return sendNotFoundResponse(res, "Payment not found");
    }

    if (payment.paymentMethod === "Card" && payment.paymentStatus === "Processing") {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);

        if (paymentIntent.status === 'succeeded') {
          payment.paymentStatus = "Paid";
          payment.paymentDate = new Date();
          await payment.save();

          await orderModel.findByIdAndUpdate(orderId, {
            orderStatus: "Order Confirmed",
            paymentStatus: "Paid"
          });
        }
      } catch (stripeError) {
        console.error("Stripe status check error:", stripeError);
      }
    }

    const updatedOrder = await orderModel.findById(orderId);

    return sendSuccessResponse(res, "Payment status retrieved", {
      paymentId: payment._id,
      orderId: payment.orderId._id,
      orderStatus: updatedOrder.orderStatus,
      paymentStatus: payment.paymentStatus,
      paymentMethod: payment.paymentMethod,
      amount: payment.amount,
      clientSecret: payment.clientSecret,
      stripePaymentIntentId: payment.stripePaymentIntentId
    });

  } catch (error) {
    console.error("Get payment status error:", error);
    return sendErrorResponse(res, 500, "Error retrieving payment status", error.message);
  }
};



export const getAllPaymentHistory = async (req, res) => {
  try {
    const payments = await paymentModel.find({}).populate("orderId").populate("userId")

    return sendSuccessResponse(res, "All payment get successfully", payments)
  } catch (error) {
    return sendErrorResponse(res, 500, "Error while Get all payment Histrory", error)
  }
};

export const getSavedCardsController = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await UserModel.findById(userId);

    if (!user) {
      return sendNotFoundResponse(res, "User not found");
    }

    const savedCards = user.savedCards.map(card => ({
      _id: card._id,
      cardNumber: `**** **** **** ${card.cardNumber.slice(-4)}`,
      cardHolderName: card.cardHolderName,
      expiryDate: card.expiryDate,
      cardType: card.cardType,
      isDefault: false
    }));

    return sendSuccessResponse(res, "Saved cards fetched successfully", savedCards);

  } catch (error) {
    console.error("Get Saved Cards Error:", error.message);
    return sendErrorResponse(res, 500, "Error fetching saved cards", error.message);
  }
};

export const deleteSavedCardController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cardId } = req.params;

    const user = await UserModel.findById(userId);

    if (!user) {
      return sendNotFoundResponse(res, "User not found");
    }

    const cardIndex = user.savedCards.findIndex(card => card._id.toString() === cardId);

    if (cardIndex === -1) {
      return sendNotFoundResponse(res, "Card not found");
    }

    user.savedCards.splice(cardIndex, 1);
    await user.save();

    return sendSuccessResponse(res, "Card deleted successfully");

  } catch (error) {
    console.error("Delete Saved Card Error:", error.message);
    return sendErrorResponse(res, 500, "Error deleting saved card", error.message);
  }
};