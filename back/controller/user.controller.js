import mongoose from "mongoose";
import axios from "axios";
import UserModel from "../model/user.model.js";
import transporter from "../utils/Email.config.js";
import { sendBadRequestResponse, sendErrorResponse, sendNotFoundResponse, sendSuccessResponse } from "../utils/Response.utils.js";

export const userAddressAddController = async (req, res) => {
    try {
        const id = req.user.id || req.user._id;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return sendBadRequestResponse(res, "Invalid User Id in Token!");
        }

        const {
            country,
            firstName,
            lastName,
            address,
            aptSuite,
            city,
            state,
            zipcode
        } = req.body;

        if (!firstName || !lastName || !zipcode || !address) {
            return sendBadRequestResponse(res, "All required fields must be provided!");
        }

        // Auto-fill city/state if missing
        let autoCity = city;
        let autoState = state;
        if (/^\d{6}$/.test(zipcode)) {
            try {
                const pinResp = await axios.get(`https://api.postalpincode.in/pincode/${zipcode}`);
                const pinData = pinResp.data[0];
                if (pinData.Status === "Success" && pinData.PostOffice && pinData.PostOffice.length > 0) {
                    autoCity = city || pinData.PostOffice[0].District;
                    autoState = state || pinData.PostOffice[0].State;
                } else {
                    return sendBadRequestResponse(res, "Invalid or inactive zipcode!");
                }
            } catch (err) {
                console.log("Zipcode fetching error:", err.message);
            }
        }

        // Build address as Mongoose subdocument
        const newAddress = {
            country: country || "Australia", // assuming Aus by image layout/earlier Stripe AUD code
            firstName,
            lastName,
            address,
            aptSuite,
            city: autoCity,
            state: autoState,
            zipcode
        };

        const user = await UserModel.findById(id);
        if (!user) return sendBadRequestResponse(res, "User not found!");

        // Push the new address and get its subdocument reference
        const addedAddress = user.address.create(newAddress); // create subdocument
        user.address.push(addedAddress);

        // If it's the first address, auto-select it
        if (user.address.length === 1) {
            user.selectedAddress = addedAddress._id;
        }

        await user.save(); // Save once

        return sendSuccessResponse(res, "User Address inserted successfully", user);
    } catch (error) {
        console.error("Error in userAddressAddController:", error);
        return sendErrorResponse(res, 500, "Something went wrong while adding address!", error.message);
    }
};

export const userAddressUpdateController = async (req, res) => {
    try {
        const id = req.user?.id || req.user?._id;
        const { addressId } = req?.params;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return sendBadRequestResponse(res, "Invalid User Id in Token!");
        }

        if (!addressId || !mongoose.Types.ObjectId.isValid(addressId)) {
            return sendBadRequestResponse(res, "Valid addressId must be provided!");
        }

        const {
            country,
            firstName,
            lastName,
            address,
            aptSuite,
            city,
            state,
            zipcode
        } = req?.body;

        const updateFields = {};
        if (country) updateFields["address.$.country"] = country;
        if (firstName) updateFields["address.$.firstName"] = firstName;
        if (lastName) updateFields["address.$.lastName"] = lastName;
        if (address) updateFields["address.$.address"] = address;
        if (aptSuite) updateFields["address.$.aptSuite"] = aptSuite;
        if (city) updateFields["address.$.city"] = city;
        if (state) updateFields["address.$.state"] = state;
        if (zipcode) updateFields["address.$.zipcode"] = zipcode;

        // Prepare update query
        let updateQuery = { $set: updateFields };

        const updatedUser = await UserModel.findOneAndUpdate(
            { _id: id, "address._id": addressId },
            updateQuery,
            { new: true }
        );

        if (!updatedUser) {
            return sendBadRequestResponse(res, "Address not found or update failed!");
        }

        return sendSuccessResponse(res, "User address updated successfully!", updatedUser);
    } catch (error) {
        console.error("Error in userAddressUpdateController:", error.message);
        return sendErrorResponse(res, 500, "Something went wrong while updating address!", error.message);
    }
};

export const userAddressDeleteController = async (req, res) => {
    try {
        const id = req.user?.id || req.user?._id;
        const { addressId } = req?.params;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return sendBadRequestResponse(res, "Invalid or missing User ID from token!");
        }

        if (!addressId || !mongoose.Types.ObjectId.isValid(addressId)) {
            return sendBadRequestResponse(res, "Invalid or missing Address ID!");
        }

        const user = await UserModel.findById(id);
        if (!user) {
            return sendNotFoundResponse(res, "User not found!");
        }

        const addressExists = user.address?.some(addr => addr._id.toString() === addressId);
        if (!addressExists) {
            return sendNotFoundResponse(res, "Address not found!");
        }

        let updateQuery = { $pull: { address: { _id: addressId } } };
        if (user.selectedAddress?.toString() === addressId) {
            updateQuery.$set = {
                selectedAddress: null
            };
        }

        const updatedUser = await UserModel.findByIdAndUpdate(id, updateQuery, { new: true });

        return sendSuccessResponse(res, "Address deleted successfully", updatedUser);
    } catch (error) {
        console.error("Error while deleting user address:", error.message);
        return sendErrorResponse(res, 500, "Error during address deletion!", error.message);
    }
};

