import express from "express";
import { AuthController } from "../controller/auth.controller.js";
import { UserAuth, adminAuth, OptionalUserAuth } from "../middleware/auth.middleware.js";
import { upload, listBucketObjects, deleteManyFromS3 } from "../middleware/imageupload.js";
import {
  createMainCategory,
  getAllMainCategory,
  getMainCategoryById,
  updateMainCategoryById,
  deleteMainCategoryById
} from "../controller/mainCategory.controller.js";
import {
  createCategory,
  getAllCategory,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
  getCategoriesByMainCategoryId
} from "../controller/category.controller.js";
import {
  createSubCategory,
  getAllSubCategory,
  getSubCategoryById,
  updateSubCategoryById,
  deleteSubCategoryById,
  getSubCategoriesByCategoryId
} from "../controller/subCategory.controller.js";
import {
  createInsideSubCategory,
  getAllInsideSubCategory,
  getInsideSubCategoryById,
  updateInsideSubCategoryById,
  deleteInsideSubCategoryById,
  getInsideSubCategoriesBySubCategoryId
} from "../controller/insideSubCategory.controller.js";
import {
  createProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  searchProducts
} from "../controller/product.controller.js";
import {
  createProductVariant,
  getAllProductVariant,
  getProductVariantById,
  updateProductVariant,
  deleteProductVariant,
  getVariantsByProductId,
  getColorsByProductId,
  getSizesByVariantId
} from "../controller/productVariant.controller.js";
import {
  createSizeGuide,
  getAllSizeGuides,
  getSizeGuideById,
  updateSizeGuide,
  deleteSizeGuide,
  updateProductSizeGuide,
  getProductSizeGuide
} from "../controller/size.guide.controller.js";
import {
  createCoupon,
  getAllCoupon,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  getAllCouponAdmin
} from "../controller/coupon.controller.js";
import {
  addToCart,
  getMyCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon
} from "../controller/cart.controller.js";
import {
  placeOrder,
  getMyOrders,
  confirmStripePayment,
  orderSummaryController,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  cancelOrder
} from "../controller/order.controller.js";
import {
  myPaymentController,
  downloadInvoiceController,
  paymentStatusChangeController,
  getAllPaymentHistory,
  getPaymentStatusController,
  confirmStripePaymentController
} from "../controller/payment.controller.js";
import {
  userAddressAddController,
  userAddressUpdateController,
  userAddressDeleteController,
  getUserAddressController,
  selectAddressController,
  addSavedCardController,
  getSavedCardsController,
  deleteSavedCardController,
  selectCardController,
  updateProfileController,
  sendEmailOtpController,
  verifyEmailOtpController
} from "../controller/user.controller.js";
import {
  logSearch,
  getPopularSearches,
  getRecentSearches,
  getTrendingProducts
} from "../controller/search.controller.js";
import { sendResponse, sendSuccessResponse } from "../utils/Response.utils.js";

const router = express.Router();

// --- Auth Routes ---
router.post("/auth/send-otp", AuthController.sendOtp);
router.post("/auth/verify-otp", AuthController.verifyOtp);
router.post("/auth/refresh-token", AuthController.refreshAccessToken);
router.get("/auth/me", UserAuth, AuthController.getUser);
router.post("/auth/update-fcm", UserAuth, AuthController.updateFcmToken);

// --- Main Category Routes ---
router.post("/main-category/create", UserAuth, adminAuth, upload.single("mainCategoryImage"), createMainCategory);
router.get("/main-category/get-all", getAllMainCategory);
router.get("/main-category/get-by-id/:id", getMainCategoryById);
router.put("/main-category/update/:id", UserAuth, adminAuth, upload.single("mainCategoryImage"), updateMainCategoryById);
router.delete("/main-category/delete/:id", UserAuth, adminAuth, deleteMainCategoryById);

