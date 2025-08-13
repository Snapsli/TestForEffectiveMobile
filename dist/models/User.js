import { Schema, model } from "mongoose";
export const roles = ["admin", "user"];
const userSchema = new Schema({
    fullName: { type: String, required: true, trim: true },
    birthDate: { type: Date, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: roles, default: "user", index: true },
    isActive: { type: Boolean, default: true, index: true },
    followers: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    following: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
userSchema.virtual("id").get(function () { return this._id.toString(); });
userSchema.virtual("followersCount").get(function () { return Array.isArray(this.followers) ? this.followers.length : 0; });
userSchema.virtual("followingCount").get(function () { return Array.isArray(this.following) ? this.following.length : 0; });
export const User = model("User", userSchema);
