import { Workshop } from "@/types/workshop";
import { apiRequest } from ".";
import { RegisterWorkshopFormValues } from "@/schemas/workshop";

export async function getWorkshop(workshopId?: string) {
  const { data } = await apiRequest<Workshop[]>({
    method: "GET",
    url: `/workshop${workshopId ? `/${workshopId}` : ""}`,
  });

  return data;
}

export async function addWorkshop(workshop: RegisterWorkshopFormValues) {
  const { data } = await apiRequest({
    method: "POST",
    url: "/workshop",
    data: workshop,
  });

  return data;
}
