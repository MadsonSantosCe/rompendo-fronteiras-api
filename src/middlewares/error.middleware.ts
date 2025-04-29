import { NextFunction, Request, Response } from "express";
import { HandlerHttpError } from "../utils/http.errors";

export function errorMiddleware(
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {

    console.error("Error:", error);

    if (error instanceof HandlerHttpError) {
      res.status(error.status).json({ message: error.message, details: error.datails });
      return;
    }
  
    res.status(500).json({ message: "Erro interno do servidor" });
  }
  