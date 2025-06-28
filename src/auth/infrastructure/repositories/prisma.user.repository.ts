import { Injectable, NotFoundException } from "@nestjs/common";
import { IUserRepository } from "../../domain/repositories/abstract-user.repository";
import { AuthUser } from "../../domain/entities/user.entity";
import { PrismaService } from "../../../database/prisma.service";

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) return null;

    return new AuthUser(
      user.id,
      user.name,
      user.email,
      user.password,
      user.verified
    );
  }

  async findById(id: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) throw new NotFoundException("Usuário não encontrado");

    return new AuthUser(
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
  }): Promise<AuthUser> {
    const newUser = await this.prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    return new AuthUser(
      newUser.id,
      newUser.name,
      newUser.email,
      newUser.password,
      newUser.verified
    );
  }

  async updateVerified(
    id: string,
    verified: boolean
  ): Promise<AuthUser | null> {
    const updated = await this.prisma.user.update({
      where: { id },
      data: { verified },
    });

    if (!updated) return null;

    return new AuthUser(
      updated.id,
      updated.name,
      updated.email,
      updated.password,
      updated.verified
    );
  }

  async updatePassword(id: string, password: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { password } });
  }
}
