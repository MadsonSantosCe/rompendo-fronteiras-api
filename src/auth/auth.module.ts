import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { PrismaUserRepository } from "./infrastructure/repositories/prisma.user.repository";
import { PrismaOtpRepository } from "./infrastructure/repositories/prisma.otp.repository";
import { NodemailerEmailService } from "./infrastructure/services/nodemailer.email.service";
import { JwtTokenService } from "./infrastructure/services/jwt.token.service";

import { IUserRepository } from "./domain/repositories/abstract-user.repository";
import { IOtpRepository } from "./domain/repositories/abstract-otp.repository";
import { IEmailService } from "./domain/services/abstract-email.service";
import { ITokenService } from "./domain/services/abstract-token.service";

import { AuthController } from "./presentation/auth.controller";
import { SignUpUseCase } from "./application/usecases/sign-up.usecase";
import { SignInUseCase } from "./application/usecases/sign-in.usecase";
import { VerifyEmailUseCase } from "./application/usecases/verify-email.usecase";
import { SignOutUseCase } from "./application/usecases/sign-out.usecase";
import { ForgotPasswordUseCase } from "./application/usecases/forgot-password.usecase";
import { ResetPasswordUseCase } from "./application/usecases/reset-password.usecase";
import { RefreshTokenUseCase } from "./application/usecases/refresh-token.usecase";
import { AuthGuard } from "./infrastructure/guards/auth.guard";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  providers: [
    AuthGuard,
    PrismaUserRepository,
    PrismaOtpRepository,
    NodemailerEmailService,
    JwtTokenService,
    SignUpUseCase,
    SignInUseCase,
    VerifyEmailUseCase,
    SignOutUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    RefreshTokenUseCase,
    {
      provide: IUserRepository,
      useClass: PrismaUserRepository,
    },
    {
      provide: IOtpRepository,
      useClass: PrismaOtpRepository,
    },
    {
      provide: IEmailService,
      useClass: NodemailerEmailService,
    },
    {
      provide: ITokenService,
      useClass: JwtTokenService,
    },
  ],
  controllers: [AuthController],
  exports: [AuthGuard],
})
export class AuthModule {}
