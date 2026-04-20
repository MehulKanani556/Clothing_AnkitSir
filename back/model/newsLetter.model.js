import mongoose from "mongoose";
import { sendSuccessResponse } from "../utils/Response.utils.js";

const newsLetterSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        match: [/.+@.+\..+/, "Please enter a valid email address"]
    }
}, {
    timestamps: true
});

const newsLetterModel = mongoose.model("NewsLetter", newsLetterSchema);

export default newsLetterModel;