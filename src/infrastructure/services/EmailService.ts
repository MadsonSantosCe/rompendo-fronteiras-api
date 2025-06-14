import { IEmailService } from "../../domain/services/IEmailService";
import nodemailer from "nodemailer";
import { PASSWORD_RESET_REQUEST_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from "../utils/mailtrap/email.templates";

export class EmailService implements IEmailService {
  sendVerificationEmail = async (
    to: string,
    verifyCode: string
  ): Promise<void> => {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: "Verificação de Email <test@test.com>",
        to,
        subject: "Código de Verificação",
        html: VERIFICATION_EMAIL_TEMPLATE.replace(
          "{verificationCode}",
          verifyCode
        ),
      };

      await transporter.sendMail(mailOptions);
    } catch (error: any) {
      throw new Error(`Falha ao enviar o e-mail: ${error.message || error}`);
    }
  };

  sendPasswordResetEmail = async (
    to: string,
    resetLink: string
  ): Promise<void> => {
    const recipient = [{ to }];

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: "Verificação de Email <test@test.com>",
        to,
        subject: "Redefinição de Senha",
        html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetLink),
        category: "Password Reset",
        recipient,
      };

      await transporter.sendMail(mailOptions);
    } catch (error) {
      throw new Error(`Error sending password reset email: ${error}`);
    }
  };
}
