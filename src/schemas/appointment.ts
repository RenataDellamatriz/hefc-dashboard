import { z } from "zod";

export const RegisterAppointmentFormSchema = z.object({
  pacienteId: z.number({
    required_error: "ID do paciente é obrigatório",
  }),
  data: z.string({
    required_error: "Data é obrigatória",
  }),
  profissional: z.string().min(1, "Profissional é obrigatório"),
  especialidade: z.string().min(1, "Especialidade é obrigatória"),
  observacoes: z.string().optional(),
  appointmentDate: z.string().optional(),
  patientName: z.string().min(1).optional(),
  type: z.enum(["cancer", "family", "other"], {
    required_error: "Tipo de atendimento é obrigatório",
  }),
  status: z.enum(["ongoing", "completed"], {
    required_error: "Status é obrigatório",
  }),
});

export type RegisterAppointmentFormValues = z.infer<typeof RegisterAppointmentFormSchema>;
