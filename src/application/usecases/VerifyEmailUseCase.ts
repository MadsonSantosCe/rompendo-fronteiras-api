import { IOtpRepository } from "../../domain/repositories/IOtpRepository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { OtpType } from "../../domain/entities/Otp";

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
    if (!otp) throw new Error("Código inválido ou expirado");
    const user = await this.userRepository.findById(otp.userId);
    if (!user) throw new Error("Usuário não encontrado");
    const updatedUser = await this.userRepository.updateVerified(user.id, true);
    await this.otpRepository.invalidateOtp(otp.id);
    return updatedUser;
  }
}
