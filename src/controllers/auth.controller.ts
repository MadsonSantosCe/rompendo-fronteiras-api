import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { ConflictException } from "../utils/http.errors";
import { ZodException } from "../utils/zod.errors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();
const SECRET = process.env.JWT_SECRET || "secret";

const signUpSchema = z.object({
  name: z.string().min(3).max(50),
  email: z.string().email("Email inválido"),
  password: z.string().min(6).max(20),
});

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const safeData = signUpSchema.safeParse(req.body);
    if (!safeData.success) {
      throw new ZodException("Erro de validação nos dados", safeData.error.flatten().fieldErrors);
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
