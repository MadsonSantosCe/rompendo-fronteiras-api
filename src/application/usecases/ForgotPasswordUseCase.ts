import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IOtpRepository } from "../../domain/repositories/IOtpRepository";
import { IEmailService } from "../../domain/services/IEmailService";
import { OtpType } from "../../domain/entities/Otp";
import { v4 as uuidv4 } from "uuid";

import {
  ConflictException,
  NotFoundException,
} from "../../infrastructure/utils/errors/http.errors";


export class ForgotPasswordUseCase {
  constructor(
    private userRepository: IUserRepository,
    private otpRepository: IOtpRepository,
    private emailService: IEmailService
  ) {}

  async execute(email: string, clientUrl: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) throw new NotFoundException("Email não encontrado");
    const existingOtp = await this.otpRepository.findValidOtpByUser(
      user.id,
      OtpType.PASSWORD_RESET
    );

    if (existingOtp)
      throw new ConflictException(
        "Já existe uma solicitação de redefinição de senha em andamento"
      );

    const reset_code = uuidv4();
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000);

    await this.otpRepository.create({
      code: reset_code,
      type: OtpType.PASSWORD_RESET,
      userId: user.id,
      expiresAt,
    });

    await this.emailService.sendPasswordResetEmail(
      user.email,
      `${clientUrl}/reset-password/${reset_code}`
    );

    return true;
  }
}
