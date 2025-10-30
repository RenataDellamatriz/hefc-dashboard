import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "*Campo obrigatório")
    .max(60, "*Máximo 60 caracteres"),
  password: z.string().min(1, "*Campo obrigatório"),
});

export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, "*Campo obrigatório")
    .max(60, "*Máximo 60 caracteres"),
  email: z
    .string()
    .min(1, "*Campo obrigatório")
    .email("*Email inválido")
    .max(60, "*Máximo 60 caracteres"),
  password: z
    .string()
    .min(6, "*Mínimo 6 caracteres")
    .max(20, "*Máximo 20 caracteres"),
  confirmPassword: z
    .string()
    .min(1, "*Campo obrigatório"),
  role: z
    .string()
    .min(1, "*Campo obrigatório"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "*Senhas não coincidem",
  path: ["confirmPassword"],
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
