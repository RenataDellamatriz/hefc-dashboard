import { apiRequest } from ".";
import { RegisterLoanFormValues } from "@/schemas/loan";
import { Loan } from "@/types/loan";

export async function getLoan(loanId?: string) {
  const { data } = await apiRequest<Loan[]>({
    method: "GET",
    url: `/loan${loanId ? `/${loanId}` : ""}`,
  });
  return data;
}

export async function addLoan(loan: RegisterLoanFormValues) {
  const { data } = await apiRequest({
    method: "POST",
    url: "/loan",
    data: loan,
  });

  return data;
}
