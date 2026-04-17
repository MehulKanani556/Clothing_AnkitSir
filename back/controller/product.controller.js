import mongoose from "mongoose";
import MainCategoryModel from "../model/mainCategory.model.js";
import CategoryModel from "../model/category.model.js";
import SubCategoryModel from "../model/subCategory.model.js";
import InsideSubCategoryModel from "../model/insideSubCategory.model.js";
import productModel from "../model/product.model.js";
import ProductVariant from "../model/productVariant.model.js";
import { ThrowError } from "../utils/Error.utils.js";
import { sendBadRequestResponse, sendNotFoundResponse, sendSuccessResponse, sendForbiddenResponse } from "../utils/Response.utils.js";
import { slugify } from "../utils/slug.config.js";
import { deleteManyFromS3 } from "../middleware/imageupload.js";

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      mainCategory,
      category,
      subCategory,
      sizechart,
      tags,
      productDetails,
      sizeGuide,
      deliveryReturns,
      brand,
      badge,
      material,
      careInstructions,
      countryOfOrigin,
      isActive,
      isFeatured,
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
    const existing = await productModel.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    const productData = {
      name,
      brand: brand || null,
      mainCategory,
      category,
      subCategory,
      insideSubCategory,
      sizechart: sizechart || null,
      badge: badge || null,
      tags: tags || [],
      slug,
      productDetails,
      sizeGuide: sizeGuide || null,
      deliveryReturns,
      material: material || null,
      careInstructions: careInstructions || null,
      countryOfOrigin: countryOfOrigin || null,
      isActive: isActive ?? true,
      isFeatured: isFeatured ?? false,
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

    // Delete all variants and their S3 images
    const variants = await ProductVariant.find({ productId: id });
    if (variants.length > 0) {
      const allImageKeys = variants.flatMap(v =>
        (v.images || []).map(url => {
          const split = url.split(".amazonaws.com/");
          return split.length > 1 ? split[1] : null;
        }).filter(Boolean)
      );
      if (allImageKeys.length > 0) await deleteManyFromS3(allImageKeys);
      await ProductVariant.deleteMany({ productId: id });
    }

    return sendSuccessResponse(res, "Product and all its variants deleted successfully!", deletedProduct);

  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};

