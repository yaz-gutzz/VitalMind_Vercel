import { Router } from "express";
import { authRequired } from "../middlewares/auth.js";
import { createUser, deleteUser, getUserById, listUsers, updateUser, updateUserStatus } from "../controllers/users.controller.js";

export const usersRouter = Router();

usersRouter.get("/", authRequired, listUsers);
usersRouter.post("/", authRequired, createUser);
usersRouter.get("/:id", authRequired, getUserById);
usersRouter.patch("/:id", authRequired, updateUser);
usersRouter.patch("/:id/status", authRequired, updateUserStatus);
usersRouter.delete("/:id", authRequired, deleteUser);