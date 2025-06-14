import { IUserRepository } from "../../domain/repositories/IUserRepository";
import bcrypt from "bcryptjs";

export class SignInUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute({ email, password }: { email: string; password: string }) {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("E-mail ou senha inválidos");
    }
    if (!user.verified) {
      throw new Error("E-mail não verificado");
    }
    return user;
  }
}
