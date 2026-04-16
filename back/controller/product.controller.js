import mongoose from "mongoose";
import MainCategoryModel from "../model/mainCategory.model.js";
import CategoryModel from "../model/category.model.js";
import SubCategoryModel from "../model/subCategory.model.js";
import InsideSubCategoryModel from "../model/insideSubCategory.model.js";
import productModel from "../model/product.model.js";
import { ThrowError } from "../utils/Error.utils.js";
import { sendBadRequestResponse, sendNotFoundResponse, sendSuccessResponse, sendForbiddenResponse } from "../utils/Response.utils.js";
import { slugify } from "../utils/slug.config.js";

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      mainCategory,
      category,
      subCategory,
      sizechart,
      badges,
      tags,
      productDetails,
      sizeGuide,
      deliveryReturns
    } = req.body;

    // Normalize optional ObjectId fields — empty string → null
    const insideSubCategory = req.body.insideSubCategory || null;

    if (req.user.role !== "admin") {
      return sendForbiddenResponse(res, "Access denied. Only admin can create products!");
    }

    if (!name || !mainCategory || !category || !subCategory) {
      return sendBadRequestResponse(res, "name, mainCategory, category, and subCategory are required!");
    }

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(mainCategory) ||
      !mongoose.Types.ObjectId.isValid(category) ||
      !mongoose.Types.ObjectId.isValid(subCategory)) {
      return sendBadRequestResponse(res, "Invalid category IDs!");
    }

    if (insideSubCategory && !mongoose.Types.ObjectId.isValid(insideSubCategory)) {
      return sendBadRequestResponse(res, "Invalid insideSubCategory ID!");
    }

    if (sizeGuide && !mongoose.Types.ObjectId.isValid(sizeGuide)) {
      return sendBadRequestResponse(res, "Invalid sizeGuide ID!");
    }

    // Check if categories exist
    const [mainCatExists, catExists, subCatExists] = await Promise.all([
      MainCategoryModel.findById(mainCategory),
      CategoryModel.findById(category),
      SubCategoryModel.findById(subCategory)
    ]);

    if (!mainCatExists) return sendNotFoundResponse(res, "Main Category not found!");
    if (!catExists) return sendNotFoundResponse(res, "Category not found!");
    if (!subCatExists) return sendNotFoundResponse(res, "Sub Category not found!");

    if (insideSubCategory) {
      const insideSubCatExists = await InsideSubCategoryModel.findById(insideSubCategory);
      if (!insideSubCatExists) return sendNotFoundResponse(res, "Inside Sub Category not found!");
    }

    // Slug generation
    let slug = slugify(name);

    // Ensure slug is unique
    let existing = await productModel.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const productData = {
      name,
      mainCategory,
      category,
      subCategory,
      insideSubCategory,
      sizechart,
      badges: badges || [],
      tags: tags || [],
      slug,
      productDetails,
      sizeGuide: sizeGuide || null,
      deliveryReturns
    };

    const newProduct = await productModel.create(productData);

    return sendSuccessResponse(res, "Product created successfully!", newProduct);

  } catch (error) {
    console.error("Create Product Error:", error);
    return ThrowError(res, 500, error.message);
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await productModel.find({})
      .populate("mainCategory", "mainCategoryName")
      .populate("category", "categoryName")
      .populate("subCategory", "subCategoryName")
      .populate("insideSubCategory", "insideSubCategoryName")
      .populate("sizeGuide", "name")
      .populate("variants")
      .sort({ createdAt: -1 });

    if (!products || products.length === 0) {
      return sendNotFoundResponse(res, "No products found!");
    }

    return sendSuccessResponse(res, "Products fetched successfully!", products);

  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendBadRequestResponse(res, "Invalid Product ID!");
    }

    const product = await productModel.findById(id)
      .populate("mainCategory")
      .populate("category")
      .populate("subCategory")
      .populate("insideSubCategory")
      .populate("sizeGuide")
      .populate("variants");

    if (!product) {
      return sendNotFoundResponse(res, "Product not found!");
    }

    return sendSuccessResponse(res, "Product fetched successfully!", product);

  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};

