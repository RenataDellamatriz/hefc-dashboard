"use client";
import { AppointmentsChart } from "@/components/charts/appointments-chart";
import { DonationsChart } from "@/components/charts/donations-chart";
import { LoansChart } from "@/components/charts/loans-chart";
import { InfoCard } from "@/components/common/info-card";
import { Calendar, ChartBar, FileText, Users } from "lucide-react";

export default function Home() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <InfoCard
          title="Total de Atendimentos"
          value="2.662"
          description="Ambulatório"
          trend={{ value: 12, isPositive: true }}
          icon={<Users size={24} />}
        />
        <InfoCard
          title="Valor Total de Doações"
          value="R$ 218.809,68"
          description="Medicamentos e outras doações"
          trend={{ value: 8, isPositive: true }}
          icon={<ChartBar size={24} />}
        />
        <InfoCard
          title="Empréstimos Ativos"
          value="156"
          description="Equipamentos médicos"
          trend={{ value: 5, isPositive: true }}
          icon={<FileText size={24} />}
        />
        <InfoCard
          title="Oficinas Realizadas"
          value="120"
          description="Pessoas participantes"
          trend={{ value: 3, isPositive: false }}
          icon={<Calendar size={24} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
        <DonationsChart />
        <AppointmentsChart />
        <LoansChart />
      </div>

    
    </>
  );
}
