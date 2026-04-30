import mongoose from "mongoose";
const threadSchema = new mongoose.Schema({
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    listingTitle: { type: String, required: true },
    buyerUid: { type: String, required: true },
    sellerUid: { type: String, required: true },
    buyerEmail: { type: String, required: true },
    sellerEmail: { type: String, required: true },
    lastMessage: { type: String },
    lastTimestamp: { type: Number, default: Date.now }
}, { timestamps: true });

// module.exports = mongoose.model('Thread', threadSchema);
export default mongoose.model("Thread", threadSchema);