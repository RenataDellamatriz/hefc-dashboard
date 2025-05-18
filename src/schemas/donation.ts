import * as z from "zod";

export const RegisterDonationFormSchema = z.object({
  type: z.enum([
    "medicine",
    "supplies",
    "equipment",
    "money",
    "food",
    "clothes",
    "other",
  ]),
  amount: z
    .string()
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "O valor deve ser um número maior que zero"
    ),
  status: z.enum(["pending", "received"]),
});

export type RegisterDonationFormValues = z.infer<typeof RegisterDonationFormSchema>;