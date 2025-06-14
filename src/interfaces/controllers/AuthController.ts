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
  signInSchema,
  signUpSchema,
  verifyEmailSchema,
} from "../../application/schemas/auth.schema";

import { verifyToken } from "../../infrastructure/utils/auth/http.auth";
import { ZodException } from "../../infrastructure/utils/errors/zod.errors";

import {
  BadRequestException,
  UnauthorizedException,
} from "../../infrastructure/utils/errors/http.errors";

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
      const user = await signInUseCase.execute(data);
      res
        .status(200)
        .json({ message: "Usuário autenticado com sucesso", user });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    const data = this.handleValidation(verifyEmailSchema, req);

    try {
      const user = await verifyEmailUseCase.execute(data.code);
      res.status(200).json({ message: "E-mail verificado com sucesso", user });
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        throw new UnauthorizedException("Token de atualização ausente");
      }

      const decoded = verifyToken(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || "secret"
      );

      if (!decoded?.id) {
        throw new UnauthorizedException("Token inválido");
      }

      const user = await refreshTokenUseCase.execute(decoded.id);
      res.status(200).json({ message: "Token atualizado com sucesso", user });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    if (!email) {
      throw new BadRequestException("E-mail é obrigatório");
    }

    try {
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
    const { password } = req.body;

    if (!password) {
      throw new BadRequestException("Senha é obrigatória");
    }

    try {
      await resetPasswordUseCase.execute(token, password);
      res.status(200).json({ message: "Senha redefinida com sucesso" });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
