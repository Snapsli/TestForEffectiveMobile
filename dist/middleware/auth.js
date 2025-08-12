import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
export function issueToken(payload) {
    const secret = env.JWT_SECRET;
    // jsonwebtoken typings expect number | specific time string template
    const expiresStr = env.JWT_EXPIRES_IN;
    const maybeNum = Number(expiresStr);
    const expiresIn = Number.isFinite(maybeNum) ? maybeNum : expiresStr;
    const opts = { expiresIn };
    return jwt.sign(payload, secret, opts);
}
export function requireAuth(req, res, next) {
    const cookieToken = req.cookies?.token;
    const header = req.headers.authorization;
    let token;
    if (cookieToken)
        token = cookieToken;
    else if (header && header.startsWith("Bearer "))
        token = header.slice("Bearer ".length);
    if (!token)
        return res.status(401).json({ error: "Unauthorized" });
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch {
        return res.status(401).json({ error: "Invalid token" });
    }
}
