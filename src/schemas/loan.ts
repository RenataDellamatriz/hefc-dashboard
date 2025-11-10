import { z } from 'zod';

export const RegisterLoanFormSchema = z.object({
  // Dados da Pessoa
  personName: z.string().min(1, 'Nome completo é obrigatório'),
  personType: z.enum(['individual', 'company']).default('individual'),
  personCpf: z.string().optional(),
  personCnpj: z.string().optional(),
  personPhone: z.string().optional(),

  // Endereço
  personZipCode: z.string().optional(),
  personStreet: z.string().optional(),
  personNumber: z.string().optional(),
  personComplement: z.string().optional(),
  personNeighborhood: z.string().optional(),
  personCity: z.string().optional(),
  personState: z.string().optional(),

  // Dados do Empréstimo
  patientId: z.number().optional().nullable().default(null),
  patientName: z.string().optional(),
  item: z.string().min(1, 'Item é obrigatório'),
  quantity: z.number().min(1, 'Quantidade é obrigatória'),
  unit: z.string().optional(),
  loanDate: z.string().optional(),
  returnDate: z.string().optional(),
  signedDeclaration: z.boolean().default(false),
  equipment: z.string().optional(),
  status: z.enum(['pending', 'returned', 'overdue']).default('pending'),
}).refine((data) => {
  if (data.personType === 'individual') {
    return !!data.personCpf;
  }
  return true;
}, {
  message: 'CPF é obrigatório para pessoa física',
  path: ['personCpf'],
}).refine((data) => {
  if (data.personType === 'company') {
    return !!data.personCnpj;
  }
  return true;
}, {
  message: 'CNPJ é obrigatório para pessoa jurídica',
  path: ['personCnpj'],
});

export type RegisterLoanFormValues = z.infer<typeof RegisterLoanFormSchema>;