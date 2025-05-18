import { apiRequest } from ".";
import { RegisterDonationFormValues } from "@/schemas/donation";
import { Donation } from "@/types/donation";

export async function getDonation(donationId?: string) {
  const { data } = await apiRequest<Donation[]>({
    method: "GET",
    url: `/donation${donationId ? `/${donationId}` : ""}`,
  });

  return data;
}

export async function addDonation(donation: RegisterDonationFormValues) {
  const { data } = await apiRequest({
    method: "POST",
    url: "/donation",
    data: donation,
  });

  return data;
}
