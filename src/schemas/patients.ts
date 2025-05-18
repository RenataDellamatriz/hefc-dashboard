import { z } from "zod";

export const RegisterPatientFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Nome é obrigatório" })
    .max(100, { message: "Nome não pode ter mais de 100 caracteres" }),

  type: z.enum(["cancer", "family", "other"], {
    required_error: "Selecione o tipo de paciente",
  }),

  status: z.enum(["ongoing", "completed"], {
    required_error: "Selecione o status do paciente",
  }),
});

export type RegisterPatientFormValues = z.infer<typeof RegisterPatientFormSchema>;
