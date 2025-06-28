import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Response } from "express";
import { SignUpUseCase } from "../application/usecases/sign-up.usecase";
import { SignInUseCase } from "../application/usecases/sign-in.usecase";
import { VerifyEmailUseCase } from "../application/usecases/verify-email.usecase";
import { SignOutUseCase } from "../application/usecases/sign-out.usecase";
import { ForgotPasswordUseCase } from "../application/usecases/forgot-password.usecase";
import { ResetPasswordUseCase } from "../application/usecases/reset-password.usecase";
import { RefreshTokenUseCase } from "../application/usecases/refresh-token.usecase";
import { AuthGuard } from "../infrastructure/guards/auth.guard";
import { SignUpDto } from "./dto/sign-up.dto";
import { SignInDto } from "./dto/sign-in.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";

@Controller("api/auth")
export class AuthController {
  constructor(
    private readonly signUpUseCase: SignUpUseCase,
    private readonly signInUseCase: SignInUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly signOutUseCase: SignOutUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase
  ) {}

  @Post("sign-up")
  @HttpCode(201)
  async signUp(@Body() body: SignUpDto) {
    const { name, email, password } = body;
    const user = await this.signUpUseCase.execute(name, email, password);
    return {message: "Usuário criado com sucesso", user};
  }

  @Post("sign-in")
  @HttpCode(200)
  async signIn(@Body() body : SignInDto, @Res({ passthrough: true }) res: Response) {
    const { email, password } = body;
    const { user, accessToken } = await this.signInUseCase.execute(email, password, res);
    return { message: "Usuário autenticado com sucesso", user, accessToken};
  }

  @Post("verify-email")
  @HttpCode(200)
  async verifyEmail(@Body() body: VerifyEmailDto, @Res({ passthrough: true }) res: Response) {
    const { code } = body;
    const { user, accessToken } = await this.verifyEmailUseCase.execute(code, res);
    return { message: "Email verificado com sucesso", user, accessToken};
  }

  @Post("sign-out")
  @HttpCode(200)
  async signOut(@Req() req, @Res({ passthrough: true }) res: Response) {
    this.signOutUseCase.execute(res);
    return { message: "Usuário desconectado com sucesso" };
  }

  @Post("forgot-password")
  @HttpCode(200)
  async forgotPassword(@Req() req) {
    const { email } = req.body;
    await this.forgotPasswordUseCase.execute(email);
    return { message: "Solicitação de redefinição de senha enviada com sucesso" };
  }

  @Post("reset-password/:token")
  @HttpCode(200)
  async resetPassword(@Param("token") token: string, @Req() req) {
    const { password } = req.body;
    await this.resetPasswordUseCase.execute(token, password);
    return { message: "Senha redefinida com sucesso" };
  }

  @Post("refresh-token")
  @HttpCode(200)
  async refreshToken(@Req() req) {
    const refreshToken = req.cookies.refreshToken;
    const { user, accessToken } = await this.refreshTokenUseCase.execute(refreshToken);
    return { message: "Token atualizado com sucesso", user, accessToken };
  }

  @UseGuards(AuthGuard)
  @Get("me")
  @HttpCode(200)
  async getMe(@Req() req) {
    const user = req["user"];
    return { 
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        verified: user?.verified,
      }, 
    };
  }
}
