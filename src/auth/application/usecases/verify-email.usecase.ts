import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Response } from "express";
import { IOtpRepository } from "src/auth/domain/repositories/abstract-otp.repository";
import { IUserRepository } from "src/auth/domain/repositories/abstract-user.repository";
import { ITokenService } from "src/auth/domain/services/abstract-token.service";
import { OtpType } from "../../domain/entities/otp.entity";

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    private readonly otpRepository: IOtpRepository,
    private readonly userRepository: IUserRepository,
    private readonly jwtTokenService: ITokenService
  ) {}

  async execute(code: string, res: Response) {
    const otp = await this.otpRepository.findValidOtp(
      code,
      OtpType.EMAIL_VERIFICATION
    );

    if (!otp) throw new BadRequestException("Código inválido ou expirado");

    const user = await this.userRepository.findById(otp.user_id);
    if (!user) throw new NotFoundException("Usuário não encontrado");

    const updatedUser = await this.userRepository.updateVerified(user.id, true);
    await this.otpRepository.invalidateOtp(otp.id);

    const accessToken = this.jwtTokenService.generateToken(user.id, "24h");
    const refreshToken = this.jwtTokenService.generateToken(user.id, "7d");

    this.jwtTokenService.setRefreshTokenCookie(refreshToken, res);

    return {
      user: {
        id: updatedUser?.id,
        name: updatedUser?.name,
        email: updatedUser?.email,
        verified: updatedUser?.verified,
      },
      accessToken,
    };
  }
}
