export type Workshop = {
  id: number;
  nome: string;
  descricao?: string;
  diaSemana: string; // ex: "Segunda-feira"
  horarioInicio: string; // ex: "09:00"
  horarioFim: string; // ex: "10:30"
  participantes?: OficinaParticipante[];
  criadoEm?: string;
  atualizadoEm?: string;
};

export interface OficinaParticipante {
  id: number;
  oficinaId: number;
  pacienteId: number;
  paciente?: any;
  criadoEm?: string;
}
