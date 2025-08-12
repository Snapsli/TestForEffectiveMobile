import type { Request, Response, NextFunction } from "express";

export function requireRole(role: "admin") {
  return (req: Request & { user?: { role: "admin" | "user" } }, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (req.user.role !== role) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}
