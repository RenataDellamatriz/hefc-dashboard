import { Appointment } from "./appointment";
import { Donation } from "./donation";
import { Loan } from "./loan";
import { Workshop } from "./workshop";

export type Patient = {
  id: number;
  name: string;
  cpf?: string;
  rg?: string;
  birthDate?: string;
  phone?: string;
  address?: string;
  zipCode?: string;
  maritalStatus?: string;
  spouse?: string; 
  type: string;
  status: string;
  spouseName?: string | null;
  children?: Array<{ name: string; age: number }> | null;
  appointments?: Appointment[];
  loans?: Loan[];
  donations?: Donation[];
  workshops?: Workshop[];
  createdAt?: string;
};

export enum PatientType {
  cancer = "Oncology",
  family = "Family",
  other = "Other diagnosis",
}
