import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "*Campo obrigatório")
    .max(60, "*Máximo 60 caracteres"),
  password: z.string().min(1, "*Campo obrigatório"),
});
