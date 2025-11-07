import { z } from "zod";

const filhoSchema = z.object({
  nome: z.string().min(1, "Nome do filho é obrigatório"),
  idade: z.number().min(0, "Idade deve ser maior ou igual a zero"),
});

export const RegisterPatientFormSchema = z.object({
  name: z.string().min(1, { message: "Nome é obrigatório" }),
  type: z.enum(["cancer", "family", "other"], {
    required_error: "Selecione o tipo de paciente",
  }),
  status: z.enum(["ongoing", "completed"], {
    required_error: "Selecione o status do paciente",
  }),
  nomeCompleto: z.string().min(1, { message: "Nome completo é obrigatório" }),
  dataNascimento: z.string().min(1, { message: "Data de nascimento é obrigatória" }),
  cpf: z.string().min(1, { message: "CPF é obrigatório" }),
  rg: z.string().min(1, { message: "RG é obrigatório" }),
  enderecoCompleto: z.string().min(1, { message: "Endereço completo é obrigatório" }),
  cep: z.string().min(1, { message: "CEP é obrigatório" }),
  telefone: z.string().min(1, { message: "Telefone é obrigatório" }),
  estadoCivil: z.string().min(1, { message: "Estado civil é obrigatório" }),
  nomeEsposa: z.string().optional(),
  filhos: z.array(filhoSchema).optional(),
});

export type RegisterPatientFormValues = z.infer<typeof RegisterPatientFormSchema>;
