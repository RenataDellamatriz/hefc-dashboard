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
import { Users } from "lucide-react";
import { InfoCard } from "@/components/common/info-card";
import { DashboardTable } from "@/components/common/dashboard-table";
import { useState } from "react";

const appointmentsList = [
  {
    id: 1,
    date: "25/04/2023",
    name: "João Silva",
    type: "Pessoa com Câncer",
    status: "Em Andamento",
  },
  {
    id: 2,
    date: "25/04/2023",
    name: "Maria Oliveira",
    type: "Familiar",
    status: "Concluído",
  },
  {
    id: 3,
    date: "25/04/2023",
    name: "Pedro Souza",
    type: "Familiar",
    status: "Concluído",
  },
];

const appointmentsHeader = [
  { label: "Data", key: "date" },
  { label: "Paciente", key: "name" },
  { label: "tipo", key: "type" },
  { label: "Status", key: "status" },
  { label: "Mais detalhes", key: "details" },
];

const Pacientes = () => {
  const [filter, setFilter] = useState("");

  const appointmentsFiltrados = appointmentsList.filter(
    (appointment) =>
      appointment.name.toLowerCase().includes(filter.toLowerCase()) ||
      appointment.type.toLowerCase().includes(filter.toLowerCase()) ||
      appointment.status.toLowerCase().includes(filter.toLowerCase())
  );
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard
          title="Total de Atendimentos"
          value="2.662"
          description="2023"
          icon={<Users size={24} />}
        />
        <InfoCard
          title="Atendimentos Hoje"
          value="12"
          description="25/04/2025"
          icon={<Users size={24} />}
        />
        <InfoCard
          title="Em Espera"
          value="3"
          description="Fila de Atendimento"
          icon={<Users size={24} />}
        />
      </div>

      <Tabs defaultValue="lista" className="w-full">
        <TabsList>
          <TabsTrigger value="lista">Lista de Atendimentos</TabsTrigger>
          <TabsTrigger value="adicionar">Novo Atendimento</TabsTrigger>
        </TabsList>
        <TabsContent value="lista">
          <DashboardTable
            isLoading={false}
            list={appointmentsFiltrados}
            table={{ data: appointmentsFiltrados, header: appointmentsHeader }}
            message={"Nenhum paciente cadastrado."}
            searchFilter={filter}
            setSearchFilter={setFilter}
            title="Últimos atendimentos"
          />
        </TabsContent>
        <TabsContent value="adicionar">
          <Card>
            <CardHeader>
              <CardTitle>Novo Atendimento</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4">
                <Input placeholder="Nome do Paciente" disabled />
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de Atendimento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cancer">Pessoa com Câncer</SelectItem>
                    <SelectItem value="familiar">Familiar</SelectItem>
                    <SelectItem value="outro">Outro Diagnóstico</SelectItem>
                  </SelectContent>
                </Select>
                <Button disabled>Salvar Atendimento</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Pacientes;
