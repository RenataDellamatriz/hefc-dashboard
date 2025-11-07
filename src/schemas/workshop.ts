// schemas/workshops.ts
import { z } from "zod";

export const RegisterWorkshopFormSchema = z.object({
  name: z.string().min(1, "Nome da oficina é obrigatório"),
  weekday: z.enum([
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday"
  ], {
    errorMap: () => ({ message: "Dia da semana inválido" })
  }),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Horário de início inválido"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Horário de fim inválido"),
  participants: z.number().int().min(0, "Participantes deve ser pelo menos 0"),
  status: z.enum(["active", "inactive", "cancelled"], {
    errorMap: () => ({ message: "Status inválido" })
  }),
});

export type RegisterWorkshopFormValues = z.infer<typeof RegisterWorkshopFormSchema>;
