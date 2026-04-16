import mongoose from "mongoose";
import CategoryModel from "../model/category.model.js";
import SubCategoryModel from "../model/subCategory.model.js";
import { ThrowError } from "../utils/Error.utils.js"
import { sendBadRequestResponse, sendNotFoundResponse, sendSuccessResponse } from "../utils/Response.utils.js"
import MainCategoryModel from "../model/mainCategory.model.js";
import { uploadFile, deleteFileFromS3 } from "../middleware/imageupload.js";

export const createSubCategory = async (req, res) => {
  try {
    const { subCategoryName, categoryId, mainCategoryId, attributes } = req.body;

    if (!subCategoryName || !categoryId || !mainCategoryId) {
      return sendBadRequestResponse(res, "subCategoryName, categoryId, and mainCategoryId are required!!!")
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return sendBadRequestResponse(res, "Invalid categoryId!");
    }

    if (!mongoose.Types.ObjectId.isValid(mainCategoryId)) {
      return sendBadRequestResponse(res, "Invalid mainCategoryId!!!")
    }

    const checkMainCategory = await MainCategoryModel.findById(mainCategoryId)
    if (!checkMainCategory) {
      return sendBadRequestResponse(res, "MainCategory not exists!!!")
    }

    const checkCategory = await CategoryModel.findById(categoryId)
    if (!checkCategory) {
      return sendBadRequestResponse(res, "Category not exists!!!")
    }

    const checkSubCategory = await SubCategoryModel.findOne({ subCategoryName })
    if (checkSubCategory) {
      return sendBadRequestResponse(res, "This SubCategory already added...")
    }

    let imageUrl = "";
    if (req.file) {
      const uploadResult = await uploadFile(req.file);
      imageUrl = uploadResult.url;
    }

    const newSubCategory = await SubCategoryModel.create({
      mainCategoryId,
      categoryId,
      subCategoryName,
      subCategoryImage: imageUrl,
      attributes: attributes ? JSON.parse(attributes) : []
    })

    return sendSuccessResponse(res, "SubCategory added successfully...", newSubCategory)

  } catch (error) {
    return ThrowError(res, 500, error.message)
  }
}

export const getAllSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategoryModel.find({})
      .populate("mainCategoryId")
      .populate("categoryId")

    if (!subCategory || subCategory.length === 0) {
      return sendNotFoundResponse(res, "No SubCategory found!!!")
    }

    return sendSuccessResponse(res, "SubCategory fetched Successfully...", subCategory)

  } catch (error) {
    return ThrowError(res, 500, error.message)
  }
}

export const getSubCategoryById = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendBadRequestResponse(res, "Invalid SubCategoryId!!!")
    }

    const subCategory = await SubCategoryModel.findById(id)
      .populate("mainCategoryId")
      .populate("categoryId")

    if (!subCategory) {
      return sendNotFoundResponse(res, "SubCategory Not found...")
    }

    return sendSuccessResponse(res, "SubCategory fetched Successfully...", subCategory)

  } catch (error) {
    return ThrowError(res, 500, error.message)
  }
}

export const updateSubCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const { subCategoryName, categoryId, mainCategoryId, attributes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendBadRequestResponse(res, "Invalid SubCategoryId!!!");
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return sendBadRequestResponse(res, "Invalid categoryId!");
    }

    if (!mongoose.Types.ObjectId.isValid(mainCategoryId)) {
      return sendBadRequestResponse(res, "Invalid mainCategoryId!!!")
    }

    const checkMainCategory = await MainCategoryModel.findById(mainCategoryId)
    if (!checkMainCategory) {
      return sendBadRequestResponse(res, "MainCategory not exists!!!")
    }

    const checkCategory = await CategoryModel.findById(categoryId)
    if (!checkCategory) {
      return sendBadRequestResponse(res, "Category not exists!!!")
    }

    const existingSubCategory = await SubCategoryModel.findById(id);
    if (!existingSubCategory) {
      return sendNotFoundResponse(res, "SubCategory Not found...");
    }

    let imageUrl = existingSubCategory.subCategoryImage;
    if (req.file) {
      if (existingSubCategory.subCategoryImage) {
        await deleteFileFromS3(existingSubCategory.subCategoryImage);
      }
      const uploadResult = await uploadFile(req.file);
      imageUrl = uploadResult.url;
    }

    const updateData = {
      subCategoryName,
      categoryId,
      mainCategoryId,
      subCategoryImage: imageUrl
    };

    if (attributes) {
      updateData.attributes = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;
    }

    const updatedSubCategory = await SubCategoryModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedSubCategory) {
      return sendNotFoundResponse(res, "SubCategory Not found...");
    }

    return sendSuccessResponse(res, "SubCategory updated Successfully...", updatedSubCategory);

  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};

export const deleteSubCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendBadRequestResponse(res, "Invalid SubCategoryId!!!");
    }

    const subCategoryToDelete = await SubCategoryModel.findById(id);
    if (!subCategoryToDelete) {
      return sendNotFoundResponse(res, "SubCategory Not found...");
    }

    if (subCategoryToDelete.subCategoryImage) {
      await deleteFileFromS3(subCategoryToDelete.subCategoryImage);
    }

    const deletedSubCategory = await SubCategoryModel.findByIdAndDelete(id);

    if (!deletedSubCategory) {
      return sendNotFoundResponse(res, "SubCategory Not found...");
    }

    return sendSuccessResponse(res, "SubCategory deleted Successfully...", deletedSubCategory);

  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
}

export const getSubCategoriesByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return sendBadRequestResponse(res, "Invalid categoryId!!!")
    }

    const subCategories = await SubCategoryModel.find({ categoryId })
      .populate("mainCategoryId")
      .populate("categoryId")

    if (!subCategories || subCategories.length === 0) {
      return sendNotFoundResponse(res, "No SubCategories found for this Category!!!")
    }

    return sendSuccessResponse(res, "SubCategories fetched successfully...", subCategories)

  } catch (error) {
    return ThrowError(res, 500, error.message)
  }
}