import { Router } from "express";
import AuthController from "../controllers/AuthController"; 

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post("/signup", authController.signUp);
authRoutes.post("/signin", authController.signIn);
authRoutes.post("/verify-email", authController.verifyEmail);
authRoutes.post("/refresh-token", authController.refreshToken);
authRoutes.post("/forgot-password", authController.forgotPassword);
authRoutes.post("/reset-password/:token", authController.resetPassword);

export default authRoutes;
