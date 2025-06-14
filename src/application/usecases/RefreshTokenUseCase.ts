import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { NotFoundException } from "../../infrastructure/utils/errors/http.errors";

export class RefreshTokenUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException("Usuário não encontrado");
    return user;
  }
}
