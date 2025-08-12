import { z } from "zod";
import { User } from "../models/User.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { issueToken } from "../middleware/auth.js";
const registerSchema = z.object({
    fullName: z.string().min(3),
    birthDate: z.coerce.date(),
    email: z.string().email(),
    password: z.string().min(6),
});
export async function register(req, res) {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const { fullName, birthDate, email, password } = parsed.data;
    const exists = await User.findOne({ email });
    if (exists)
        return res.status(409).json({ error: "Email already in use" });
    const passwordHash = await hashPassword(password);
    const user = await User.create({ fullName, birthDate, email, passwordHash, role: "user", isActive: true });
    const token = issueToken({ sub: user.id, role: user.role });
    // set cookie for admin-panel compatibility
    res.cookie("token", token, { httpOnly: true, sameSite: "lax", secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.status(201).json({
        id: user.id,
        fullName: user.fullName,
        birthDate: user.birthDate,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        token,
    });
}
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
export async function login(req, res) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const { email, password } = parsed.data;
    const user = await User.findOne({ email });
    if (!user)
        return res.status(401).json({ error: "Invalid credentials" });
    if (!user.isActive)
        return res.status(403).json({ error: "User is blocked" });
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok)
        return res.status(401).json({ error: "Invalid credentials" });
    const token = issueToken({ sub: user.id, role: user.role });
    res.cookie("token", token, { httpOnly: true, sameSite: "lax", secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.json({ token });
}
export async function logout(_req, res) {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
}
