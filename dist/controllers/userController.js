import createError from "http-errors";
import { z } from "zod";
import { User } from "../models/User.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
// Me (self)
export async function getMe(req, res) {
    const requester = req.user;
    const user = await User.findById(requester.sub).lean();
    if (!user)
        return res.status(404).json({ error: "User not found" });
    const { passwordHash, _id, ...safe } = user;
    return res.json({ id: _id.toString(), followersCount: user.followers?.length || 0, followingCount: user.following?.length || 0, ...safe });
}
// 3. Get user by ID (admin or self)
export async function getUserById(req, res) {
    const { id } = req.params;
    const requester = req.user;
    if (requester.role !== "admin" && requester.sub !== id)
        return res.status(403).json({ error: "Forbidden" });
    const user = await User.findById(id).lean();
    if (!user)
        throw createError(404, "User not found");
    const { passwordHash, _id, ...safe } = user;
    return res.json({ id: _id.toString(), followersCount: user.followers?.length || 0, followingCount: user.following?.length || 0, ...safe });
}
// 4. List users (admin only)
export async function listUsers(_req, res) {
    const users = await User.find().select("-passwordHash").lean();
    return res.json(users.map((u) => ({ ...u, id: u._id.toString(), followersCount: u.followers?.length || 0, followingCount: u.following?.length || 0 })));
}
// 5. Block user (admin or self)
export async function blockUser(req, res) {
    const { id } = req.params;
    const requester = req.user;
    if (requester.role !== "admin" && requester.sub !== id)
        return res.status(403).json({ error: "Forbidden" });
    const user = await User.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!user)
        return res.status(404).json({ error: "User not found" });
    return res.json({ message: "User blocked", id: user.id, isActive: user.isActive });
}
// Unblock user (admin or self)
export async function unblockUser(req, res) {
    const { id } = req.params;
    const requester = req.user;
    if (requester.role !== "admin" && requester.sub !== id)
        return res.status(403).json({ error: "Forbidden" });
    const user = await User.findByIdAndUpdate(id, { isActive: true }, { new: true });
    if (!user)
        return res.status(404).json({ error: "User not found" });
    return res.json({ message: "User unblocked", id: user.id, isActive: user.isActive });
}
// Update profile (self or admin)
const updateProfileSchema = z.object({
    fullName: z.string().min(3).optional(),
    birthDate: z.coerce.date().optional(),
    email: z.string().email().optional(),
    role: z.enum(["admin", "user"]).optional(), // only admin can change role
});
export async function updateProfile(req, res) {
    const { id } = req.params;
    const requester = req.user;
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    if (requester.role !== "admin" && requester.sub !== id)
        return res.status(403).json({ error: "Forbidden" });
    const data = parsed.data;
    if (data.role && requester.role !== "admin")
        return res.status(403).json({ error: "Only admin can change role" });
    if (data.email) {
        const existing = await User.findOne({ email: data.email, _id: { $ne: id } });
        if (existing)
            return res.status(409).json({ error: "Email already in use" });
    }
    const user = await User.findByIdAndUpdate(id, data, { new: true, select: "-passwordHash" });
    if (!user)
        return res.status(404).json({ error: "User not found" });
    return res.json({ id: user.id, ...user.toObject() });
}
// Change password (self only)
const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
});
export async function changePassword(req, res) {
    const { id } = req.params;
    const requester = req.user;
    if (requester.sub !== id)
        return res.status(403).json({ error: "Only the user can change own password" });
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const user = await User.findById(id);
    if (!user)
        return res.status(404).json({ error: "User not found" });
    const ok = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
    if (!ok)
        return res.status(401).json({ error: "Current password is incorrect" });
    user.passwordHash = await hashPassword(parsed.data.newPassword);
    await user.save();
    return res.json({ message: "Password updated" });
}
// Follow user (self follows another user)
export async function followUser(req, res) {
    const { id: targetId } = req.params;
    const requester = req.user;
    if (requester.sub === targetId)
        return res.status(400).json({ error: "Cannot follow yourself" });
    const [me, target] = await Promise.all([
        User.findById(requester.sub),
        User.findById(targetId),
    ]);
    if (!me || !target)
        return res.status(404).json({ error: "User not found" });
    const alreadyFollowing = me.following.some((x) => x.toString() === target.id);
    if (alreadyFollowing)
        return res.json({ message: "Already following" });
    me.following.push(target._id);
    target.followers.push(me._id);
    await Promise.all([me.save(), target.save()]);
    return res.json({ message: "Followed", targetId: target.id });
}
// Unfollow user
export async function unfollowUser(req, res) {
    const { id: targetId } = req.params;
    const requester = req.user;
    if (requester.sub === targetId)
        return res.status(400).json({ error: "Cannot unfollow yourself" });
    const [me, target] = await Promise.all([
        User.findById(requester.sub),
        User.findById(targetId),
    ]);
    if (!me || !target)
        return res.status(404).json({ error: "User not found" });
    me.following = me.following.filter((x) => x.toString() !== target.id);
    target.followers = target.followers.filter((x) => x.toString() !== me.id);
    await Promise.all([me.save(), target.save()]);
    return res.json({ message: "Unfollowed", targetId: target.id });
}
// Explore users (list for any authenticated user, includes follow state)
export async function exploreUsers(req, res) {
    const requester = req.user;
    const me = await User.findById(requester.sub).select("following").lean();
    if (!me)
        return res.status(404).json({ error: "User not found" });
    const followingSet = new Set((me.following || []).map((x) => x.toString()));
    const users = await User.find().select("-passwordHash").lean();
    const list = users
        .filter((u) => u._id.toString() !== requester.sub)
        .map((u) => ({
        id: u._id.toString(),
        fullName: u.fullName,
        birthDate: u.birthDate,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
        followersCount: u.followers?.length || 0,
        followingCount: u.following?.length || 0,
        isFollowed: followingSet.has(u._id.toString()),
    }));
    return res.json(list);
}
