import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from "../utils/errors/http.errors";
import { ZodException } from "../utils/errors/zod.errors";
import { signIpSchema, signUpSchema } from "../types/schemas/user.schema";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { verifyToken } from "../utils/errors/auth/http.auth";

const prisma = new PrismaClient();
const SECRET = process.env.JWT_SECRET || "secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "secret";
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

    //enviar e-mail de verificação, mas por enquanto exibe no console    
    console.log("Código de verificação", verification_code);

    res.status(201).json({
      message: "Usuário criado com sucesso",
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
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
    const safeData = signIpSchema.safeParse(req.body);
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

    if(!user.verified){
      throw new BadRequestException("E-mail não verificado");
    }

    const accessToken = jwt.sign({ id: user.id, email: user.email }, SECRET, {
      expiresIn: "12h",
    });

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
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
      token: accessToken,
      user: { id: user.id, name: user.name, email: user.email },
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

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw new UnauthorizedException("Token inválido");
    }

    const decoded = verifyToken(refreshToken, REFRESH_SECRET);
    if (!decoded?.id) {
      throw new UnauthorizedException("Token inválido");
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      throw new UnauthorizedException("Usuário não encontrado");
    }

    const accessToken = jwt.sign({ id: user.id, email: user.email }, SECRET, {
      expiresIn: "15m",
    });

    res.status(200).json({
      token: accessToken,
      user: { id: user.id, name: user.name, email: user.email },
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

    const accessToken = jwt.sign({ id: user.id, email: user.email }, SECRET, {
      expiresIn: "12h",
    });

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
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

    //enviar e-mail de confirmação

    res.status(200).json({
      message: "E-mail verificado com sucesso",      
      token: accessToken,
      user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email },
    });
  } catch (error) {
    return next(error);
  }
};
