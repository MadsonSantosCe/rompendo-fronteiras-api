import { Prisma } from '@prisma/client';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from './http.errors';

export function PrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        throw new ConflictException('Registro já existe (violação de unique constraint)');

      case 'P2025':
        throw new NotFoundException('Registro não encontrado');

      case 'P2003':
        throw new BadRequestException('Violação de chave estrangeira');

      case 'P2000':
        throw new BadRequestException('Valor muito grande para o campo');

      case 'P2001':
        throw new NotFoundException('Campo obrigatório ausente');

      default:
        throw new InternalServerErrorException(`Erro Prisma: ${error.code}`);
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new BadRequestException('Erro de validação nos dados enviados');
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    throw new InternalServerErrorException('Erro ao inicializar conexão com o banco');
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    throw new InternalServerErrorException('Erro interno inesperado no Prisma');
  }
  
  throw error;
}
