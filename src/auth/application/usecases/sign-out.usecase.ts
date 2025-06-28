import { Injectable } from "@nestjs/common";
import { ITokenService } from "src/auth/domain/services/abstract-token.service";
import { Response } from "express";

@Injectable()
export class SignOutUseCase {
  constructor(private readonly JwtTokenService: ITokenService) {}

  execute(res: Response) {
    this.JwtTokenService.clearRefreshTokenCookie(res);
  }
}
