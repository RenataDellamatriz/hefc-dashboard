import { z } from "zod";

export const RegisterAppointmentFormSchema = z.object({
  patientId: z.number({
    required_error: "Patient ID is required",
  }),
  professional: z.string().min(1, "Professional is required"),
  specialty: z.string().min(1, "Specialty is required"),
  notes: z.string().optional(),
  appointmentDate: z.string().optional(),
  patientName: z.string().min(1).optional(),
  type: z.enum(["cancer", "family", "other"], {
    required_error: "Appointment type is required",
  }),
  status: z.enum(["ongoing", "completed"], {
    required_error: "Status is required",
  }),
});

export type RegisterAppointmentFormValues = z.infer<typeof RegisterAppointmentFormSchema>;
