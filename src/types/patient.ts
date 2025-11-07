export type Patient = {
  id: number;
  name: string;
  cpf?: string;
  rg?: string;
  birthDate?: string;
  phone?: string;
  address?: string;
  zipCode?: string;
  maritalStatus?: string;
  spouse?: string;
  children?: string;
  type: string;
  status: string;
  // Campos da API
  nomeCompleto?: string;
  dataNascimento?: string;
  enderecoCompleto?: string;
  telefone?: string;
  estadoCivil?: string;
  nomeEsposa?: string | null;
  filhos?: Array<{ nome: string; idade: number }> | null;
  atendimentos?: any[];
  emprestimos?: any[];
  doacoes?: any[];
  oficinas?: any[];
  createdAt?: string;
  cep?: string;
};

export enum PatientType {
  cancer = "Oncologia",
  family = "Familiar",
  other = "Outro diagnóstico",
}
