import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();
import { VERIFICATION_EMAIL_TEMPLATE } from "../utils/mailtrap/email.templates";

export const sendVerificationEmail = async (
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