export class HandlerHttpError extends Error {
  public status: number;
  public datails?: any;

  constructor(status: number, message: string, datails?: any) {
    super(message);
    this.status = status;
    this.datails = datails;
    
    Object.setPrototypeOf(this, HandlerHttpError.prototype);
  }
}

export class BadRequestException extends HandlerHttpError {
  constructor(message = "Requisição inválida") {
    super(400, message);
  }
}

export class UnauthorizedException extends HandlerHttpError {
  constructor(message = "Não autorizado") {
    super(401, message);
  }
}

export class ForbiddenException extends HandlerHttpError {
  constructor(message = "Acesso negado") {
    super(403, message);
  }
}

export class NotFoundException extends HandlerHttpError {
  constructor(message = "Recurso não encontrado") {
    super(404, message);
  }
}

export class ConflictException extends HandlerHttpError {
  constructor(message = "Conflito de dados") {
    super(409, message);
  }
}

export class InternalServerErrorException extends HandlerHttpError {
  constructor(message = "Erro interno do servidor") {
    super(500, message);
  }
}
