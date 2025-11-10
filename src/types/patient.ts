import { Appointment } from "./appointment";
import { Donation } from "./donation";
import { Loan } from "./loan";
import { Workshop } from "./workshop";

export enum PatientType {
  FAMILY = 'family',
  CANCER = 'cancer',
  OTHER = 'other',
}

export enum PatientStatus {
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
}

export interface Child {
  name: string;
  age: number;
}

export interface Patient {
  id: number;
  name: string;
  type: PatientType;
  status: PatientStatus;
  birthDate?: string;
  cpf?: string;
  rg?: string;
  phone?: string;
  maritalStatus?: string;
  spouseName?: string;
  children?: Child[];

  // Endereço
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;

  createdAt?: string;
  appointments?: Appointment[];
  loans?: Loan[];
  donations?: Donation[];
  workshops?: Workshop[];
}