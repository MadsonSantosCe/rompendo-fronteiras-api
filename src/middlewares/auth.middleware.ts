import { Request, Response, NextFunction } from "express";
import { UnauthorizedException } from "../utils/errors/http.errors";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../utils/errors/auth/http.auth";

const prisma = new PrismaClient();
const SECRET = process.env.JWT_SECRET || "secret";

export const authorize = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new UnauthorizedException("Token inválido"));
  }

  const token = authHeader.split(" ")[1];

  try {

    const decoded = verifyToken(token, SECRET);
    if (!decoded?.id) {
      return next(new UnauthorizedException("Token inválido"));
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    next();
  } catch (error) {
    return next(error);
  }
};
