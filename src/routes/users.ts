import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { getUserById, listUsers, blockUser, unblockUser, updateProfile, changePassword, getMe, followUser, unfollowUser, exploreUsers } from "../controllers/userController.js";

export const usersRouter = Router();

// Me (должен идти ДО ":id", иначе перехватится как id="me")
usersRouter.get("/me", requireAuth, getMe);

// 3. Получение пользователя по ID (админ или сам пользователь)
usersRouter.get("/:id", requireAuth, getUserById);

// 4. Получение списка пользователей — только для админа
usersRouter.get("/", requireAuth, requireRole("admin"), listUsers);

// Explore list (для всех аутентифицированных)
usersRouter.get("/explore/list", requireAuth, exploreUsers);

// 5. Блокировка пользователя — админ или сам пользователь
usersRouter.patch("/:id/block", requireAuth, blockUser);

// Unblock
usersRouter.patch("/:id/unblock", requireAuth, unblockUser);

// Update profile
usersRouter.patch("/:id", requireAuth, updateProfile);

// Change password
usersRouter.patch("/:id/password", requireAuth, changePassword);

// Follow / Unfollow (любые аутентифицированные пользователи)
usersRouter.post("/:id/follow", requireAuth, followUser);
usersRouter.post("/:id/unfollow", requireAuth, unfollowUser);
