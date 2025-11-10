import { Patient } from "./patient";

export type LoanStatus = 'pending' | 'returned' | 'overdue';

export interface Loan {
  id: number;
  patientId?: number;
  patient?: Patient;
  
  // Dados da Pessoa
  personName: string;
  personCpf?: string;
  personCnpj?: string;
  personPhone?: string;
  personType: 'individual' | 'company';

  // Endereço
  personZipCode?: string;
  personStreet?: string;
  personNumber?: string;
  personComplement?: string;
  personNeighborhood?: string;
  personCity?: string;
  personState?: string;

  // Dados do Empréstimo
  item?: string;
  quantity?: number;
  unit?: string;
  loanDate?: string;
  returnDate?: string;
  signedDeclaration: boolean;
  patientName?: string;
  equipment?: string;
  status?: LoanStatus;
  createdAt?: string;
}