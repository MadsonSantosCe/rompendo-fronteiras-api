export class HttpError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export class BadRequestException extends HttpError {
  constructor(message = "Requisição inválida") {
    super(400, message);
  }
}

export class UnauthorizedException extends HttpError {
  constructor(message = "Não autorizado") {
    super(401, message);
  }
}

export class ForbiddenException extends HttpError {
  constructor(message = "Acesso negado") {
    super(403, message);
  }
}

export class NotFoundException extends HttpError {
  constructor(message = "Recurso não encontrado") {
    super(404, message);
  }
}

export class ConflictException extends HttpError {
  constructor(message = "Conflito de dados") {
    super(409, message);
  }
}

export class InternalServerErrorException extends HttpError {
  constructor(message = "Erro interno do servidor") {
    super(500, message);
  }
}
