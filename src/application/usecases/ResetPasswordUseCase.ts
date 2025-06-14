import { IOtpRepository } from "../../domain/repositories/IOtpRepository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { OtpType } from "../../domain/entities/Otp";
import bcrypt from "bcryptjs";

import {
  BadRequestException,
  NotFoundException,
} from "../../infrastructure/utils/errors/http.errors";

export class ResetPasswordUseCase {
  constructor(
    private otpRepository: IOtpRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(token: string, password: string) {
    const otp = await this.otpRepository.findValidOtp(
      token,
      OtpType.PASSWORD_RESET
    );

    if (!otp)
      throw new BadRequestException(
        "Código de redefinição de senha inválido ou expirado"
      );

    const user = await this.userRepository.findById(otp.userId);
    if (!user) throw new NotFoundException("Usuário não encontrado");

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.userRepository.updatePassword(user.id, hashedPassword);
    await this.otpRepository.invalidateOtp(otp.id);

    return true;
  }
}
