export interface Appointment {
  id: number;
  appointmentDate: string;
  patientName: string;
  type: AppointmentType;
  status: AppointmentStatus;
  createdAt: string;
}

export type AppointmentType = "cancer" | "family" | "other";
export type AppointmentStatus = "ongoing" | "completed";
