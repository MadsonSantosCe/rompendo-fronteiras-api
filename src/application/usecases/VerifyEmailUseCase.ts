import { IOtpRepository } from "../../domain/repositories/IOtpRepository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { OtpType } from "../../domain/entities/Otp";

import {
  BadRequestException,
  NotFoundException,
} from "../../infrastructure/utils/errors/http.errors";

export class VerifyEmailUseCase {
  constructor(
    private otpRepository: IOtpRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(code: string) {
    const otp = await this.otpRepository.findValidOtp(
      code,
      OtpType.EMAIL_VERIFICATION
    );

    if (!otp) throw new BadRequestException("Código inválido ou expirado");

    const user = await this.userRepository.findById(otp.userId);
    if (!user) throw new NotFoundException("Usuário não encontrado");

    const updatedUser = await this.userRepository.updateVerified(user.id, true);
    await this.otpRepository.invalidateOtp(otp.id);

    return updatedUser;
  }
}
