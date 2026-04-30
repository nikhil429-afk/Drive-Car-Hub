import mongoose from "mongoose";
const messageSchema = new mongoose.Schema({
    threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Thread', required: true },
    senderUid: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Number, default: Date.now }
}, { timestamps: true });

//module.exports = mongoose.model('Message', messageSchema);
export default mongoose.model("Message", messageSchema);