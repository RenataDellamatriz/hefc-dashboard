import * as z from "zod";

export enum DonationStatus {
  PENDING = 'pending',
  RECEIVED = 'received',
}

export enum DonationType {
  MEDICINE = 'medicine',
  SUPPLIES = 'supplies',
  EQUIPMENT = 'equipment',
  MONEY = 'money',
  FOOD = 'food',
  CLOTHES = 'clothes',
  OTHER = 'other',
}

export const RegisterDonationFormSchema = z.object({
  // Dados do Doador
  donorName: z.string().min(1, 'Nome do doador é obrigatório'),
  donorType: z.enum(['individual', 'company']).default('individual'),
  donorCpf: z.string().optional(),
  donorCnpj: z.string().optional(),
  donorPhone: z.string().optional(),

  // Endereço
  donorZipCode: z.string().optional(),
  donorStreet: z.string().optional(),
  donorNumber: z.string().optional(),
  donorComplement: z.string().optional(),
  donorNeighborhood: z.string().optional(),
  donorCity: z.string().optional(),
  donorState: z.string().optional(),

  // Dados da Doação
  patientId: z.number().optional().nullable(),
  patientName: z.string().optional(),
  itemDescription: z.string().optional(),
  quantity: z.number().min(0).optional(),
  unit: z.string().optional(),
  estimatedValue: z.string().optional(),
  type: z.nativeEnum(DonationType).optional(),
  amount: z.string().optional(),
  status: z.nativeEnum(DonationStatus).default(DonationStatus.PENDING),
}).refine((data) => {
  if (data.donorType === 'individual') {
    return !!data.donorCpf;
  }
  return true;
}, {
  message: 'CPF é obrigatório para pessoa física',
  path: ['donorCpf'],
}).refine((data) => {
  if (data.donorType === 'company') {
    return !!data.donorCnpj;
  }
  return true;
}, {
  message: 'CNPJ é obrigatório para pessoa jurídica',
  path: ['donorCnpj'],
});

export type RegisterDonationFormValues = z.infer<typeof RegisterDonationFormSchema>;