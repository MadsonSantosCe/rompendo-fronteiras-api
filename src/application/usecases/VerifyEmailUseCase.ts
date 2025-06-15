import { Response } from "express";
import { IOtpRepository } from "../../domain/repositories/IOtpRepository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { OtpType } from "../../domain/entities/Otp";
import {
  generateToken,
  setCookie,
} from "../../infrastructure/utils/auth/jwt.utils";

import {
  BadRequestException,
  NotFoundException,
} from "../../infrastructure/utils/errors/http.errors";

const SECRET = process.env.JWT_SECRET || "secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "secret";

export class VerifyEmailUseCase {
  constructor(
    private otpRepository: IOtpRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(code: string, res: Response) {
    const otp = await this.otpRepository.findValidOtp(
      code,
      OtpType.EMAIL_VERIFICATION
    );

    if (!otp) throw new BadRequestException("Código inválido ou expirado");

    const user = await this.userRepository.findById(otp.userId);
    if (!user) throw new NotFoundException("Usuário não encontrado");

    const updatedUser = await this.userRepository.updateVerified(user.id, true);
    await this.otpRepository.invalidateOtp(otp.id);

    const accessToken = generateToken(updatedUser.id, SECRET, 24 * 60 * 60);
    const refreshToken = generateToken(
      updatedUser.id,
      REFRESH_SECRET,
      7 * 24 * 60 * 60
    );

    setCookie(refreshToken, res);

    return {
      user: updatedUser,
      accessToken,
    };
  }
}
