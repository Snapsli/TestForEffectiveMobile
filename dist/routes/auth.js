import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as auth from "../controllers/authController.js";
export const authRouter = Router();
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
// 1. Регистрация пользователя
authRouter.post("/register", authLimiter, auth.register);
// 2. Авторизация пользователя (JWT)
authRouter.post("/login", authLimiter, auth.login);
authRouter.post("/logout", auth.logout);
