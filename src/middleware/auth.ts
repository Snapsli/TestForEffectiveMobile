import type { Request, Response, NextFunction } from "express";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export type JwtPayload = { sub: string; role: "admin" | "user" };

export function issueToken(payload: JwtPayload) {
  const secret: Secret = env.JWT_SECRET as unknown as Secret;
  // jsonwebtoken typings expect number | specific time string template
  const expiresStr = env.JWT_EXPIRES_IN;
  const maybeNum = Number(expiresStr);
  const expiresIn: SignOptions['expiresIn'] = Number.isFinite(maybeNum) ? maybeNum : (expiresStr as any);
  const opts: SignOptions = { expiresIn };
  return jwt.sign(payload, secret, opts);
}

export function requireAuth(req: Request & { user?: JwtPayload }, res: Response, next: NextFunction) {
  const cookieToken = (req as any).cookies?.token;
  const header = req.headers.authorization;
  let token: string | undefined;
  if (cookieToken) token = cookieToken;
  else if (header && header.startsWith("Bearer ")) token = header.slice("Bearer ".length);
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
