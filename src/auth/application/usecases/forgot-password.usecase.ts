import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { IOtpRepository } from "../../domain/repositories/abstract-otp.repository";
import { IUserRepository } from "../../domain/repositories/abstract-user.repository";
import { IEmailService } from "../../domain/services/abstract-email.service";
import { OtpType } from "../../domain/entities/otp.entity";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    private userRepository: IUserRepository,
    private otpRepository: IOtpRepository,
    private emailService: IEmailService
  ) {}

  async execute(email: string) {
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
    const expires_at = new Date(Date.now() + 1 * 60 * 60 * 1000);

    await this.otpRepository.create({
      code: reset_code,
      type: OtpType.PASSWORD_RESET,
      user_id: user.id,
      expires_at: expires_at,
    });

    await this.emailService.sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${reset_code}`
    );
  }
}
