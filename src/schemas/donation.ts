import * as z from "zod";

export const RegisterDonationFormSchema = z.object({
  patientId: z.number({
    required_error: "Patient ID is required"
  }),
  itemDescription: z.string().min(1, "Item description is required"),
  quantity: z.number().min(1, "Quantity is required"),
  unit: z.string().optional(),
  estimatedValue: z.string().optional(),
  type: z.enum([
    "medicine",
    "supplies",
    "equipment",
    "money",
    "food",
    "clothes",
    "other"
  ], { errorMap: () => ({ message: "Invalid type" }) }).optional(),
  amount: z.string().optional(),
  status: z.enum(["pending", "received"], {
    errorMap: () => ({ message: "Invalid status" })
  }).optional(),
  patientName: z.string().optional(),
  createdAt: z.string().optional(),
});

export type RegisterDonationFormValues = z.infer<
  typeof RegisterDonationFormSchema
>;
