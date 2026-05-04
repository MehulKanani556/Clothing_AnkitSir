import mongoose from "mongoose";

const categoryRuleSchema = new mongoose.Schema({
  sourceCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategory",
    required: true,
    unique: true,
  },
  suggestedCategories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
    }
  ],
  isActive: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

const CategoryRule = mongoose.model("CategoryRule", categoryRuleSchema);
export default CategoryRule;
