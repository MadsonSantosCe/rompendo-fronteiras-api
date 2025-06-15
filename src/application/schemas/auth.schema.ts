import { z } from "zod";

export const signUpSchema = z.object({
  name: z
    .string()
    .min(3, { message: "O nome deve ter no mínimo 3 letras" })
    .max(50, { message: "O nome deve ter no máximo 50 letras" }),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(6, { message: "A senha deve ter no mínimo 6 caracteres" })
    .max(20, { message: "A senha deve ter no máximo 20 caracteres" }),
});

export const signInSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(6, { message: "A senha deve ter no mínimo 6 caracteres" })
    .max(20, { message: "A senha deve ter no máximo 20 caracteres" }),
});

export const verifyEmailSchema = z.object({
  code: z.string().regex(/^\d{6}$/, {
    message: "O código deve conter 6 números.",
  }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});


