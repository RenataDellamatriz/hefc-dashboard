import { Patient } from "./patient";

export enum DonationStatus {
  PENDING = 'pending',
  RECEIVED = 'received',
}

export enum DonationType {
  MEDICINE = 'medicine',
  SUPPLIES = 'supplies',
  EQUIPMENT = 'equipment',
  MONEY = 'money',
  FOOD = 'food',
  CLOTHES = 'clothes',
  OTHER = 'other',
}

export interface Donation {
  id: number;
  patientId?: number;
  patient?: Patient;
  
  // Dados do Doador
  donorName: string;
  donorCpf?: string;
  donorCnpj?: string;
  donorPhone?: string;
  donorType: 'individual' | 'company';

  // Endereço
  donorZipCode?: string;
  donorStreet?: string;
  donorNumber?: string;
  donorComplement?: string;
  donorNeighborhood?: string;
  donorCity?: string;
  donorState?: string;

  // Dados da Doação
  itemDescription?: string;
  quantity?: number;
  unit?: string;
  estimatedValue?: string;
  type?: DonationType;
  amount?: string;
  status?: DonationStatus;
  createdAt?: string;
}