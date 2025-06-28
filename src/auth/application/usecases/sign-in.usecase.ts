import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Response } from "express";
import { IUserRepository } from "src/auth/domain/repositories/abstract-user.repository";
import { ITokenService } from "src/auth/domain/services/abstract-token.service";
import bcrypt from "bcryptjs";

@Injectable()
export class SignInUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtTokenService: ITokenService
  ) {}

  async execute(email: string, password: string, res: Response) {
    const user = await this.userRepository.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException("E-mail ou senha inválidos");
    }

    if (!user.verified) {
      throw new ForbiddenException("E-mail não verificado");
    }

    const accessToken = this.jwtTokenService.generateToken(user.id, "24h");
    const refreshToken = this.jwtTokenService.generateToken(user.id, "7d");

    this.jwtTokenService.setRefreshTokenCookie(refreshToken, res);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        verified: user.verified,
      },
      accessToken,
    };
  }
}
