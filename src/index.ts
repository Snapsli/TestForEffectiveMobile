import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { connectDB } from "./db.js";
import { authRouter } from "./routes/auth.js";
import { usersRouter } from "./routes/users.js";
import { httpLogger } from "./middleware/logger.js";
import { User } from "./models/User.js";
import { hashPassword } from "./utils/password.js";

const app = express();
app.use(httpLogger);
app.use(helmet());
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use((err: any, _req: any, res: any, _next: any) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal Server Error" });
});

connectDB().then(() => {
  ensureAdminUser().catch((e) => console.error("ensureAdminUser error", e));
  app.listen(env.PORT, () => console.log(`Users service running on :${env.PORT}`));
});

export default app; // for tests

async function ensureAdminUser() {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    console.warn("Admin credentials are not provided. Set ADMIN_EMAIL and ADMIN_PASSWORD to create default admin.");
    return;
  }
  const existing = await User.findOne({ email: env.ADMIN_EMAIL });
  const passwordHash = await hashPassword(env.ADMIN_PASSWORD);
  if (!existing) {
    await User.create({ fullName: "Administrator", birthDate: new Date(0), email: env.ADMIN_EMAIL, passwordHash, role: "admin", isActive: true });
    console.log("Default admin user created:", env.ADMIN_EMAIL);
    return;
  }
  if (env.ADMIN_OVERWRITE_PASSWORD) {
    existing.passwordHash = passwordHash;
    existing.role = "admin" as any;
    existing.isActive = true;
    await existing.save();
    console.log("Default admin user updated:", env.ADMIN_EMAIL);
  }
}
