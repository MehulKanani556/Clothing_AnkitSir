import mongoose from "mongoose";
import newsLetterModel from "../model/newsLetter.model.js";
import { sendBadRequestResponse, sendErrorResponse, sendSuccessResponse } from "../utils/Response.utils.js";

export const newsLetterController = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return sendBadRequestResponse(res, "Email is required!");
        }
        const newsLetter = await newsLetterModel.create({ email });
        return sendSuccessResponse(res, "NewsLetter added successfully!", newsLetter);
    } catch (error) {
        console.error("Error in newsLetterController:", error);
        return sendErrorResponse(res, 500, "Something went wrong while adding newsLetter!", error.message);
    }
}

export const getAllNewsLetter = async (req, res) => {
    try {
        const newsLetter = await newsLetterModel.find();

        if (newsLetter.length === 0) {
            return sendBadRequestResponse(res, "No any NewsLetter found...")
        }

        return sendSuccessResponse(res, "NewsLetter fetched successfully!", newsLetter);
    } catch (error) {
        console.error("Error in getAllNewsLetter:", error);
        return sendErrorResponse(res, 500, "Something went wrong while fetching newsLetter!", error.message);
    }
}

export const deleteNewsLetter = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return sendBadRequestResponse(res, "NewsLetter ID is required!");
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendBadRequestResponse(res, "NewsLetter ID is InValid!");
        }

        const newsLetter = await newsLetterModel.findByIdAndDelete(id);
        if (!newsLetter) {
            return sendBadRequestResponse(res, "NewsLetter not found!");
        }
        return sendSuccessResponse(res, "NewsLetter deleted successfully!", newsLetter);
    } catch (error) {
        console.error("Error in deleteNewsLetter:", error);
        return sendErrorResponse(res, 500, "Something went wrong while deleting newsLetter!", error.message);
    }
}