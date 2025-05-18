import { z } from "zod";

export const RegisterAppointmentFormSchema = z.object({
  appointmentDate: z.string({
    required_error: "Data é obrigatória",
  }),
  patientName: z.string().min(1, "Nome do paciente é obrigatório"),
  type: z.enum(["cancer", "family", "other"], {
    required_error: "Tipo de atendimento é obrigatório",
  }),
  status: z.enum(["ongoing", "completed"], {
    required_error: "Status é obrigatório",
  }),
});

export type RegisterAppointmentFormValues = z.infer<typeof RegisterAppointmentFormSchema>;
