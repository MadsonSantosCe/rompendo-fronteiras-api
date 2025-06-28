import { Response } from 'express';

export abstract class ITokenService {
  abstract generateToken(userId: string, expiresIn: string): string ;
  abstract verifyToken(token: string): { id: string };
  abstract setRefreshTokenCookie(token: string, res: Response): void;
  abstract clearRefreshTokenCookie(res: Response): void;
}
