import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ConflictException } from "../utils/errors/http.errors";

const prisma = new PrismaClient();

export class UserService {
  async createUser(
    data: Prisma.UserCreateInput,
    transaction?: Prisma.TransactionClient
  ) {
    const client = transaction ?? prisma;

    const existingUser = await client.user.findUnique({
      where: { email: data.email },
    });;

    if (existingUser) throw new ConflictException("O e-mail já está em uso");

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return client.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async updateUser(
    id: string,
    data: Prisma.UserUpdateInput,
    transaction?: Prisma.TransactionClient
  ) {
    const client = transaction ?? prisma;
    return client.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: string, transaction?: Prisma.TransactionClient) {
    const client = transaction ?? prisma;
    return client.user.delete({
      where: { id },
    });
  }
}
