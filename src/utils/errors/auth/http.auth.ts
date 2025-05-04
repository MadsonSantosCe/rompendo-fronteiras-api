import jwt from "jsonwebtoken";

export function verifyToken(
  token: string,
  jwt_secret: string
): { id: string } | null {
  try {
    return jwt.verify(token, jwt_secret) as { id: string };
  } catch {
    return null;
  }
}
