import { ZodSchema } from "zod"; 
import { ZodException } from "../utils/errors/zod.errors";

export class ZodService {
  static validate<T>(schema: ZodSchema<T>, data: unknown): T {
    const result = schema.safeParse(data);

    if (!result.success) {
      throw new ZodException(
        "Erro de validação de dados",
        result.error.flatten().fieldErrors
      );
    }

    return result.data;
  }
}
