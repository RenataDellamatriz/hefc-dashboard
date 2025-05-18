import { RegisterAppointmentFormValues } from "@/schemas/appointment";
import { apiRequest } from ".";
import { Appointment } from "@/types/appointment";

export async function getAppointment(appointmentId?: string) {
  const { data } = await apiRequest<Appointment[]>({
    method: "GET",
    url: `/appointment${appointmentId ? `/${appointmentId}` : ""}`,
  });
  return data;
}

export async function addAppointment(appointment: RegisterAppointmentFormValues) {
  const { data } = await apiRequest({
    method: "POST",
    url: "/appointment",
    data: appointment,
  });

  return data;
}
