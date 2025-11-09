// schemas/workshops.ts
import { z } from "zod";

export const RegisterWorkshopFormSchema = z.object({
  name: z.string().min(1, "Workshop name is required"),
  weekday: z.enum([
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday"
  ], {
    errorMap: () => ({ message: "Invalid weekday" })
  }),
  description: z.string().optional(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid start time"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid end time"),
  participantsCount: z.number().int().min(0, "Participants must be at least 0"),
  participants: z.union([
    z.array(z.object({ id: z.number() })),
    z.array(z.string())
  ]).optional(),
  status: z.enum(["active", "inactive", "cancelled"], {
    errorMap: () => ({ message: "Invalid status" })
  }),
});

export type RegisterWorkshopFormValues = z.infer<typeof RegisterWorkshopFormSchema>;
