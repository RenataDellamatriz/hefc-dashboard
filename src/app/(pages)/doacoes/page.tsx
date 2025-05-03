"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartBar } from "lucide-react";
import { InfoCard } from "@/components/common/info-card";
import { DashboardTable } from "@/components/common/dashboard-table";
import { useState } from "react";

const donationsList = [
  {
    id: 1,
    date: "25/04/2023",
    type: "Medicamentos",
    value: "R$ 1.500,00",
    status: "Recebido",
  },
  {
    id: 2,
    date: "25/04/2023",
    type: "Outros",
    value: "R$ 1.500,00",
    status: "Pendente",
  },
];

const donationsHeader = [
  { label: "Data", key: "date" },
  { label: "Tipo", key: "type" },
  { label: "Valor", key: "value" },
  { label: "Status", key: "status" },
  { label: "Mais detalhes", key: "details" },
];

const Donations = () => {
  const [filter, setFilter] = useState("");

  const filteredDonations = donationsList.filter(
    (donation) =>
      donation.type.toLowerCase().includes(filter.toLowerCase()) ||
      donation.status.toLowerCase().includes(filter.toLowerCase())
  );
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard
          title="Total de Doações"
          value="R$ 218.809,68"
          description="2023"
          icon={<ChartBar size={24} />}
        />
        <InfoCard
          title="Doações do Mês"
          value="R$ 18.250,00"
          description="Abril/2025"
          icon={<ChartBar size={24} />}
        />
        <InfoCard
          title="Doadores Ativos"
          value="156"
          description="Recorrentes"
          icon={<ChartBar size={24} />}
        />
      </div>

      <Tabs defaultValue="lista" className="w-full">
        <TabsList>
          <TabsTrigger value="lista">Lista de Doações</TabsTrigger>
          <TabsTrigger value="adicionar">Nova Doação</TabsTrigger>
        </TabsList>
        <TabsContent value="lista">
          <DashboardTable
            isLoading={false}
            list={filteredDonations}
            table={{ data: donationsList, header: donationsHeader }}
            message={"Nenhum paciente cadastrado."}
            searchFilter={filter}
            setSearchFilter={setFilter}
            title="Doações"
          />
        </TabsContent>
        <TabsContent value="adicionar">
          <Card>
            <CardHeader>
              <CardTitle>Nova Doação</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4">
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de Doação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medicamentos">Medicamentos</SelectItem>
                    <SelectItem value="alimentos">Alimentação</SelectItem>
                    <SelectItem value="equipamentos">Equipamentos</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Valor" type="number" disabled />
                <Button disabled>Registrar Doação</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Donations;