export const getUserAddressController = async (req, res) => {
    try {
        const id = req.user?.id || req.user?._id;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return sendBadRequestResponse(res, "Invalid or missing User ID from token!");
        }

        const user = await UserModel.findById(id).select("address selectedAddress");
        if (!user) {
            return sendNotFoundResponse(res, "User not found!");
        }

        if (!user.address || user.address.length === 0) {
            return sendSuccessResponse(res, "No addresses found for this user!", {
                total: 0,
                selectedAddressId: null,
                selectedAddress: null,
                addresses: []
            });
        }

        const selectedAddress = user.address.find(
            a => a._id.toString() === user.selectedAddress?.toString()
        );

        return sendSuccessResponse(res, "User addresses fetched successfully", {
            total: user.address.length,
            selectedAddressId: user.selectedAddress,
            selectedAddress: selectedAddress || user.address[0], // fallback to first address
            addresses: user.address
        });
    } catch (error) {
        return sendErrorResponse(res, 500, "Error while getting user addresses!", error.message);
    }
};

export const selectAddressController = async (req, res) => {
    try {
        const id = req.user?.id || req.user?._id;
        const { addressId } = req.params;

        const user = await UserModel.findById(id);
        if (!user) return sendNotFoundResponse(res, "User not found");

        const addressExists = user.address?.some(addr => addr._id.toString() === addressId);
        if (!addressExists) {
            return sendNotFoundResponse(res, "Address not found in your profile!");
        }

        user.selectedAddress = addressId;
        await user.save();

        return sendSuccessResponse(res, "Address selected successfully", user);
    } catch (err) {
        return sendErrorResponse(res, 500, "Error selecting address", err.message);
    }
};

export const addSavedCardController = async (req, res) => {
    try {
        const id = req.user?.id || req.user?._id;
        const { cardNumber, cardHolderName, expiryDate, cvv } = req.body;

        if (!cardNumber || !expiryDate || !cvv) {
            return sendBadRequestResponse(res, "Card Number, Expiry Date, and CVV are required!");
        }

        const user = await UserModel.findById(id);
        if (!user) return sendNotFoundResponse(res, "User not found");

        // Simple duplicate check based on last 4 digits to prevent stacking same card multiple times conceptually
        const isDuplicate = user.savedCards.some(card => card.cardNumber === cardNumber);
        if (isDuplicate) {
            return sendBadRequestResponse(res, "This card is already saved in your profile!");
        }

        const newCard = {
            cardNumber,
            cardHolderName: cardHolderName || "Unknown",
            expiryDate,
            cvv,
            cardType: "Card"
        };
        const addedCard = user.savedCards.create(newCard);
        user.savedCards.push(addedCard);

        if (user.savedCards.length === 1) {
            user.selectedCard = addedCard._id;
        }

        await user.save();
        return sendSuccessResponse(res, "Card saved successfully!", { addedCard });
    } catch (err) {
        return sendErrorResponse(res, 500, "Error saving card", err.message);
    }
};

export const getSavedCardsController = async (req, res) => {
    try {
        const id = req.user?.id || req.user?._id;
        const user = await UserModel.findById(id);

        if (!user) {
            return sendNotFoundResponse(res, "User not found");
        }

        const savedCards = user.savedCards.map(card => ({
            _id: card._id,
            cardNumber: `**** **** **** ${card.cardNumber.slice(-4)}`,
            cardHolderName: card.cardHolderName,
            expiryDate: card.expiryDate,
            cardType: card.cardType
        }));

        if (!user.savedCards || user.savedCards.length === 0) {
            return sendSuccessResponse(res, "No saved cards found!", {
                total: 0,
                selectedCardId: null,
                selectedCard: null,
                cards: []
            });
        }

        const selectedCard = savedCards.find(
            c => c._id.toString() === user.selectedCard?.toString()
        );

        return sendSuccessResponse(res, "Saved cards fetched successfully", {
            total: savedCards.length,
            selectedCardId: user.selectedCard,
            selectedCard: selectedCard || savedCards[0],
            cards: savedCards
        });

    } catch (error) {
        console.error("Get Saved Cards Error:", error.message);
        return sendErrorResponse(res, 500, "Error fetching saved cards", error.message);
    }
};

export const deleteSavedCardController = async (req, res) => {
    try {
        const id = req.user?.id || req.user?._id;
        const { cardId } = req.params;

        const user = await UserModel.findById(id);

        if (!user) {
            return sendNotFoundResponse(res, "User not found");
        }

        const cardIndex = user.savedCards.findIndex(card => card._id.toString() === cardId);

        if (cardIndex === -1) {
            return sendNotFoundResponse(res, "Card not found");
        }

        user.savedCards.splice(cardIndex, 1);

        if (user.selectedCard && user.selectedCard.toString() === cardId) {
            user.selectedCard = null;
        }

        await user.save();

        return sendSuccessResponse(res, "Card deleted successfully");

    } catch (error) {
        console.error("Delete Saved Card Error:", error.message);
        return sendErrorResponse(res, 500, "Error deleting saved card", error.message);
    }
};

