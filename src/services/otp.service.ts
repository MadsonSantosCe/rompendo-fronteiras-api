import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class OTPService {
    async createOTP(data: Prisma.OtpCreateInput, transaction?: Prisma.TransactionClient) {
        const client = transaction ?? new PrismaClient();
        return client.otp.create({
            data: {
                ...data,
                code: data.code.toString(),
            },
        });
    }

    async findOTPByCode(code: string) {
        return prisma.otp.findFirst({
            where: { code },
        });
    }

    async updateOTP(id: string, data: Prisma.OtpUpdateInput, transaction?: Prisma.TransactionClient) {
        const client = transaction ?? prisma;
        return client.otp.update({
            where: { id },
            data,
        });
    }
}