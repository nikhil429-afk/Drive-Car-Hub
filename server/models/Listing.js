import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    // Basic Vehicle Info
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    price: { type: Number, required: true },
    mileage: { type: Number, required: true },
    description: { type: String, required: true },
    
    // New Fields for Seller
    vehicleNumber: { type: String, required: true }, // Registration number
    chassisNumber: { type: String }, // Optional
    ownerName: { type: String, required: true },
    ownerContactNumber: { type: String, required: true },
    condition: { type: String, enum: ["Excellent", "Good", "Fair", "Poor"], default: "Good" },
    
    // Images
    imageUrls: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    
    // Ownership & Status
    sellerUid: { type: String, required: true },
    buyerUid: { type: String },
    purchaseDate: { type: Date },
    
    // Verification
    verificationStatus: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
    rejectionReason: { type: String }, // Reason for rejection if status is rejected
    status: { type: String, enum: ["available", "sold"], default: "available" },
    
    // Commission tracking
    sellerAmount: { type: Number }, // 98% of sale price
    adminCommission: { type: Number }, // 2% of sale price
  },
  { timestamps: true },
);

export default mongoose.model("Listing", listingSchema);
// module.exports = mongoose.model("Listing", listingSchema);
