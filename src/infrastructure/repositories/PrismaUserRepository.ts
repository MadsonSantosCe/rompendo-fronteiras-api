import { PrismaClient } from "@prisma/client";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/entities/User";

const prisma = new PrismaClient();

export class PrismaUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return new User(
      user.id,
      user.name,
      user.email,
      user.password,
      user.verified
    );
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return new User(
      user.id,
      user.name,
      user.email,
      user.password,
      user.verified
    );
  }

  async create(user: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    const newUser = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });
    return new User(
      newUser.id,
      newUser.name,
      newUser.email,
      newUser.password,
      newUser.verified
    );
  }

  async updateVerified(id: string, verified: boolean): Promise<User> {
    const updated = await prisma.user.update({
      where: { id },
      data: { verified },
    });
    return new User(
      updated.id,
      updated.name,
      updated.email,
      updated.password,
      updated.verified
    );
  }

  async updatePassword(id: string, password: string): Promise<void> {
    await prisma.user.update({ where: { id }, data: { password } });
  }
}
