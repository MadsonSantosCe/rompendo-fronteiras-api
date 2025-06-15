import { Response } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedException } from "../errors/http.errors";

const isProduction = process.env.NODE_ENV === "production";

export function generateToken(
  id: string,
  jwt_secret: string,
  expiresIn: number
): string {
  return jwt.sign({ id }, jwt_secret, { expiresIn: expiresIn });
}

export function verifyToken(
  token: string,
  jwt_secret: string
): { id: string } | null {
  try {
    return jwt.verify(token, jwt_secret) as { id: string };
  } catch (error) {
    if (error instanceof Error && error.name === "TokenExpiredError") {
      throw new UnauthorizedException("Token expirado");
    }

    throw new UnauthorizedException("Token inválido");
  }
}

export function setCookie(
  token: string, 
  res: Response
) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60,
  });
}
