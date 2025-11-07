import * as z from "zod";

export const RegisterDonationFormSchema = z.object({
  pacienteId: z.number({
    required_error: "ID do paciente é obrigatório"
  }),
  descricaoItem: z.string().min(1, "Descrição do item é obrigatória"),
  quantidade: z.number().min(1, "Quantidade é obrigatória"),
  unidade: z.string().optional(),
  valorEstimado: z.string().optional(),
  type: z.enum([
    "medicine",
    "supplies",
    "equipment",
    "money",
    "food",
    "clothes",
    "other"
  ], { errorMap: () => ({ message: "Tipo inválido" }) }).optional(),
  amount: z.string().optional(),
  status: z.enum(["pending", "received"], {
    errorMap: () => ({ message: "Status inválido" })
  }).optional(),
  patientName: z.string().optional(),
  createdAt: z.string().optional(),
});

export type RegisterDonationFormValues = z.infer<
  typeof RegisterDonationFormSchema
>;
