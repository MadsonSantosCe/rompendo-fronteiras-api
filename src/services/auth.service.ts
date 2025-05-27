import { PrismaClient } from "@prisma/client";
import { VERIFICATION_EMAIL_TEMPLATE } from "../utils/mailtrap/email.templates";
import { UserService } from "./user.service";
import { EmailService } from "./email.service";
import { OTPService } from "./otp.service";

const prisma = new PrismaClient();

export class AuthService {
  private userService = new UserService();
  private emailService = new EmailService();
  private otpService = new OTPService();

  async registerUser(data: { name: string; email: string; password: string }) {
    
    return await prisma.$transaction(async (transaction) => {

      const user = await this.userService.createUser(data, transaction);
      
      const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

      await this.otpService.createOTP(
        {
          code: verifyCode,
          type: "EMAIL_VERIFICATION",
          user: { connect: { id: user.id } },
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
        transaction
      );
      
      const html = VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verifyCode
      );

      await this.emailService.sendEmail("Verificacao de Email <test@test.com>", user.email, "Codigo de Verificacao", html);

      return { user };
    });
  }
}
