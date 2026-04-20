import mongoose from "mongoose";
import contactModel from "../model/contact.model.js";
import { sendBadRequestResponse, sendSuccessResponse, sendErrorResponse } from "../utils/Response.utils.js";

export const addContact = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return sendBadRequestResponse(res, "All fields are required!");
        }
        const contact = await contactModel.create({ name, email, message });
        return sendSuccessResponse(res, "Contact added successfully!", contact);
    } catch (error) {
        console.error("Error in addContact:", error);
        return sendErrorResponse(res, 500, "Something went wrong while adding contact!", error.message);
    }
}

export const getAllContact = async (req, res) => {
    try {
        const contacts = await contactModel.find();

        if (contacts.length === 0) {
            return sendBadRequestResponse(res, "No any Contact Found...")
        }

        return sendSuccessResponse(res, "Contacts fetched successfully!", contacts);
    } catch (error) {
        console.error("Error in getAllContact:", error);
        return sendErrorResponse(res, 500, "Something went wrong while fetching contacts!", error.message);
    }
}

export const getContactById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return sendBadRequestResponse(res, "Contact ID is required!");
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendBadRequestResponse(res, "Contact ID is InValid!");
        }

        const contact = await contactModel.findById(id);
        if (!contact) {
            return sendBadRequestResponse(res, "Contact Not Found!");
        }
        return sendSuccessResponse(res, "Contact fetched successfully!", contact);
    } catch (error) {
        console.error("Error in getContactById:", error);
        return sendErrorResponse(res, 500, "Something went wrong while fetching contact!", error.message);
    }
}

export const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return sendBadRequestResponse(res, "Contact ID is required!");
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendBadRequestResponse(res, "Contact ID is InValid!");
        }

        const contact = await contactModel.findByIdAndDelete(id);
        if (!contact) {
            return sendBadRequestResponse(res, "Contact not found!");
        }
        return sendSuccessResponse(res, "Contact deleted successfully!", contact);
    } catch (error) {
        console.error("Error in deleteContact:", error);
        return sendErrorResponse(res, 500, "Something went wrong while deleting contact!", error.message);
    }
}


export const addSupport = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !subject || !message) {
            return sendBadRequestResponse(res, "All fields are required!");
        }
        const contact = await contactModel.create({ name, email, subject, message });
        return sendSuccessResponse(res, "Contact added successfully!", contact);
    } catch (error) {
        console.error("Error in addContact:", error);
        return sendErrorResponse(res, 500, "Something went wrong while adding contact!", error.message);
    }
}

export const getAllSupport = async (req, res) => {
    try {
        const contacts = await contactModel.find();

        if (contacts.length === 0) {
            return sendBadRequestResponse(res, "No any Contact Found...")
        }

        return sendSuccessResponse(res, "Contacts fetched successfully!", contacts);
    } catch (error) {
        console.error("Error in getAllContact:", error);
        return sendErrorResponse(res, 500, "Something went wrong while fetching contacts!", error.message);
    }
}

export const getSupportById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return sendBadRequestResponse(res, "Contact ID is required!");
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendBadRequestResponse(res, "Contact ID is InValid!");
        }

        const contact = await contactModel.findById(id);
        if (!contact) {
            return sendBadRequestResponse(res, "Contact Not Found!");
        }
        return sendSuccessResponse(res, "Contact fetched successfully!", contact);
    } catch (error) {
        console.error("Error in getContactById:", error);
        return sendErrorResponse(res, 500, "Something went wrong while fetching contact!", error.message);
    }
}

export const deleteSupport = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return sendBadRequestResponse(res, "Contact ID is required!");
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendBadRequestResponse(res, "Contact ID is InValid!");
        }

        const contact = await contactModel.findByIdAndDelete(id);
        if (!contact) {
            return sendBadRequestResponse(res, "Contact not found!");
        }
        return sendSuccessResponse(res, "Contact deleted successfully!", contact);
    } catch (error) {
        console.error("Error in deleteContact:", error);
        return sendErrorResponse(res, 500, "Something went wrong while deleting contact!", error.message);
    }
}