import { Injectable } from "@nestjs/common";
import { IOtpRepository } from "../../domain/repositories/abstract-otp.repository";
import { Otp, OtpType } from "../../domain/entities/otp.entity";
import { PrismaService } from "src/database/prisma.service";

@Injectable()
export class PrismaOtpRepository implements IOtpRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findValidOtp(code: string, type: OtpType): Promise<Otp | null> {
    const otp = await this.prisma.otp.findFirst({
      where: {
        code,
        type,
        deleted_at: null,
        expires_at: { gte: new Date() },
      },
    });

    if (!otp) return null;

    return new Otp(
      otp.id,
      otp.code,
      otp.type as OtpType,
      otp.user_id,
      otp.expires_at,
      otp.deleted_at
    );
  }

  async create(otp: {
    code: string;
    type: OtpType;
    user_id: string;
    expires_at: Date;
  }): Promise<Otp> {
    const newOtp = await this.prisma.otp.create({
      data: {
        code: otp.code,
        type: otp.type,
        user_id: otp.user_id,
        expires_at: otp.expires_at,
      },
    });

    return new Otp(
      newOtp.id,
      newOtp.code,
      newOtp.type as OtpType,
      newOtp.user_id,
      newOtp.expires_at,
      newOtp.deleted_at
    );
  }

  async invalidateOtp(id: string): Promise<void> {
    await this.prisma.otp.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async findValidOtpByUser(
    user_id: string,
    type: OtpType
  ): Promise<Otp | null> {
    const otp = await this.prisma.otp.findFirst({
      where: {
        user_id,
        type,
        deleted_at: null,
        expires_at: { gte: new Date() },
      },
    });

    if (!otp) return null;

    return new Otp(
      otp.id,
      otp.code,
      otp.type as OtpType,
      otp.user_id,
      otp.expires_at,
      otp.deleted_at
    );
  }
}
