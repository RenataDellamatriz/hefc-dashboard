import { z } from 'zod';

export const LoanContactSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  cpf: z.string().optional(),
  zipCode: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  relationship: z.string().optional(),
});

export const RegisterLoanFormSchema = z.object({
  patientId: z.number({ required_error: "ID do paciente é obrigatório" }),
  item: z.string().min(1, "Item é obrigatório"),
  quantity: z.number().min(1, "Quantidade é obrigatória"),
  signedDeclaration: z.boolean().optional(),
  loanDate: z.string().optional(),
  returnDate: z.string().optional(),
  patientName: z.string().optional(),
  status: z
    .enum(["pending", "returned", "overdue"], {
      errorMap: () => ({ message: "Status inválido" }),
    })
    .optional(),
  contacts: z.array(LoanContactSchema).optional(),
});

export type LoanContactFormValues = z.infer<typeof LoanContactSchema>;
export type RegisterLoanFormValues = z.infer<typeof RegisterLoanFormSchema>;