import { Schema, model, InferSchemaType } from "mongoose";

export const roles = ["admin", "user"] as const;
export type Role = typeof roles[number];

const userSchema = new Schema({
  fullName: { type: String, required: true, trim: true },
  birthDate: { type: Date, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: roles, default: "user", index: true },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

userSchema.virtual("id").get(function (this: any) { return this._id.toString(); });

export type UserDoc = InferSchemaType<typeof userSchema> & { id: string };
export const User = model("User", userSchema);
