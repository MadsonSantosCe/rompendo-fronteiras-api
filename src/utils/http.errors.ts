export class AppError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class BadRequestException extends AppError {
  constructor(message = "Requisição inválida") {
    super(400, message);
  }
}

export class UnauthorizedException extends AppError {
  constructor(message = "Não autorizado") {
    super(401, message);
  }
}

export class ForbiddenException extends AppError {
  constructor(message = "Acesso negado") {
    super(403, message);
  }
}

export class NotFoundException extends AppError {
  constructor(message = "Recurso não encontrado") {
    super(404, message);
  }
}

export class ConflictException extends AppError {
  constructor(message = "Conflito de dados") {
    super(409, message);
  }
}

export class InternalServerErrorException extends AppError {
  constructor(message = "Erro interno do servidor") {
    super(500, message);
  }
}
