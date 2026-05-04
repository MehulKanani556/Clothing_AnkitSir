import mongoose from "mongoose";
import lookbookModel from "../model/lookbook.model.js";
import { ThrowError } from "../utils/Error.utils.js";
import { sendBadRequestResponse, sendNotFoundResponse, sendSuccessResponse, sendForbiddenResponse } from "../utils/Response.utils.js";
import { slugify } from "../utils/slug.config.js";
import { uploadFile, deleteFileFromS3 } from "../middleware/imageupload.js";

export const createLookbook = async (req, res) => {
  try {
    const { title, description, products, isActive, displayOrder } = req.body;

    if (req.user.role !== "admin") {
      return sendForbiddenResponse(res, "Access denied. Only admin can create lookbooks!");
    }

    if (!title || !req.file) {
      return sendBadRequestResponse(res, "Title and Look Image are required!");
    }

    const uploadResult = await uploadFile(req.file);
    const lookImage = uploadResult.url;

    let slug = slugify(title);
    const existing = await lookbookModel.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    const productsArray = products ? (typeof products === 'string' ? JSON.parse(products) : products) : [];

    const lookbook = await lookbookModel.create({
      title,
      slug,
      description,
      lookImage,
      products: productsArray,
      isActive: isActive ?? true,
      displayOrder: displayOrder || 0,
    });

    return sendSuccessResponse(res, "Lookbook created successfully!", lookbook);
  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};

export const getAllLookbooks = async (req, res) => {
  try {
    const lookbooks = await lookbookModel.find({ isActive: true })
      .populate({
        path: 'products',
        populate: { path: 'variants' }
      })
      .sort({ displayOrder: 1, createdAt: -1 });

    return sendSuccessResponse(res, "Lookbooks fetched successfully!", lookbooks);
  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};

export const getAllLookbooksAdmin = async (req, res) => {
  try {
    const lookbooks = await lookbookModel.find({})
      .populate('products')
      .sort({ createdAt: -1 });

    return sendSuccessResponse(res, "Lookbooks fetched successfully!", lookbooks);
  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};

export const getLookbookBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const lookbook = await lookbookModel.findOne({ slug, isActive: true })
      .populate({
        path: 'products',
        populate: { path: 'variants' }
      });

    if (!lookbook) {
      return sendNotFoundResponse(res, "Lookbook not found!");
    }

    return sendSuccessResponse(res, "Lookbook fetched successfully!", lookbook);
  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};

export const updateLookbook = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (req.user.role !== "admin") {
      return sendForbiddenResponse(res, "Access denied. Only admin can update lookbooks!");
    }

    const existingLookbook = await lookbookModel.findById(id);
    if (!existingLookbook) {
      return sendNotFoundResponse(res, "Lookbook not found!");
    }

    if (req.file) {
      if (existingLookbook.lookImage) {
        await deleteFileFromS3(existingLookbook.lookImage);
      }
      const uploadResult = await uploadFile(req.file);
      updateData.lookImage = uploadResult.url;
    }

    if (updateData.title) {
      updateData.slug = slugify(updateData.title);
      const existing = await lookbookModel.findOne({ slug: updateData.slug, _id: { $ne: id } });
      if (existing) updateData.slug = `${updateData.slug}-${Date.now()}`;
    }

    if (updateData.products) {
      updateData.products = typeof updateData.products === 'string' ? JSON.parse(updateData.products) : updateData.products;
    }

    const lookbook = await lookbookModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    return sendSuccessResponse(res, "Lookbook updated successfully!", lookbook);
  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};

export const deleteLookbook = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "admin") {
      return sendForbiddenResponse(res, "Access denied. Only admin can delete lookbooks!");
    }

    const lookbook = await lookbookModel.findByIdAndDelete(id);

    if (!lookbook) {
      return sendNotFoundResponse(res, "Lookbook not found!");
    }

    return sendSuccessResponse(res, "Lookbook deleted successfully!", lookbook);
  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};
