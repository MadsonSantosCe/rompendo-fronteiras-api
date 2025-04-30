import { Request, Response, NextFunction } from "express";
import { UnauthorizedException } from "../utils/errors/http.errors";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

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

    const decoded = verifyToken(token);
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

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET) as { id: string };
  } catch (error) {
    throw new UnauthorizedException("Token inválido");
  }
}
