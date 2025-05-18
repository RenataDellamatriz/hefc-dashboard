// schemas/workshops.ts
import { z } from "zod";

export const RegisterWorkshopFormSchema = z.object({
  name: z.string().min(1),
  weekday: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  participants: z.coerce.number().int().min(1),
  status: z.enum(["active", "inactive", "cancelled"]),
});

export type RegisterWorkshopFormValues = z.infer<typeof RegisterWorkshopFormSchema>;
