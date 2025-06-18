import { Request, Response, NextFunction } from "express";
import { UnauthorizedException } from "../../infrastructure/utils/errors/http.errors";
import { PrismaClient, User } from "@prisma/client";
import { verifyToken } from "../../infrastructure/utils/auth/jwt.utils";

const prisma = new PrismaClient();
const SECRET = process.env.JWT_SECRET || "secret";

declare global {
  namespace Express {
    interface Request {
      user?: User | null;
    }
  }
}

export const authorize = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedException("Token inválido");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token, SECRET);
    if (!decoded?.id) {
      throw new UnauthorizedException("Token inválido");
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    req.user = user;

    next();
  } catch (error) {
    return next(error);
  }
};
