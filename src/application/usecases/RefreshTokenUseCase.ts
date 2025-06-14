import { IUserRepository } from "../../domain/repositories/IUserRepository";

export class RefreshTokenUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error("Usuário não encontrado");
    return user;
  }
}
