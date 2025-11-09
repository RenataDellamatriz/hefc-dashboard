export type Donation = {
  id: number;
  patientId: number;
  itemDescription: string;
  quantity: number;
  unit: string;
  estimatedValue?: number;
  updatedAt?: string;
  createdAt?: string;
  amount?: string;
  type: string;
  status: string;
  patientName: string;
};