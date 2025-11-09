import { Patient } from "./patient";

export type Workshop = {
  id: number;
  patientId: number;
  patientName?: string;
  name: string;
  description?: string;
  weekday: string; // ex: "monday"
  startTime: string; // ex: "09:00"
  endTime: string; // ex: "10:30"
  participants?: Patient[];
  createdAt?: string;
  updatedAt?: string;
  participantsCount?: number;
  status: string;
};

