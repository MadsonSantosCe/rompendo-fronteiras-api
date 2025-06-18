import { Request, Response, NextFunction } from "express";
import { PrismaUserRepository } from "../../infrastructure/repositories/PrismaUserRepository";
import { PrismaOtpRepository } from "../../infrastructure/repositories/PrismaOtpRepository";
import { EmailService } from "../../infrastructure/services/EmailService";

import { SignUpUseCase } from "../../application/usecases/SignUpUseCase";
import { SignInUseCase } from "../../application/usecases/SignInUseCase";
import { VerifyEmailUseCase } from "../../application/usecases/VerifyEmailUseCase";
import { RefreshTokenUseCase } from "../../application/usecases/RefreshTokenUseCase";
import { ForgotPasswordUseCase } from "../../application/usecases/ForgotPasswordUseCase";
import { ResetPasswordUseCase } from "../../application/usecases/ResetPasswordUseCase";

import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  verifyEmailSchema,
} from "../../application/schemas/auth.schema";

import { ZodException } from "../../infrastructure/utils/errors/zod.errors";
import { UnauthorizedException } from "../../infrastructure/utils/errors/http.errors";

const isProduction = process.env.NODE_ENV === "production";

const userRepository = new PrismaUserRepository();
const otpRepository = new PrismaOtpRepository();
const emailService = new EmailService();

const signUpUseCase = new SignUpUseCase(
  userRepository,
  otpRepository,
  emailService
);
const signInUseCase = new SignInUseCase(userRepository);
const verifyEmailUseCase = new VerifyEmailUseCase(
  otpRepository,
  userRepository
);
const refreshTokenUseCase = new RefreshTokenUseCase(userRepository);
const forgotPasswordUseCase = new ForgotPasswordUseCase(
  userRepository,
  otpRepository,
  emailService
);
const resetPasswordUseCase = new ResetPasswordUseCase(
  otpRepository,
  userRepository
);

class AuthController {
  private handleValidation(schema: any, req: Request) {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      throw new ZodException(
        "Erro de validação de dados",
        parsed.error.flatten().fieldErrors
      );
    }
    return parsed.data;
  }

  signUp = async (req: Request, res: Response, next: NextFunction) => {
    const data = this.handleValidation(signUpSchema, req);
    if (!data) return next();

    try {
      const user = await signUpUseCase.execute(data);
      res.status(201).json({ message: "Usuário criado com sucesso", user });
    } catch (error) {
      next(error);
    }
  };

  signIn = async (req: Request, res: Response, next: NextFunction) => {
    const data = this.handleValidation(signInSchema, req);

    try {
      const result = await signInUseCase.execute(data, res);
      res.status(200).json({
        message: "Usuário autenticado com sucesso",
        accessToken: result.accessToken,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          verified: result.user.verified,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  signOut = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.clearCookie("refreshToken");
      res.status(200).json({ message: "Usuário deslogado com sucesso" });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    const data = this.handleValidation(verifyEmailSchema, req);

    try {
      const { code } = data;
      const result = await verifyEmailUseCase.execute(code, res);
      res.status(200).json({
        message: "E-mail verificado com sucesso",
        accessToken: result.accessToken,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          verified: result.user.verified,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;

    try {
      const result = await refreshTokenUseCase.execute(refreshToken);
      res.status(200).json({
        message: "Token atualizado com sucesso",
        accessToken: result.accessToken,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          verified: result.user.verified,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    const data = this.handleValidation(forgotPasswordSchema, req);

    try {
      const { email } = data;
      await forgotPasswordUseCase.execute(email, process.env.CLIENT_URL || "");
      res
        .status(200)
        .json({ message: "E-mail de redefinição enviado com sucesso" });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;
    const data = this.handleValidation(resetPasswordSchema, req);

    try {
      const { password } = data;
      await resetPasswordUseCase.execute(token, password);
      res.status(200).json({ message: "Senha redefinida com sucesso" });
    } catch (error) {
      next(error);
    }
  };

  UserInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      res.status(200).json({
        user: {
          id: user?.id,
          name: user?.name,
          email: user?.email,
          verified: user?.verified,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
