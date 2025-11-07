import { Patient } from "@/types/patient";
import { apiRequest } from ".";
import { RegisterPatientFormValues } from "@/schemas/patients";

export async function getPatient(patientId?: string) {
  const { data } = await apiRequest<Patient[]>({
    method: "GET",
    url: `/patient${patientId ? `?patientId=${patientId}` : ""}`,
  });

  return data;
}

export async function addPatient(patient: RegisterPatientFormValues) {
  // Transformar os dados do formulário para o formato esperado pela API
  const apiData: Record<string, unknown> = {
    name: patient.name,
    type: patient.type,
    status: patient.status,
    nomeCompleto: patient.name, // O backend espera nomeCompleto
    estadoCivil: patient.maritalStatus || "", // O backend exige estadoCivil, enviar string vazia se não preenchido
  };

  // Adicionar campos opcionais apenas se tiverem valor
  if (patient.birthDate) {
    apiData.dataNascimento = patient.birthDate;
  }
  if (patient.cpf) {
    apiData.cpf = patient.cpf;
  }
  if (patient.rg) {
    apiData.rg = patient.rg;
  }
  if (patient.address) {
    apiData.enderecoCompleto = patient.address;
  }
  if (patient.zipCode) {
    apiData.cep = patient.zipCode;
  }
  if (patient.phone) {
    apiData.telefone = patient.phone;
  }
  if (patient.spouse) {
    apiData.nomeEsposa = patient.spouse;
  }
  // Tratar o campo filhos: deve ser array ou null/undefined
  if (patient.children && patient.children.trim() !== "" && patient.children.toLowerCase() !== "não possui") {
    try {
      // Tentar parsear como JSON (array de objetos { nome, idade })
      const parsed = JSON.parse(patient.children);
      if (Array.isArray(parsed)) {
        apiData.filhos = parsed;
      } else {
        // Se não for array, não enviar o campo
      }
    } catch {
      // Se não for JSON válido, não enviar o campo filhos
      // O backend espera array ou null/undefined
    }
  }
  // Se children estiver vazio ou for "Não possui", não adicionar o campo filhos

  const { data } = await apiRequest({
    method: "POST",
    url: "/patient",
    data: apiData,
  });

  return data;
}
