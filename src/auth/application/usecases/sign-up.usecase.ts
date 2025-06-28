import { Injectable, ConflictException } from "@nestjs/common";
import { IUserRepository } from "../../domain/repositories/abstract-user.repository";
import { IOtpRepository } from "../../domain/repositories/abstract-otp.repository";
import { IEmailService } from "../../domain/services/abstract-email.service";
import { OtpType } from "../../domain/entities/otp.entity";
import bcrypt from "bcryptjs";

@Injectable()
export class SignUpUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly otpRepository: IOtpRepository,
    private readonly emailService: IEmailService
  ) {}

  async execute(name: string, email: string, password: string) {
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new ConflictException("O e-mail já está em uso");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    const verification_code = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    await this.otpRepository.create({
      code: verification_code,
      type: OtpType.EMAIL_VERIFICATION,
      user_id: newUser.id,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await this.emailService.sendVerificationEmail(
      newUser.email,
      verification_code
    );

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      verified: newUser.verified,
    };
  }
}
