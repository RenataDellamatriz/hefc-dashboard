export type LoanStatus = "active" | "returned" | "overdue";

export interface Loan {
  id: number;
  loanDate: string;
  returnDate: string;
  patientName: string;
  equipment: string;
  status: LoanStatus;
  createdAt: string;
}
