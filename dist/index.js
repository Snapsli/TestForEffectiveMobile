import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { connectDB } from "./db.js";
import { authRouter } from "./routes/auth.js";
import { usersRouter } from "./routes/users.js";
import { httpLogger } from "./middleware/logger.js";
const app = express();
app.use(httpLogger);
app.use(helmet());
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use((err, _req, res, _next) => {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || "Internal Server Error" });
});
connectDB().then(() => {
    app.listen(env.PORT, () => console.log(`Users service running on :${env.PORT}`));
});
export default app; // for tests
