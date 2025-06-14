import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IOtpRepository } from "../../domain/repositories/IOtpRepository";
import { IEmailService } from "../../domain/services/IEmailService";
import bcrypt from "bcryptjs";
import { OtpType } from "../../domain/entities/Otp";

export class SignUpUseCase {
  constructor(
    private userRepository: IUserRepository,
    private otpRepository: IOtpRepository,
    private emailService: IEmailService
  ) {}

  async execute({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  }) {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("O e-mail já está em uso");
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
      userId: newUser.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
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
