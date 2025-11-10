import { PatientStatus, PatientType } from "@/types/patient";
import { z } from "zod";

export const ChildSchema = z.object({
  name: z.string().min(1, 'Nome da criança é obrigatório'),
  age: z.number().min(0, 'Idade deve ser maior ou igual a 0'),
});

export const RegisterPatientFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.nativeEnum(PatientType),
  status: z.nativeEnum(PatientStatus),
  birthDate: z.string().optional(),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  phone: z.string().optional(),
  maritalStatus: z.string().optional(),
  spouseName: z.string().optional(),
  children: z.array(ChildSchema).optional(),

  // Endereço
  zipCode: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export type RegisterPatientFormValues = z.infer<typeof RegisterPatientFormSchema>;
export type ChildFormValues = z.infer<typeof ChildSchema>;