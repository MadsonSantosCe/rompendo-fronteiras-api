import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import {
  ConflictException,
  UnauthorizedException,
} from "../utils/errors/http.errors";
import { ZodException } from "../utils/errors/zod.errors";
import { signIpSchema, signUpSchema } from "../types/schemas/user.schema";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "@prisma/client";

const prisma = new PrismaClient();
const SECRET = process.env.JWT_SECRET || "secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "secret";
const isProduction = process.env.NODE_ENV === "production";;

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
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

    if (existingUser) throw new ConflictException("Email já está em uso");

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const tokens = generateTokens(newUser);

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction, 
      sameSite: isProduction ? "none" : "lax", 
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    res.status(201).json({
      message: "Usuário criado com sucesso",
      token: tokens.accessToken,
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    return next(error);
  }
};

export const signIn = async (req: Request, res: Response, next: NextFunction) => {
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
      throw new ConflictException("Email ou senha inválidos");
    }

    const tokens = generateTokens(user);

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction, 
      sameSite: isProduction ? "none" : "lax", 
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    res.status(200).json({
      message: "Usuário autenticado com sucesso",
      token: tokens.accessToken,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    return next(error);
  }
};

export const signOut = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logout realizado com sucesso" });
  } catch (error) {
    return next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return next(new UnauthorizedException("Token inválido"));
    }

    const decoded = verifyToken(refreshToken);
    if (!decoded?.id) {
      return next(new UnauthorizedException("Token inválido"));
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return next(new UnauthorizedException("Usuário não encontrado"));
    }

    const tokens = generateTokens(user);

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction, 
      sameSite: isProduction ? "none" : "lax", 
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    res.status(200).json({
      token: tokens.accessToken,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    return next(error);
  }
};

function generateTokens(user: User) {
  const accessToken = jwt.sign({ id: user.id, email: user.email }, SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ id: user.id, email: user.email }, REFRESH_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
}

function verifyToken(token: string): { id: string } | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as { id: string };
  } catch {
    return null;
  }
}
