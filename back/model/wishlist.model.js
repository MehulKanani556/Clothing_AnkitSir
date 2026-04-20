import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                productVariantId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "ProductVariant",
                    required: false,
                },
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.model("Wishlist", wishlistSchema);