import {
  CanActivate,
  ExecutionContext,
  Global,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { PrismaService } from "src/database/prisma.service";
import { ITokenService } from "../../domain/services/abstract-token.service";

@Global()
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtTokenService: ITokenService,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Token não informado");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new UnauthorizedException("Token não informado");
    }

    try {
      const payload = this.jwtTokenService.verifyToken(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
      });

      if (!user) {
        throw new UnauthorizedException("Usuário não encontrado");
      }
      request["user"] = user;
      return true;
    } catch {
      throw new UnauthorizedException("Token inválido");
    }
  }
}
