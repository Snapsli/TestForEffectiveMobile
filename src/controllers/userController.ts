import { Request, Response } from "express";
import createError from "http-errors";
import { z } from "zod";
import { User } from "../models/User.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

// Me (self)
export async function getMe(req: Request & { user?: { sub: string; role: string } }, res: Response) {
  const requester = req.user!;
  const user = await User.findById(requester.sub).lean();
  if (!user) return res.status(404).json({ error: "User not found" });
  const { passwordHash, _id, ...safe } = user as any;
  return res.json({ id: _id.toString(), ...safe });
}

// 3. Get user by ID (admin or self)
export async function getUserById(req: Request & { user?: { sub: string; role: string } }, res: Response) {
  const { id } = req.params;
  const requester = req.user!;
  if (requester.role !== "admin" && requester.sub !== id) return res.status(403).json({ error: "Forbidden" });

  const user = await User.findById(id).lean();
  if (!user) throw createError(404, "User not found");

  const { passwordHash, _id, ...safe } = user as any;
  return res.json({ id: _id.toString(), ...safe });
}

// 4. List users (admin only)
export async function listUsers(_req: Request, res: Response) {
  const users = await User.find().select("-passwordHash").lean();
  return res.json(users.map((u: any) => ({ ...u, id: (u as any)._id.toString() })));
}

// 5. Block user (admin or self)
export async function blockUser(req: Request & { user?: { sub: string; role: string } }, res: Response) {
  const { id } = req.params;
  const requester = req.user!;
  if (requester.role !== "admin" && requester.sub !== id) return res.status(403).json({ error: "Forbidden" });

  const user = await User.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({ message: "User blocked", id: user.id, isActive: user.isActive });
}

// Unblock user (admin or self)
export async function unblockUser(req: Request & { user?: { sub: string; role: string } }, res: Response) {
  const { id } = req.params;
  const requester = req.user!;
  if (requester.role !== "admin" && requester.sub !== id) return res.status(403).json({ error: "Forbidden" });

  const user = await User.findByIdAndUpdate(id, { isActive: true }, { new: true });
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({ message: "User unblocked", id: user.id, isActive: user.isActive });
}

// Update profile (self or admin)
const updateProfileSchema = z.object({
  fullName: z.string().min(3).optional(),
  birthDate: z.coerce.date().optional(),
  email: z.string().email().optional(),
  role: z.enum(["admin","user"]).optional(), // only admin can change role
});

export async function updateProfile(req: Request & { user?: { sub: string; role: string } }, res: Response) {
  const { id } = req.params;
  const requester = req.user!;
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  if (requester.role !== "admin" && requester.sub !== id) return res.status(403).json({ error: "Forbidden" });
  const data: any = parsed.data;

  if (data.role && requester.role !== "admin") return res.status(403).json({ error: "Only admin can change role" });

  if (data.email) {
    const existing = await User.findOne({ email: data.email, _id: { $ne: id } });
    if (existing) return res.status(409).json({ error: "Email already in use" });
  }

  const user = await User.findByIdAndUpdate(id, data, { new: true, select: "-passwordHash" });
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({ id: user.id, ...user.toObject() });
}

// Change password (self only)
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export async function changePassword(req: Request & { user?: { sub: string; role: string } }, res: Response) {
  const { id } = req.params;
  const requester = req.user!;
  if (requester.sub !== id) return res.status(403).json({ error: "Only the user can change own password" });

  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const user = await User.findById(id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const ok = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Current password is incorrect" });

  user.passwordHash = await hashPassword(parsed.data.newPassword);
  await user.save();
  return res.json({ message: "Password updated" });
}
