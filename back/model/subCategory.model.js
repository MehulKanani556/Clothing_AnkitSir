import mongoose from "mongoose";
import { slugify } from "../utils/slug.config.js";

const subCategorySchema = mongoose.Schema({
  mainCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MainCategory"
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  },
  subCategoryName: {
    type: String,
    default: null
  },
  slug: {
    type: String,
    unique: true,
    index: true
  },
  subCategoryImage: {
    type: String,
    default: ""
  },
  attributes: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['size', 'color', 'material', 'style', 'other'],
      default: 'other'
    },
    values: [String],
    isRequired: {
      type: Boolean,
      default: false
    }
  }]
}, { timestamps: true })

subCategorySchema.pre('save', function (next) {
  if (this.isModified('subCategoryName') || !this.slug) {
    this.slug = slugify(this.subCategoryName);
  }
  next();
});

export default mongoose.model("SubCategory", subCategorySchema)