export const selectCardController = async (req, res) => {
    try {
        const id = req.user?.id || req.user?._id;
        const { cardId } = req.params;

        const user = await UserModel.findById(id);
        if (!user) return sendNotFoundResponse(res, "User not found");

        const cardExists = user.savedCards?.some(card => card._id.toString() === cardId);
        if (!cardExists) {
            return sendNotFoundResponse(res, "Card not found in your profile!");
        }

        user.selectedCard = cardId;
        await user.save();

        return sendSuccessResponse(res, "Card selected successfully", user);
    } catch (err) {
        return sendErrorResponse(res, 500, "Error selecting card", err.message);
    }
};

export const updateProfileController = async (req, res) => {
    try {
        const id = req.user.id || req.user._id;
        const { firstName, lastName, email } = req.body;

        const user = await UserModel.findById(id);
        if (!user) return sendNotFoundResponse(res, "User not found!");

        let emailChanged = false;
        if (email && email !== user.email) {
            const existing = await UserModel.findOne({ email });
            if (existing && existing._id.toString() !== id.toString()) {
                return sendBadRequestResponse(res, "Email already in use by another account!");
            }
            user.email = email;
            user.emailVerified = false;
            emailChanged = true;
        }

        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;

        let mailSentMsg = "";

        if (emailChanged) {
            const otp = Math.floor(1000 + Math.random() * 9000);
            const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

            user.otp = otp;
            user.resetOtpExpiry = otpExpiry;

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Verify Your Email Address",
                html: `<p>Your email verification OTP is: <strong>${otp}</strong>.</p><p>It will expire in 5 minutes.</p>`
            };

            try {
                await transporter.sendMail(mailOptions);
                mailSentMsg = " OTP sent to your new email.";
            } catch (mailErr) {
                console.error("Error sending email OTP on profile update:", mailErr);
            }
        }

        await user.save();

        // return the updated sensitive info without OTPs
        const updatedUser = user.toObject();
        delete updatedUser.otp;
        delete updatedUser.resetOtpExpiry;
        delete updatedUser.password;

        return sendSuccessResponse(res, "Profile updated successfully!" + mailSentMsg, updatedUser);
    } catch (e) {
        return sendErrorResponse(res, 500, "Error updating profile", e.message);
    }
};

export const sendEmailOtpController = async (req, res) => {
    try {
        const id = req.user.id || req.user._id;
        const { email } = req.body;

        const user = await UserModel.findById(id);
        if (!user) return sendNotFoundResponse(res, "User not found!");

        const targetEmail = email || user.email;
        if (!targetEmail) {
            return sendBadRequestResponse(res, "Please provide an email address to verify.");
        }

        const existing = await UserModel.findOne({ email: targetEmail });
        if (existing && existing._id.toString() !== id.toString()) {
            return sendBadRequestResponse(res, "Email already in use by another account!");
        }

        const otp = Math.floor(1000 + Math.random() * 9000);
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

        user.otp = otp;
        user.resetOtpExpiry = otpExpiry;

        if (email && email !== user.email) {
            user.email = targetEmail;
            user.emailVerified = false;
        }

        await user.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: targetEmail,
            subject: "Verify Your Email Address",
            html: `<p>Your email verification OTP is: <strong>${otp}</strong>.</p><p>It will expire in 5 minutes.</p>`
        };

        await transporter.sendMail(mailOptions);

        return sendSuccessResponse(res, "Email verification OTP sent successfully!");
    } catch (e) {
        console.error("sendEmailOtpController error:", e.message);
        return sendErrorResponse(res, 500, "Error sending email OTP", e.message);
    }
};

export const verifyEmailOtpController = async (req, res) => {
    try {
        const id = req.user.id || req.user._id;
        const { otp } = req.body;

        if (!otp) return sendBadRequestResponse(res, "OTP is required!");

        const user = await UserModel.findById(id);
        if (!user) return sendNotFoundResponse(res, "User not found!");

        if (!user.otp || user.otp !== Number(otp) || new Date() > user.resetOtpExpiry) {
            return sendBadRequestResponse(res, "Invalid or expired OTP!");
        }

        user.emailVerified = true;
        user.otp = null;
        user.resetOtpExpiry = null;
        await user.save();

        const updatedUser = user.toObject();
        delete updatedUser.otp;
        delete updatedUser.resetOtpExpiry;
        delete updatedUser.password;

        return sendSuccessResponse(res, "Email verified successfully!", updatedUser);
    } catch (e) {
        return sendErrorResponse(res, 500, "Error verifying email OTP", e.message);
    }
};