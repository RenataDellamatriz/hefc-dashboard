export type LoanStatus = "active" | "returned" | "overdue";

export interface Loan {
  id: number;
  pacienteId: number;
  item: string;
  quantidade: number;
  unidade: string;
  dataEmprestimo: string; // ISO date
  dataDevolucaoPrevista?: string; // ISO date
  declaracaoAssinada: boolean;
  status?: LoanStatus
  criadoEm?: string;
  atualizadoEm?: string;
}
