import { Router } from "express";
import { getAdminDashboard,getAdminUsers,updateUserStatus,deleteUser,getAdminReports,createNotification,getNotificationsHistory,getNotificationStats } from "../controllers/admin.controller.js";
import { authRequired } from "../middlewares/auth.js";
import { adminRequired } from "../middlewares/adminRequired.js";

export const adminRouter = Router();



adminRouter.get(
    "/dashboard",
    authRequired,
    adminRequired,
    getAdminDashboard
);

adminRouter.get(
    "/users",
    authRequired,
    adminRequired,
    getAdminUsers
);

adminRouter.patch(
    "/users/:id/status",
    authRequired,
    adminRequired,
    updateUserStatus
);

adminRouter.delete(
    "/users/:id",
    authRequired,
    adminRequired,
    deleteUser
);

adminRouter.get(
    "/reports",
    authRequired,
    adminRequired,
    getAdminReports
);

adminRouter.post(
    "/notifications",
    authRequired,
    adminRequired,
    createNotification
);

adminRouter.get(
    "/notifications",
    authRequired,
    adminRequired,
    getNotificationsHistory
);

adminRouter.get(
    "/notifications/stats",
    authRequired,
    adminRequired,
    getNotificationStats
);