export type Patient = {
  id: number;
  name: string;
  type: string;
  status: string;
};

export enum PatientType {
  cancer = "Oncologia",
  family = "Familiar",
  other = "Outro diagnóstico",
}