export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await productModel.findOne({ slug })
      .populate("mainCategory")
      .populate("category")
      .populate("subCategory")
      .populate("insideSubCategory")
      .populate("sizeGuide");

    if (!product) {
      return sendNotFoundResponse(res, "Product not found!");
    }

    return sendSuccessResponse(res, "Product fetched successfully!", product);

  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendBadRequestResponse(res, "Invalid Product ID!");
    }

    if (req.user.role !== "admin") {
      return sendForbiddenResponse(res, "Access denied. Only admin can update products!");
    }

    // Strip empty string ObjectId fields to avoid cast errors
    const objectIdFields = ['insideSubCategory', 'sizeGuide', 'mainCategory', 'category', 'subCategory'];
    objectIdFields.forEach(field => {
      if (updateData[field] === '' || updateData[field] === null) {
        updateData[field] = null;
      }
    });

    if (updateData.name) {
      updateData.slug = slugify(updateData.name);

      // Slug uniqueness check on update
      const existing = await productModel.findOne({ slug: updateData.slug, _id: { $ne: id } });
      if (existing) {
        updateData.slug = `${updateData.slug}-${Date.now()}`;
      }
    }

    // --- Category Validation ---
    if (updateData.mainCategory) {
      if (!mongoose.Types.ObjectId.isValid(updateData.mainCategory)) return sendBadRequestResponse(res, "Invalid Main Category ID!");
      if (!(await MainCategoryModel.findById(updateData.mainCategory))) return sendNotFoundResponse(res, "Main Category not found!");
    }

    if (updateData.category) {
      if (!mongoose.Types.ObjectId.isValid(updateData.category)) return sendBadRequestResponse(res, "Invalid Category ID!");
      if (!(await CategoryModel.findById(updateData.category))) return sendNotFoundResponse(res, "Category not found!");
    }

    if (updateData.subCategory) {
      if (!mongoose.Types.ObjectId.isValid(updateData.subCategory)) return sendBadRequestResponse(res, "Invalid Sub Category ID!");
      if (!(await SubCategoryModel.findById(updateData.subCategory))) return sendNotFoundResponse(res, "Sub Category not found!");
    }

    if (updateData.insideSubCategory) {
      if (!mongoose.Types.ObjectId.isValid(updateData.insideSubCategory)) return sendBadRequestResponse(res, "Invalid Inside Sub Category ID!");
      if (!(await InsideSubCategoryModel.findById(updateData.insideSubCategory))) return sendNotFoundResponse(res, "Inside Sub Category not found!");
    }

    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return sendNotFoundResponse(res, "Product not found!");
    }

    return sendSuccessResponse(res, "Product updated successfully!", updatedProduct);

  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendBadRequestResponse(res, "Invalid Product ID!");
    }

    if (req.user.role !== "admin") {
      return sendForbiddenResponse(res, "Access denied. Only admin can delete products!");
    }

    const deletedProduct = await productModel.findByIdAndDelete(id);

    if (!deletedProduct) {
      return sendNotFoundResponse(res, "Product not found!");
    }

    return sendSuccessResponse(res, "Product deleted successfully!", deletedProduct);

  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};

export const searchProducts = async (req, res) => {
  try {
    const {
      q,
      mainCategoryId,
      categoryId,
      subCategoryId,
      insideSubCategoryId
    } = req.query;

    const filter = { isActive: true };

    if (q) {
      filter.name = { $regex: q, $options: "i" };
    }

    if (insideSubCategoryId && mongoose.Types.ObjectId.isValid(insideSubCategoryId)) {
      filter.insideSubCategory = insideSubCategoryId;
    } else if (subCategoryId && mongoose.Types.ObjectId.isValid(subCategoryId)) {
      filter.subCategory = subCategoryId;
    } else if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      filter.category = categoryId;
    } else if (mainCategoryId && mongoose.Types.ObjectId.isValid(mainCategoryId)) {
      filter.mainCategory = mainCategoryId;
    }

    const products = await productModel.find(filter)
      .populate("mainCategory")
      .populate("category")
      .populate("subCategory")
      .populate("insideSubCategory")
      .populate("variants")
      .sort({ createdAt: -1 });

    return sendSuccessResponse(res, "Products searched successfully!", products);
  } catch (error) {
    console.error("Search Products Error:", error);
    return ThrowError(res, 500, error.message);
  }
};

