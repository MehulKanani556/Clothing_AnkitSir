import mongoose from "mongoose";
import updateProductBadge from "../cron/badgeUpdater.js";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  brand: {
    type: String,
    default: null,
    trim: true,
  },
  mainCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MainCategory",
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategory",
    required: true,
  },
  insideSubCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "insideSubCategory",
    default: null,
  },
  sizechart: {
    type: String,
    default: null,
  },
  badge: {
    type: String,
    enum: ["NEW", "FAV", "RESTOCK", "LIMITED", "RARE", "BEST", null],
    default: "NEW"
  },
  tags: [
    {
      type: String,
      default: [],
    },
  ],
  variants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant",
      default: [],
    },
  ],
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  productDetails: {
    description: { type: String, default: null },
    points: [{ type: String, default: [] }]
  },
  sizeGuide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "sizeGuide",
    default: null,
  },
  deliveryReturns: {
    description: { type: String, default: null },
    points: [{ type: String, default: [] }]
  },
  material: {
    type: String,
    default: null,
  },
  careInstructions: {
    type: String,
    default: null,
  },
  countryOfOrigin: {
    type: String,
    default: null,
  },
  view: { type: Number, default: 0 },
  sold: { type: Number, default: 0 },
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  gender: {
    type: String,
    enum: ["Men", "Women", "Unisex"],
    default: "Unisex",
  },
}, { timestamps: true });

productSchema.post("save", async function (doc) {
  await updateProductBadge(doc._id);
});

const productModel = mongoose.model("Product", productSchema);

export default productModel;
