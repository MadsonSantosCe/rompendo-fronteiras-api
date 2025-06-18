import { Router } from "express";
import AuthController from "../controllers/AuthController"; 
import { authorize } from "../middlewares/auth.middleware";

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post("/sign-up", authController.signUp);
authRoutes.post("/sign-in", authController.signIn);
authRoutes.post("/sign-out", authController.signOut);
authRoutes.post("/verify-email", authController.verifyEmail);
authRoutes.post("/refresh-token", authController.refreshToken);
authRoutes.post("/forgot-password", authController.forgotPassword);
authRoutes.post("/reset-password/:token", authController.resetPassword);
authRoutes.post("/verify-acsess-token", authorize, authController.userInfo);

export default authRoutes;