// GET /product/filter-options?mainCategorySlug=&categorySlug=&subCategorySlug=
// Returns available colors, sizes, materials, sub-categories with counts for the filter panel
export const getFilterOptions = async (req, res) => {
  try {
    const { mainCategorySlug, categorySlug, subCategorySlug } = req.query;

    const filter = { isActive: true };

    if (mainCategorySlug) {
      const mainCat = await MainCategoryModel.findOne({ slug: mainCategorySlug });
      if (mainCat) filter.mainCategory = mainCat._id;
    }
    if (categorySlug) {
      const cat = await CategoryModel.findOne({ slug: categorySlug });
      if (cat) filter.category = cat._id;
    }
    if (subCategorySlug) {
      const subCat = await SubCategoryModel.findOne({ slug: subCategorySlug });
      if (subCat) filter.subCategory = subCat._id;
    }

    const products = await productModel.find(filter, "_id material variants").populate("variants", "color colorCode options stock isActive");

    // Aggregate filter options
    const colorMap = {};
    const sizeMap = {};
    const materialMap = {};
    let inStockCount = 0;
    let outOfStockCount = 0;

    for (const product of products) {
      // Material
      if (product.material) {
        materialMap[product.material] = (materialMap[product.material] || 0) + 1;
      }

      let productHasStock = false;
      for (const variant of (product.variants || [])) {
        if (!variant.isActive) continue;

        // Color
        const colorKey = variant.color;
        if (colorKey) {
          if (!colorMap[colorKey]) colorMap[colorKey] = { count: 0, colorCode: variant.colorCode };
          colorMap[colorKey].count++;
        }

        // Sizes
        if (variant.options?.length > 0) {
          for (const opt of variant.options) {
            sizeMap[opt.size] = (sizeMap[opt.size] || 0) + 1;
            if (opt.stock > 0) productHasStock = true;
          }
        } else if (variant.stock > 0) {
          productHasStock = true;
        }
      }

      if (productHasStock) inStockCount++;
      else outOfStockCount++;
    }

    const colors = Object.entries(colorMap).map(([name, data]) => ({ name, colorCode: data.colorCode, count: data.count }))
      .sort((a, b) => b.count - a.count);
    const sizes = Object.entries(sizeMap).map(([name, count]) => ({ name, count }))
      .sort((a, b) => {
        const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
        const ai = order.indexOf(a.name), bi = order.indexOf(b.name);
        if (ai !== -1 && bi !== -1) return ai - bi;
        if (ai !== -1) return -1;
        if (bi !== -1) return 1;
        return a.name.localeCompare(b.name);
      });
    const materials = Object.entries(materialMap).map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return sendSuccessResponse(res, "Filter options fetched successfully!", {
      availability: { inStock: inStockCount, outOfStock: outOfStockCount },
      colors,
      sizes,
      materials,
      total: products.length,
    });
  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};

// GET /product/by-category?mainCategorySlug=&categorySlug=&subCategorySlug=&page=1&limit=12&sort=newest
export const getProductsByCategory = async (req, res) => {
  try {
    const { mainCategorySlug, categorySlug, subCategorySlug, page = 1, limit = 12, sort = "newest",
      colors, sizes, materials, availability } = req.query;

    const filter = { isActive: true };

    if (mainCategorySlug) {
      const mainCat = await MainCategoryModel.findOne({ slug: mainCategorySlug });
      if (!mainCat) return sendNotFoundResponse(res, "Main category not found!");
      filter.mainCategory = mainCat._id;
    }

    if (categorySlug) {
      const cat = await CategoryModel.findOne({ slug: categorySlug });
      if (!cat) return sendNotFoundResponse(res, "Category not found!");
      filter.category = cat._id;
    }

    if (subCategorySlug) {
      const subCat = await SubCategoryModel.findOne({ slug: subCategorySlug });
      if (!subCat) return sendNotFoundResponse(res, "Sub category not found!");
      filter.subCategory = subCat._id;
    }

    // Material filter
    if (materials) {
      const materialList = materials.split(',').map(m => m.trim()).filter(Boolean);
      if (materialList.length) filter.material = { $in: materialList };
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      popular: { view: -1 },
      bestseller: { sold: -1 },
    };
    const sortQuery = sortMap[sort] || sortMap.newest;

    // Color / size / availability filters require variant-level filtering
    const colorList = colors ? colors.split(',').map(c => c.trim()).filter(Boolean) : [];
    const sizeList = sizes ? sizes.split(',').map(s => s.trim()).filter(Boolean) : [];
    const availabilityFilter = availability; // 'inStock' | 'outOfStock' | undefined

    let productIds = null;
    if (colorList.length || sizeList.length || availabilityFilter) {
      const variantFilter = {};
      if (colorList.length) variantFilter.color = { $in: colorList };
      if (sizeList.length) variantFilter['options.size'] = { $in: sizeList };

      const matchingVariants = await ProductVariant.find(variantFilter, 'productId stock options');

      // Availability filter
      let filteredVariants = matchingVariants;
      if (availabilityFilter === 'inStock') {
        filteredVariants = matchingVariants.filter(v => {
          if (v.options?.length > 0) return v.options.some(o => o.stock > 0);
          return (v.stock || 0) > 0;
        });
      } else if (availabilityFilter === 'outOfStock') {
        filteredVariants = matchingVariants.filter(v => {
          if (v.options?.length > 0) return v.options.every(o => (o.stock || 0) === 0);
          return (v.stock || 0) === 0;
        });
      }

      productIds = [...new Set(filteredVariants.map(v => v.productId.toString()))];
      if (productIds.length === 0) {
        return sendSuccessResponse(res, "Products fetched successfully!", {
          products: [],
          pagination: { total: 0, page: parseInt(page), limit: parseInt(limit), totalPages: 0 },
        });
      }
      filter._id = { $in: productIds };
    } else if (availabilityFilter) {
      // availability only, no color/size filter
      const allVariants = await ProductVariant.find({}, 'productId stock options');
      let filteredVariants = allVariants;
      if (availabilityFilter === 'inStock') {
        filteredVariants = allVariants.filter(v => {
          if (v.options?.length > 0) return v.options.some(o => o.stock > 0);
          return (v.stock || 0) > 0;
        });
      } else if (availabilityFilter === 'outOfStock') {
        filteredVariants = allVariants.filter(v => {
          if (v.options?.length > 0) return v.options.every(o => (o.stock || 0) === 0);
          return (v.stock || 0) === 0;
        });
      }
      const ids = [...new Set(filteredVariants.map(v => v.productId.toString()))];
      filter._id = { $in: ids };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await productModel.countDocuments(filter);

    const products = await productModel.find(filter)
      .populate("mainCategory", "mainCategoryName slug")
      .populate("category", "categoryName slug")
      .populate("subCategory", "subCategoryName slug")
      .populate("variants")
      .sort(sortQuery)
      .skip(skip)
      .limit(parseInt(limit));

    return sendSuccessResponse(res, "Products fetched successfully!", {
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
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

