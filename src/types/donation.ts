export type Donation = {
  id: number;
  pacienteId: number;
  descricaoItem: string;
  quantidade: number;
  unidade: string;
  valorEstimado?: number;  
  atualizadoEm?: string;
  createdAt?: string;
  amount?: string;
  type: string;
  status: string;
  patientName: string;
};