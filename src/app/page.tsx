"use client";
import { getAppointment } from "@/api/appointment";
import { getDonation } from "@/api/donation";
import { getLoan } from "@/api/loan";
import { getWorkshop } from "@/api/workshop";
import { AppointmentsChart } from "@/components/charts/appointments-chart";
import { DonationsChart } from "@/components/charts/donations-chart";
import { LoansChart } from "@/components/charts/loans-chart";
import { InfoCard } from "@/components/common/info-card";
import { formatToBRL } from "@/lib/utils";
import { Appointment } from "@/types/appointment";
import { Donation } from "@/types/donation";
import { Loan } from "@/types/loan";
import { Workshop } from "@/types/workshop";
import { Calendar, ChartBar, FileText, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  async function getList() {
    try {
      const [appointmentsRes, donationsRes, loansRes, workshopsRes] =
        await Promise.all([
          getAppointment(),
          getDonation(),
          getLoan(),
          getWorkshop(),
        ]);

      if (appointmentsRes) setAppointments(appointmentsRes);
      if (donationsRes) setDonations(donationsRes);
      if (loansRes) setLoans(loansRes);
      if (workshopsRes) setWorkshops(workshopsRes);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getList();
  }, []);

  const totalAppointments = appointments.length;
  const totalDonations = donations.reduce(
    (acc, donation) => acc + parseFloat(donation.amount),
    0
  );
  const activeLoans = loans.filter((loan) => loan.status === "active").length;
  const totalWorkshops = workshops.length;
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <InfoCard
          title="Total de Atendimentos"
          value={totalAppointments.toLocaleString("pt-BR")}
          description="Ambulatório"          
          icon={<Users size={24} />}
        />
        <InfoCard
          title="Valor Total de Doações"
          value={formatToBRL(totalDonations)}
          description="Medicamentos e outras doações"          
          icon={<ChartBar size={24} />}
        />
        <InfoCard
          title="Empréstimos Ativos"
          value={activeLoans.toString()}
          description="Equipamentos médicos"          
          icon={<FileText size={24} />}
        />
        <InfoCard
          title="Oficinas Realizadas"
          value={totalWorkshops.toString()}
          description="Pessoas participantes"        
          icon={<Calendar size={24} />}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-6">
        <DonationsChart donations={donations} />
        <AppointmentsChart appointments={appointments} />
        <LoansChart loans={loans}/>
      </div>
    </>
  );
}
