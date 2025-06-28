import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { IUserRepository } from "src/auth/domain/repositories/abstract-user.repository";
import { ITokenService } from "src/auth/domain/services/abstract-token.service";

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private userRepository: IUserRepository,
    private jwtTokenService: ITokenService
  ) {}

  async execute(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException("Token de atualização ausente");
    }

    const decoded = this.jwtTokenService.verifyToken(refreshToken);

    if (!decoded?.id) {
      throw new UnauthorizedException("Token inválido");
    }

    const user = await this.userRepository.findById(decoded.id);
    if (!user) throw new NotFoundException("Usuário não encontrado");

    const accessToken = this.jwtTokenService.generateToken(user.id, "24h");

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
