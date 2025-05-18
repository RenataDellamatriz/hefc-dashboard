import { Patient } from "@/types/patient";
import { apiRequest } from ".";
import { RegisterPatientFormValues } from "@/schemas/patients";

export async function getPatient(patientId?: string) {
  const { data } = await apiRequest<Patient[]>({
    method: "GET",
    url: `/patient${patientId ? `/${patientId}` : ""}`,
  });

  return data;
}

export async function addPatient(patient: RegisterPatientFormValues) {
  const { data } = await apiRequest({
    method: "POST",
    url: "/patient",
    data: patient,
  });

  return data;
}
