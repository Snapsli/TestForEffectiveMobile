import { Schema, model } from "mongoose";
export const roles = ["admin", "user"];
const userSchema = new Schema({
    fullName: { type: String, required: true, trim: true },
    birthDate: { type: Date, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: roles, default: "user", index: true },
    isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
userSchema.virtual("id").get(function () { return this._id.toString(); });
export const User = model("User", userSchema);
