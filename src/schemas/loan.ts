import { z } from "zod";

export const RegisterLoanFormSchema = z.object({
  patientId: z.number({ required_error: "Patient ID is required" }),
  item: z.string().min(1, "Item is required"),
  quantity: z.number().min(1, "Quantity is required"),
  signedDeclaration: z.boolean().optional(),
  loanDate: z.string(),
  returnDate: z.string(),
  patientName: z.string().optional(),
  status: z
    .enum(["pending", "returned"], {
      errorMap: () => ({ message: "Invalid status" }),
    })
    .optional(),
});

export type RegisterLoanFormValues = z.infer<typeof RegisterLoanFormSchema>;
