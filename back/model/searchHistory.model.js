import mongoose from "mongoose";

const searchHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    query: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    count: {
        type: Number,
        default: 1
    }
}, { timestamps: true });

// Index for faster searching and aggregation
searchHistorySchema.index({ query: 1 });
searchHistorySchema.index({ userId: 1 });

const SearchHistory = mongoose.model("SearchHistory", searchHistorySchema);
export default SearchHistory;
