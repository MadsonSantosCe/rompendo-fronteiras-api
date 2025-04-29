import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorMiddleware(
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
  ): void {
    console.error("Error:", err);
  
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        res.status(400).json({ message: "Email already exists" });
        return;
      }
  
      if (err.code === "P2025") {
        res.status(404).json({ message: "Record not found" });
        return;
      }
    }
  
    if (err instanceof Prisma.PrismaClientValidationError) {
      res.status(400).json({ message: "Invalid data" });
      return;
    }
  
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ message: err.message });
      return;
    }
  
    res.status(500).json({ message: "Internal server error" });
  }
  