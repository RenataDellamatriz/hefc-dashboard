import { Appointment } from "@/types/appointment";
import { Loan } from "@/types/loan";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatToBRL(value: number | string): string {
  const number = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(number)) return "R$ 0,00";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(number);
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatDate(date: string | Date): string {
  let parsedDate: Date;

  if (typeof date === "string") {
    // Se a string já contém 'T', assume que é ISO
    parsedDate = date.includes("T")
      ? new Date(date)
      : new Date(date + "T00:00:00");
  } else {
    parsedDate = date;
  }

  if (isNaN(parsedDate.getTime())) {
    return "Data inválida";
  }

  return parsedDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateAndTime(dateAndTime: string | Date) {
  return new Date(dateAndTime).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function parseCurrency(
  value: string | number | undefined | null
): number {
  if (typeof value === "number") return value;
  if (!value) return 0;

  return parseFloat(value.replace(/\./g, "").replace(",", "."));
}

//appointment utils

export const APPOINTMENT_TYPE_LABELS: Record<string, string> = {
  cancer: "Pessoas com câncer",
  family: "Familiares",
  other: "Outros diagnósticos",
};

export function getAppointmentsPieData(appointments: Appointment[]) {
  const counts: Record<string, number> = {};

  appointments.forEach((appt) => {
    const key = appt.type?.toLowerCase() ?? "other";
    const label =
      APPOINTMENT_TYPE_LABELS[key] ?? APPOINTMENT_TYPE_LABELS["other"];

    counts[label] = (counts[label] ?? 0) + 1;
  });

  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

//loans utils

export function getLoansBarData(loans: Loan[]) {
  const grouped = new Map<string, { quantidade: number }>();

  for (const loan of loans) {
    const key = loan.equipment?.toLowerCase() ?? "Outros";
    const existing = grouped.get(key) ?? { quantidade: 0 };

    grouped.set(key, {
      quantidade: existing.quantidade + 1,
    });
  }

  const entries = Array.from(grouped.entries()).map(([name, stats]) => ({
    name: capitalize(name),
    quantidade: stats.quantidade,
  }));

  return entries.sort((a, b) => b.quantidade - a.quantidade);
}
