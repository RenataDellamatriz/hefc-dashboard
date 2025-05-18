import { z } from "zod";

export const RegisterLoanFormSchema = z.object({
  loanDate: z.string().nonempty("A data do empréstimo é obrigatória"),
  returnDate: z.string().nonempty("A data do empréstimo é obrigatória"),
  patientName: z.string().nonempty("O nome do paciente é obrigatório"),
  equipment: z.string().nonempty("O equipamento é obrigatório"),
  status: z.enum(["active", "returned", "overdue"], {
    errorMap: () => ({ message: "Status inválido" }),
  }),
});

export type RegisterLoanFormValues = z.infer<typeof RegisterLoanFormSchema>;
