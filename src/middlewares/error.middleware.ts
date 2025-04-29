import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/http.errors";
import { PrismaError } from "../utils/prisma.errors";

export function errorMiddleware(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {

    console.error("Error:", err);

    if (err instanceof AppError) {
      res.status(err.status).json({ message: err.message });
      return;
    }
  
    res.status(500).json({ message: "Erro interno do servidor" });
  }
  