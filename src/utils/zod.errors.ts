import { HandlerHttpError } from "./http.errors";

export class ZodException extends HandlerHttpError {
  constructor(message = "Erro de validação nos dados", details?: any) {
    super(400, message, details);
  }
}