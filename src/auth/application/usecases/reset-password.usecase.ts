import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { IOtpRepository } from "src/auth/domain/repositories/abstract-otp.repository";
import { IUserRepository } from "src/auth/domain/repositories/abstract-user.repository";
import { OtpType } from "../../domain/entities/otp.entity";
import bcrypt from "bcryptjs";

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private otpRepository: IOtpRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(token: string, password: string) {
    if (!token) {
      throw new BadRequestException("Token é obrigatório");
    }

    const otp = await this.otpRepository.findValidOtp(
      token,
      OtpType.PASSWORD_RESET
    );

    if (!otp)
      throw new BadRequestException(
        "Código de redefinição de senha inválido ou expirado"
      );

    const user = await this.userRepository.findById(otp.user_id);
    if (!user) throw new NotFoundException("Usuário não encontrado");

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.userRepository.updatePassword(user.id, hashedPassword);
    await this.otpRepository.invalidateOtp(otp.id);

    return true;
  }
}
