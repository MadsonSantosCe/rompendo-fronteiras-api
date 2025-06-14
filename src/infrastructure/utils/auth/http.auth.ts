import jwt from "jsonwebtoken";
import { UnauthorizedException } from "../errors/http.errors";

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
