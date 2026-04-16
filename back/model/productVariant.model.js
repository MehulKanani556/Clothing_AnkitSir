import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  sku: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  size: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  finalPrice: {
    type: Number,
    min: 0
  }
});

// Calculate final price before saving
optionSchema.pre('save', function (next) {
  if (this.discount > 0) {
    this.finalPrice = this.price - (this.price * this.discount / 100);
  } else {
    this.finalPrice = this.price;
  }
  next();
});

const productVariantSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true
    },
    color: {
      type: String,
      required: true,
      trim: true
    },
    colorCode: {
      type: String,
      trim: true,
      default: null
    },
    images: {
      type: [String],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: 'At least one image is required'
      }
    },
    isDefault: {
      type: Boolean,
      default: false,
      index: true
    },
    price: {
      type: Number,
      default: null,
      min: 0
    },
    stock: {
      type: Number,
      default: null,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    finalPrice: {
      type: Number,
      min: 0
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    options: [optionSchema],
    weight: {
      type: Number,
      default: null,
      min: 0
    },
    dimensions: {
      length: { type: Number, default: null },
      width: { type: Number, default: null },
      height: { type: Number, default: null }
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound indexes for better query performance
productVariantSchema.index({ productId: 1, color: 1 });
productVariantSchema.index({ productId: 1, isDefault: 1 });
productVariantSchema.index({ isActive: 1, createdAt: -1 });

// Virtual for total stock
productVariantSchema.virtual('totalStock').get(function () {
  if (this.options && this.options.length > 0) {
    return this.options.reduce((total, opt) => total + (opt.stock || 0), 0);
  }
  return this.stock || 0;
});

// Generate SKU before saving
productVariantSchema.pre('save', async function (next) {
  try {
    // Calculate final price for single variant
    if (this.price && this.discount > 0) {
      this.finalPrice = this.price - (this.price * this.discount / 100);
    } else if (this.price) {
      this.finalPrice = this.price;
    }

    // Generate SKU if not provided
    if (!this.sku && this.isNew) {
      const Product = mongoose.model('Product');
      const product = await Product.findById(this.productId)
        .populate('mainCategory')
        .populate('category')
        .populate('subCategory');

      if (product) {
        // Generate 4-digit random number
        const randomDigits = Math.floor(1000 + Math.random() * 9000);

        // Get first 3 letters of each category (uppercase)
        const mainCat = (product.mainCategory?.mainCategoryName || 'XXX').substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
        const cat = (product.category?.categoryName || 'XXX').substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
        const subCat = (product.subCategory?.subCategoryName || 'XXX').substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');

        // Get first 3 letters of product name
        const prodName = (product.name || 'XXX').substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');

        // Get first 3 letters of color
        const colorCode = (this.color || 'XXX').substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');

        // Format: MAINCAT-CAT-SUBCAT-NAME-COLOR-XXXX
        this.sku = `${mainCat}-${cat}-${subCat}-${prodName}-${colorCode}-${randomDigits}`;

        // Ensure uniqueness
        let skuExists = await mongoose.model('ProductVariant').findOne({ sku: this.sku });
        while (skuExists) {
          const newRandomDigits = Math.floor(1000 + Math.random() * 9000);
          this.sku = `${mainCat}-${cat}-${subCat}-${prodName}-${colorCode}-${newRandomDigits}`;
          skuExists = await mongoose.model('ProductVariant').findOne({ sku: this.sku });
        }
      }
    }

    // Generate SKU for each option if not provided
    if (this.options && this.options.length > 0) {
      for (let option of this.options) {
        if (!option.sku) {
          const baseSku = this.sku || 'VAR';
          const sizeCode = option.size.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, 'X');
          const randomDigits = Math.floor(1000 + Math.random() * 9000);
          option.sku = `${baseSku}-${sizeCode}-${randomDigits}`;

          // Ensure option SKU uniqueness
          let optionSkuExists = await mongoose.model('ProductVariant').findOne({
            'options.sku': option.sku
          });
          while (optionSkuExists) {
            const newRandomDigits = Math.floor(1000 + Math.random() * 9000);
            option.sku = `${baseSku}-${sizeCode}-${newRandomDigits}`;
            optionSkuExists = await mongoose.model('ProductVariant').findOne({
              'options.sku': option.sku
            });
          }
        }
      }
    }

    // Ensure only one default variant per product
    if (this.isDefault) {
      await mongoose.model('ProductVariant').updateMany(
        { productId: this.productId, _id: { $ne: this._id } },
        { $set: { isDefault: false } }
      );
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Static method to get variant by SKU
productVariantSchema.statics.findBySku = function (sku) {
  return this.findOne({ sku }).populate('productId');
};

// Static method to get variants by product
productVariantSchema.statics.findByProduct = function (productId) {
  return this.find({ productId, isActive: true }).sort({ isDefault: -1, createdAt: -1 });
};

// Instance method to check stock availability
productVariantSchema.methods.hasStock = function (size = null, quantity = 1) {
  if (size && this.options && this.options.length > 0) {
    const option = this.options.find(opt => opt.size === size);
    return option && option.stock >= quantity;
  }
  return this.stock >= quantity;
};

// Instance method to reduce stock
productVariantSchema.methods.reduceStock = async function (size = null, quantity = 1) {
  if (size && this.options && this.options.length > 0) {
    const option = this.options.find(opt => opt.size === size);
    if (option && option.stock >= quantity) {
      option.stock -= quantity;
      await this.save();
      return true;
    }
    return false;
  }

  if (this.stock >= quantity) {
    this.stock -= quantity;
    await this.save();
    return true;
  }
  return false;
};

const ProductVariant = mongoose.model("ProductVariant", productVariantSchema);
export default ProductVariant;