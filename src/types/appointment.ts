export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  professional: string;
  specialty: string;
  appointmentDate: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  status: AppointmentStatus;
  type: AppointmentType;
}

export type AppointmentType = "cancer" | "family" | "other";
export type AppointmentStatus = "ongoing" | "completed";
