import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { ConflictException } from "../utils/errors/http.errors";
import { ZodException } from "../utils/errors/zod.errors";
import { signUpSchema } from "../types/schemas/user.schema";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const SECRET = process.env.JWT_SECRET || "secret";

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const safeData = signUpSchema.safeParse(req.body);
    if (!safeData.success) {
      throw new ZodException("Erro de validação de dados", safeData.error.flatten().fieldErrors);
    }
    
    const { name, email, password } = safeData.data;
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException("Email já está em uso");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign({ id: newUser.id }, SECRET, { expiresIn: "1h" });
    res.status(201).json({
      message: "Usuário criado com sucesso",
      token,
      user: newUser
     });

  } catch (error) {
    return next(error);
  }
};