// --- Category Routes ---
router.post("/category/create", UserAuth, adminAuth, upload.single("categoryImage"), createCategory);
router.get("/category/get-all", getAllCategory);
router.get("/category/get-by-id/:id", getCategoryById);
router.get("/category/get-by-main-category/:mainCategoryId", getCategoriesByMainCategoryId);
router.put("/category/update/:id", UserAuth, adminAuth, upload.single("categoryImage"), updateCategoryById);
router.delete("/category/delete/:id", UserAuth, adminAuth, deleteCategoryById);

// --- Sub Category Routes ---
router.post("/sub-category/create", UserAuth, adminAuth, upload.single("subCategoryImage"), createSubCategory);
router.get("/sub-category/get-all", getAllSubCategory);
router.get("/sub-category/get-by-id/:id", getSubCategoryById);
router.get("/sub-category/get-by-category/:categoryId", getSubCategoriesByCategoryId);
router.put("/sub-category/update/:id", UserAuth, adminAuth, upload.single("subCategoryImage"), updateSubCategoryById);
router.delete("/sub-category/delete/:id", UserAuth, adminAuth, deleteSubCategoryById);

// --- Inside Sub Category Routes ---
router.post("/inside-sub-category/create", UserAuth, adminAuth, upload.single("insideSubCategoryImage"), createInsideSubCategory);
router.get("/inside-sub-category/get-all", getAllInsideSubCategory);
router.get("/inside-sub-category/get-by-id/:id", getInsideSubCategoryById);
router.get("/inside-sub-category/get-by-sub-category/:subCategoryId", getInsideSubCategoriesBySubCategoryId);
router.put("/inside-sub-category/update/:id", UserAuth, adminAuth, upload.single("insideSubCategoryImage"), updateInsideSubCategoryById);
router.delete("/inside-sub-category/delete/:id", UserAuth, adminAuth, deleteInsideSubCategoryById);

// --- Product Routes ---
router.post("/product/create", UserAuth, adminAuth, createProduct);
router.get("/product/get-all", getAllProducts);
router.get("/product/search", searchProducts);
router.get("/product/get-by-id/:id", getProductById);
router.get("/product/get-by-slug/:slug", getProductBySlug);
router.put("/product/update/:id", UserAuth, adminAuth, updateProduct);
router.delete("/product/delete/:id", UserAuth, adminAuth, deleteProduct);

// --- Search & Discovery Routes ---
router.post("/search/log", OptionalUserAuth, logSearch);
router.get("/search/popular", getPopularSearches);
router.get("/search/recent", OptionalUserAuth, getRecentSearches);
router.get("/search/trending", getTrendingProducts);

// --- Product Variant Routes ---
router.post("/product-variant/create", UserAuth, adminAuth, upload.array("images", 10), createProductVariant);
router.get("/product-variant/get-all", getAllProductVariant);
router.get("/product-variant/get-by-id/:id", getProductVariantById);
router.get("/product-variant/get-by-product/:productId", getVariantsByProductId);
router.get("/product-variant/colors/:productId", getColorsByProductId);
router.get("/product-variant/sizes/:variantId", getSizesByVariantId);
router.put("/product-variant/update/:id", UserAuth, adminAuth, upload.array("images", 10), updateProductVariant);
router.delete("/product-variant/delete/:id", UserAuth, adminAuth, deleteProductVariant);

// --- Size Guide Routes ---
router.post("/size-guide/create/:productId", UserAuth, adminAuth, createSizeGuide);
router.get("/size-guide/get-all", getAllSizeGuides);
router.get("/size-guide/get-by-id/:id", getSizeGuideById);
router.put("/size-guide/update-product/:productId", UserAuth, adminAuth, updateProductSizeGuide);
router.get("/size-guide/get-product/:productId", getProductSizeGuide);
router.delete("/size-guide/delete/:id", UserAuth, adminAuth, deleteSizeGuide);

