import { z } from "zod";

export const RegisterLoanFormSchema = z.object({
  pacienteId: z.number({ required_error: "ID do paciente é obrigatório" }),
  item: z.string().min(1, "Item é obrigatório"),
  quantidade: z.number().min(1, "Quantidade é obrigatória"),
  unidade: z.string().min(1, "Unidade é obrigatória"),
  dataEmprestimo: z.string().min(1, "Data do empréstimo é obrigatória"),
  dataDevolucaoPrevista: z.string().min(1, "Data de devolução prevista é obrigatória"),
  declaracaoAssinada: z.boolean().optional(),
  loanDate: z.string().optional(),
  returnDate: z.string().optional(),
  patientName: z.string().optional(),
  equipment: z.string().optional(),
  status: z.enum(["pending", "returned"], {
    errorMap: () => ({ message: "Status inválido" })
  }).optional(),
});

export type RegisterLoanFormValues = z.infer<typeof RegisterLoanFormSchema>;
