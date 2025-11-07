import { apiRequest } from ".";

export interface PatientReport {
  paciente: {
    id: number;
    name: string;
    nomeCompleto: string;
    type: string;
    status: string;
    cpf: string;
    telefone: string;
  };
  atendimentos: Array<{
    id: number;
    data: string;
    profissional: string;
    especialidade: string;
  }>;
  emprestimos: Array<{
    id: number;
    item: string;
    dataEmprestimo: string;
    dataDevolucaoPrevista: string;
  }>;
  doacoes: Array<{
    id: number;
    descricaoItem: string;
    quantidade: number;
    valorEstimado: number;
  }>;
  oficinas: Array<{
    id: number;
    name: string;
    diaSemana: string;
  }>;
}

export async function getPatientReport(patientId?: string): Promise<PatientReport | PatientReport[]> {
  const { data } = await apiRequest<PatientReport | PatientReport[]>({
    method: "GET",
    url: `/relatorios/pacientes${patientId ? `?patientId=${patientId}` : ""}`,
  });

  return data;
}