// --- Coupon Routes ---
router.post("/coupon/create", UserAuth, adminAuth, upload.single("couponImage"), createCoupon);
router.get("/coupon/get-all", getAllCoupon);
router.get("/coupon/admin/get-all", UserAuth, adminAuth, getAllCouponAdmin);
router.get("/coupon/get-by-id/:id", getCouponById);
router.put("/coupon/update/:id", UserAuth, adminAuth, upload.single("couponImage"), updateCoupon);
router.delete("/coupon/delete/:id", UserAuth, adminAuth, deleteCoupon);

// --- Cart Routes ---
router.post("/cart/add", UserAuth, addToCart);
router.get("/cart/my", UserAuth, getMyCart);
router.put("/cart/update", UserAuth, updateCartItem);
router.post("/cart/remove", UserAuth, removeFromCart);
router.delete("/cart/clear", UserAuth, clearCart);
router.post("/cart/coupon/apply", UserAuth, applyCoupon);
router.delete("/cart/coupon/remove", UserAuth, removeCoupon);

// --- Order & Payment Routes ---
router.post("/order/place", UserAuth, placeOrder);
router.get("/order/my", UserAuth, getMyOrders);
router.put("/order/cancel/:id", UserAuth, cancelOrder);
router.get("/order/admin/all", UserAuth, adminAuth, getAllOrdersAdmin);
router.put("/order/admin/status/:id", UserAuth, adminAuth, updateOrderStatusAdmin);
router.get("/order/summary", UserAuth, orderSummaryController);

router.post("/payment/confirm", UserAuth, confirmStripePaymentController);
router.get("/payment/status/:orderId", UserAuth, getPaymentStatusController);
router.get("/payment/my", UserAuth, myPaymentController);
router.get("/payment/invoice/:orderId", UserAuth, downloadInvoiceController);
router.put("/payment/status/:orderId", UserAuth, adminAuth, paymentStatusChangeController);
router.get("/payment/admin/all", UserAuth, adminAuth, getAllPaymentHistory);

// --- User Profile & Address Routes ---
router.put("/user/profile/update", UserAuth, updateProfileController);
router.post("/user/email/send-otp", UserAuth, sendEmailOtpController);
router.post("/user/email/verify-otp", UserAuth, verifyEmailOtpController);
router.post("/user/address/add", UserAuth, userAddressAddController);
router.put("/user/address/update/:addressId", UserAuth, userAddressUpdateController);
router.delete("/user/address/delete/:addressId", UserAuth, userAddressDeleteController);
router.get("/user/address/my", UserAuth, getUserAddressController);
router.put("/user/address/select/:addressId", UserAuth, selectAddressController);

// --- User Saved Cards ---
router.post("/user/card/add", UserAuth, addSavedCardController);
router.get("/user/card/my", UserAuth, getSavedCardsController);
router.delete("/user/card/delete/:cardId", UserAuth, deleteSavedCardController);
router.put("/user/card/select/:cardId", UserAuth, selectCardController);

//aws
router.get("/list", async (req, res) => {
  try {
    const images = await listBucketObjects();

    return sendSuccessResponse(res, "Get all images successfully", {
      total: images.length,
      images: images.map((e, index) => { return `${e.url}` })
    })
  } catch (error) {
    console.log("ERROR WHIWL GET ALL IMAGE FROM S3");
    return sendResponse(res, 500, "ERROR WHILE GET ALL IMAGE FROM S3", error)
  }
});

router.delete("/deleteMany", async (req, res) => {
  try {
    const { images } = req.body;
    if (!Array.isArray(images) || !images.length) return sendResponse(res, 400, "URLs array required");

    const keys = images.map(url => {
      const key = String(url).split(".amazonaws.com/")[1];
      return key;
    }).filter(Boolean);

    if (!keys.length) return sendResponse(res, 400, "Invalid S3 URLs");

    await deleteManyFromS3(keys);

    return sendSuccessResponse(res, "Deleted multiple files", {
      deleted: keys.length,
      keys
    });
  } catch (error) {
    return sendResponse(res, 500, "Delete many error", error);
  }
});

export default router;