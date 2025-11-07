export interface Appointment {
  id: number;
  pacienteId: number;
  patientName: string;
  profissional: string;
  especialidade: string;
  data: string; // ISO date
  observacoes?: string;
  criadoEm?: string;
  atualizadoEm?: string;
  status: string;
  type: string;
}

export type AppointmentType = "cancer" | "family" | "other";
export type AppointmentStatus = "ongoing" | "completed";
