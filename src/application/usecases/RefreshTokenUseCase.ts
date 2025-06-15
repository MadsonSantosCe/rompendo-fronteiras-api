import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { generateToken, verifyToken } from "../../infrastructure/utils/auth/jwt.utils";
import { NotFoundException, UnauthorizedException } from "../../infrastructure/utils/errors/http.errors";

const SECRET = process.env.JWT_SECRET || "secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "secret";

export class RefreshTokenUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException("Token de atualização ausente");
    }

    const decoded = verifyToken(
      refreshToken,
      REFRESH_SECRET
    );

    if (!decoded?.id) {
      throw new UnauthorizedException("Token inválido");
    }

    const user = await this.userRepository.findById(decoded.id);
    if (!user) throw new NotFoundException("Usuário não encontrado");

    const accessToken = generateToken(user.id, SECRET, 24 * 60 * 60);

    return {
      user: user,
      accessToken,
    };
  }
}
