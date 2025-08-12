import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { getUserById, listUsers, blockUser, unblockUser, updateProfile, changePassword, getMe } from "../controllers/userController.js";

export const usersRouter = Router();

// Me (должен идти ДО ":id", иначе перехватится как id="me")
usersRouter.get("/me", requireAuth, getMe);

// 3. Получение пользователя по ID (админ или сам пользователь)
usersRouter.get("/:id", requireAuth, getUserById);

// 4. Получение списка пользователей — только для админа
usersRouter.get("/", requireAuth, requireRole("admin"), listUsers);

// 5. Блокировка пользователя — админ или сам пользователь
usersRouter.patch("/:id/block", requireAuth, blockUser);

// Unblock
usersRouter.patch("/:id/unblock", requireAuth, unblockUser);

// Update profile
usersRouter.patch("/:id", requireAuth, updateProfile);

// Change password
usersRouter.patch("/:id/password", requireAuth, changePassword);
