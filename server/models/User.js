import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Optional for Google OAuth users
    googleId: { type: String, default: undefined }, // Google OAuth ID
    authProvider: { type: String, default: "local" },
    isVerified: { type: Boolean, default: false },
    profileImage: { type: String, default: "" },
    cart: { type: Array, default: [] },
    mobileNumber: {
        type: String,
        default: undefined,
        validate: {
            validator: (value) => !value || /^[6-9]\d{9}$/.test(value),
            message: "Mobile number must be 10 digits and start with 6, 7, 8, or 9.",
        },
    },
    isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("User", userSchema);