import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { InternalServerErrorException } from "../utils/errors/http.errors";

dotenv.config();

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(
    from: string,
    to: string,
    subject?: string,
    html?: string
  ): Promise<void> {
    try {
      const mailOptions = {
        from,
        to,
        subject,
        html,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error: any) {
      throw new InternalServerErrorException("Erro ao enviar email");
    }
  }
}
