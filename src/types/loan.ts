export type LoanStatus = "pending" | "returned" | "overdue";

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
}
