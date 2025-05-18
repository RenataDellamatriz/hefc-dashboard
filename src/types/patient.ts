export type Patient = {
  id: number;
  name: string;
  type: string;
  status: string;
};

export enum PatientType {
  cancer = "Cancêr",
  family = "Familiar",
  other = "Outro diagnóstico",
}
