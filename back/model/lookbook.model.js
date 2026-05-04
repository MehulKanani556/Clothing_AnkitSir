import mongoose from "mongoose";

const lookbookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    trim: true,
  },
  lookImage: {
    type: String,
    required: true,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    }
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  displayOrder: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

// Ensure no more than 4 products are linked to a single lookbook entry
lookbookSchema.path('products').validate(function (value) {
  return value.length <= 4;
}, 'A lookbook can have a maximum of 4 products.');

const lookbookModel = mongoose.model("Lookbook", lookbookSchema);
export default lookbookModel;
