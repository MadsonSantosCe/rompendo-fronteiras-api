import { PrismaClient } from "@prisma/client";
import { IOtpRepository } from "../../domain/repositories/IOtpRepository";
import { Otp, OtpType } from "../../domain/entities/Otp";

const prisma = new PrismaClient();

export class PrismaOtpRepository implements IOtpRepository {
  async findValidOtp(code: string, type: OtpType): Promise<Otp | null> {
    const otp = await prisma.otp.findFirst({
      where: {
        code,
        type,
        deletionAt: null,
        expiresAt: { gte: new Date() },
      },
    });
    if (!otp) return null;
    return new Otp(
      otp.id,
      otp.code,
      otp.type as OtpType,
      otp.userId,
      otp.expiresAt,
      otp.deletionAt
    );
  }

  async create(otp: {
    code: string;
    type: OtpType;
    userId: string;
    expiresAt: Date;
  }): Promise<Otp> {
    const newOtp = await prisma.otp.create({
      data: {
        code: otp.code,
        type: otp.type,
        userId: otp.userId,
        expiresAt: otp.expiresAt,
      },
    });
    return new Otp(
      newOtp.id,
      newOtp.code,
      newOtp.type as OtpType,
      newOtp.userId,
      newOtp.expiresAt,
      newOtp.deletionAt
    );
  }

  async invalidateOtp(id: string): Promise<void> {
    await prisma.otp.update({
      where: { id },
      data: { deletionAt: new Date() },
    });
  }

  async findValidOtpByUser(userId: string, type: OtpType): Promise<Otp | null> {
    const otp = await prisma.otp.findFirst({
      where: {
        userId,
        type,
        deletionAt: null,
        expiresAt: { gte: new Date() },
      },
    });
    if (!otp) return null;
    return new Otp(
      otp.id,
      otp.code,
      otp.type as OtpType,
      otp.userId,
      otp.expiresAt,
      otp.deletionAt
    );
  }
}
