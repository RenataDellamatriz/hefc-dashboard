export type LoanStatus = "pending" | "returned" | "overdue";

export interface LoanContact {
  id: number;
  name: string;
  cpf?: string;
  zipCode?: string;
  address?: string;
  phone?: string;
  relationship?: string;
  loanId: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Loan {
  id: number;
  patientId: number;
  patientName: string;
  item: string;
  equipment: string;
  quantity: number;
  unit: string;
  loanDate: string;
  returnDate: string;
  signedDeclaration: boolean;
  status: LoanStatus;
  createdAt: string;
  updatedAt?: string;
  contacts: LoanContact[];
}