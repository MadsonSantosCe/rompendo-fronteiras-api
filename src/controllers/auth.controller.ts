import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from "../utils/errors/http.errors";
import { ZodException } from "../utils/errors/zod.errors";
import { signInSchema, signUpSchema } from "../types/schemas/user.schema";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { verifyToken } from "../utils/auth/http.auth";
import { customAlphabet } from "nanoid";

const prisma = new PrismaClient();
const SECRET = process.env.JWT_SECRET || "secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "secret";
const EXPIRES_IN_TOKEN = process.env.EXPIRESIN_TOKEN || "1m";
const EXPIRES_IN_REFRESH_TOKEN = process.env.EXPIRESIN_REFRESH_TOKEN || "1d";
const isProduction = process.env.NODE_ENV === "production";

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const safeData = signUpSchema.safeParse(req.body);
    if (!safeData.success) {
      throw new ZodException(
        "Erro de validação de dados",
        safeData.error.flatten().fieldErrors
      );
    }

    const { name, email, password } = safeData.data;
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) throw new ConflictException("O e-mail já está em uso");

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const verification_code = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    await prisma.otp.create({
      data: {
        code: verification_code,
        type: "EMAIL_VERIFICATION",
        userId: newUser.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), //24 horas
      },
    });

    //enviar e-mail de verificação

    res.status(201).json({
      message: "Usuário criado com sucesso",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        verified: newUser.verified,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { code } = req.body;
  try {
    const otpRecord = await prisma.otp.findFirst({
      where: {
        code: code,
        type: "EMAIL_VERIFICATION",
        deletionAt: null,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!otpRecord) {
      throw new BadRequestException("Código inválido ou expirado");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: otpRecord.userId,
      },
    });

    if (!user) {
      throw new BadRequestException("Usuário não encontrado");
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        verified: true,
      },
    });

    await prisma.otp.update({
      where: {
        id: otpRecord.id,
      },
      data: {
        deletionAt: new Date(),
      },
    });

    //enviar e-mail de confirmação

    const accessToken = jwt.sign(
      {
        id: user.id,
      },
      SECRET,
      {
        expiresIn: "12h",
      }
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
      },
      REFRESH_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    res.status(200).json({
      message: "E-mail verificado com sucesso",
      accessToken: accessToken,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        verified: updatedUser.verified,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const safeData = signInSchema.safeParse(req.body);
    if (!safeData.success) {
      throw new ZodException(
        "Erro de validação de dados",
        safeData.error.flatten().fieldErrors
      );
    }

    const { email, password } = safeData.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new ConflictException("E-mail ou senha inválidos");
    }

    if (!user.verified) {
      throw new BadRequestException("E-mail não verificado");
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
      },
      SECRET,
      {
        expiresIn: "12h",
      }
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
      },
      REFRESH_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    res.status(200).json({
      message: "Usuário autenticado com sucesso",
      accessToken: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        verified: user.verified,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const signOut = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logout realizado com sucesso" });
  } catch (error) {
    return next(error);
  }
};

export const userInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (!user) throw new UnauthorizedException("Usuário não encontrado");

    res.status(200).json({
      message: "Usuário autenticado com sucesso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        verified: user.verified,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.clearCookie("refreshToken");
      throw new UnauthorizedException("Token inválido");
    }

    const decoded = verifyToken(refreshToken, REFRESH_SECRET);
    if (!decoded?.id) {
      res.clearCookie("refreshToken");
      throw new UnauthorizedException("Token inválido");
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      res.clearCookie("refreshToken");
      throw new UnauthorizedException("Usuário não encontrado");
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
      },
      SECRET,
      {
        expiresIn: "12h",
      }
    );

    res.status(200).json({
      message: "Token atualizado com sucesso",
      accessToken: accessToken,
    });
  } catch (error) {
    return next(error);
  }
};
