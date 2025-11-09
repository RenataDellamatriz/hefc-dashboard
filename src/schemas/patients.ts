import { z } from "zod";

const childSchema = z.object({
  name: z.string().min(1, "Child name is required"),
  age: z.number().min(0, "Age must be greater than or equal to zero"),
});

export const RegisterPatientFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  type: z.enum(["cancer", "family", "other"], {
    required_error: "Select patient type",
  }),
  status: z.enum(["ongoing", "completed"], {
    required_error: "Select patient status",
  }), 
  birthDate: z.string().min(1, { message: "Birth date is required" }),
  cpf: z.string().min(1, { message: "CPF is required" }),
  rg: z.string().min(1, { message: "RG is required" }),
  address: z.string().min(1, { message: "Full address is required" }),
  zipCode: z.string().min(1, { message: "ZIP code is required" }),
  phone: z.string().min(1, { message: "Phone is required" }),
  maritalStatus: z.string().min(1, { message: "Marital status is required" }),
  spouseName: z.string().optional(),
  children: z.array(childSchema).optional(),
});

export type RegisterPatientFormValues = z.infer<typeof RegisterPatientFormSchema>;