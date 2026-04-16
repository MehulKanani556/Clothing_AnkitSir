import mongoose from "mongoose";
import MainCategoryModel from "../model/mainCategory.model.js";
import CategoryModel from "../model/category.model.js";
import { ThrowError } from "../utils/Error.utils.js"
import { sendBadRequestResponse, sendNotFoundResponse, sendSuccessResponse } from "../utils/Response.utils.js"
import { uploadFile, deleteFileFromS3 } from "../middleware/imageupload.js";

export const createCategory = async (req, res) => {
  try {
    const { categoryName, mainCategoryId, attributes } = req.body;

    if (!categoryName || !mainCategoryId) {
      return sendBadRequestResponse(res, "categoryName & mainCategoryId are required!!!")
    }

    if (!mongoose.Types.ObjectId.isValid(mainCategoryId)) {
      return sendBadRequestResponse(res, "Invalid mainCategoryId!!!")
    }

    const checkMainCategory = await MainCategoryModel.findById(mainCategoryId)
    if (!checkMainCategory) {
      return sendBadRequestResponse(res, "MainCategory not exists!!!")
    }

    const checkCategory = await CategoryModel.findOne({ categoryName })
    if (checkCategory) {
      return sendBadRequestResponse(res, "This Category already added...")
    }

    let imageUrl = "";
    if (req.file) {
      const uploadResult = await uploadFile(req.file);
      imageUrl = uploadResult.url;
    }

    const newCategory = await CategoryModel.create({
      mainCategoryId,
      categoryName,
      categoryImage: imageUrl,
      attributes: attributes ? JSON.parse(attributes) : []
    })

    return sendSuccessResponse(res, "Category added successfully...", newCategory)

  } catch (error) {
    return ThrowError(res, 500, error.message)
  }
}

export const getAllCategory = async (req, res) => {
  try {
    const category = await CategoryModel.find({}).populate("mainCategoryId")

    if (!category || category.length === 0) {
      return sendNotFoundResponse(res, "No category found!!!")
    }

    return sendSuccessResponse(res, "Category fetched Successfully...", category)

  } catch (error) {
    return ThrowError(res, 500, error.message)
  }
}

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendBadRequestResponse(res, "Invalid CategoryId!!!")
    }

    const category = await CategoryModel.findById(id).populate("mainCategoryId")
    if (!category) {
      return sendNotFoundResponse(res, "Category Not found...")
    }

    return sendSuccessResponse(res, "Category fetched Successfully...", category)

  } catch (error) {
    return ThrowError(res, 500, error.message)
  }
}

export const updateCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName, mainCategoryId, attributes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendBadRequestResponse(res, "Invalid category id!");
    }

    if (!mongoose.Types.ObjectId.isValid(mainCategoryId)) {
      return sendBadRequestResponse(res, "Invalid mainCategoryId!!!")
    }

    const checkMainCategory = await MainCategoryModel.findById(mainCategoryId)
    if (!checkMainCategory) {
      return sendBadRequestResponse(res, "MainCategory not exists!!!")
    }

    const existingCategory = await CategoryModel.findById(id);
    if (!existingCategory) {
      return sendNotFoundResponse(res, "Category Not found...");
    }

    let imageUrl = existingCategory.categoryImage;
    if (req.file) {
      if (existingCategory.categoryImage) {
        await deleteFileFromS3(existingCategory.categoryImage);
      }
      const uploadResult = await uploadFile(req.file);
      imageUrl = uploadResult.url;
    }

    const updateData = {
      categoryName,
      mainCategoryId,
      categoryImage: imageUrl
    };

    if (attributes) {
      updateData.attributes = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;
    }

    const updatedCategory = await CategoryModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return sendNotFoundResponse(res, "Category Not found...");
    }

    return sendSuccessResponse(res, "Category updated successfully!", updatedCategory);

  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};

export const deleteCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendBadRequestResponse(res, "Invalid CategoryId!!!");
    }

    const categoryToDelete = await CategoryModel.findById(id);
    if (!categoryToDelete) {
      return sendNotFoundResponse(res, "Category Not found...");
    }

    if (categoryToDelete.categoryImage) {
      await deleteFileFromS3(categoryToDelete.categoryImage);
    }

    const deletedCategory = await CategoryModel.findByIdAndDelete(id);

    if (!deletedCategory) {
      return sendNotFoundResponse(res, "Category Not found...");
    }

    return sendSuccessResponse(res, "Category deleted Successfully...", deletedCategory);

  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
}

export const getCategoriesByMainCategoryId = async (req, res) => {
  try {
    const { mainCategoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(mainCategoryId)) {
      return sendBadRequestResponse(res, "Invalid mainCategoryId!!!")
    }

    const categories = await CategoryModel.find({ mainCategoryId })
      .populate("mainCategoryId")

    if (!categories || categories.length === 0) {
      return sendNotFoundResponse(res, "No categories found for this MainCategory!!!")
    }

    return sendSuccessResponse(res, "Categories fetched successfully...", categories)

  } catch (error) {
    return ThrowError(res, 500, error.message)
  }
}
