import { Response } from "express";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import bcrypt from "bcryptjs";

import {
  ForbiddenException,
  UnauthorizedException,
} from "../../infrastructure/utils/errors/http.errors";
import {
  generateToken,
  setCookie,
} from "../../infrastructure/utils/auth/jwt.utils";

const SECRET = process.env.JWT_SECRET || "secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "secret";

export class SignInUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(
    params: { email: string; password: string },
    res: Response
  ) {
    const { email, password } = params;
    const user = await this.userRepository.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException("E-mail ou senha inválidos");
    }

    if (!user.verified) {
      throw new ForbiddenException("E-mail não verificado");
    }

    const accessToken = generateToken(user.id, SECRET, 24 * 60 * 60);
    const refreshToken = generateToken(
      user.id,
      REFRESH_SECRET,
      7 * 24 * 60 * 60
    );

    setCookie(refreshToken, res);

    return {
      user: user,
      accessToken,
    };
  }
}
