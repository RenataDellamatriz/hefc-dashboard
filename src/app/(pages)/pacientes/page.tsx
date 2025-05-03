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

const patientsList = [
  {
    id: 1,
    name: "João Silva",
    type: "Pessoa com Câncer",
    status: "Em Tratamento",
  },
  {
    id: 2,
    name: "Maria Oliveira",
    type: "Familiar",
    status: "Em Tratamento",
  },
  {
    id: 3,
    name: "Carlos Souza",
    type: "Outro Diagnóstico",
    status: "Finalizado",
  },
  {
    id: 4,
    name: "Ana Costa",
    type: "Pessoa com Câncer",
    status: "Em Tratamento",
  },
  {
    id: 5,
    name: "Ricardo Almeida",
    type: "Familiar",
    status: "Finalizado",
  },
];

const patientsHeader = [
  { label: "Nome", key: "name" },
  { label: "Tipo", key: "type" },
  { label: "Status", key: "status" },
  { label: "Mais detalhes", key: "details" },
];

const Patients = () => {
  const [filter, setFilter] = useState("");

  const filteredPatients = patientsList.filter(
    (patient) =>
      patient.name.toLowerCase().includes(filter.toLowerCase()) ||
      patient.type.toLowerCase().includes(filter.toLowerCase()) ||
      patient.status.toLowerCase().includes(filter.toLowerCase())
  );
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard
          title="Total de Pacientes"
          value="1.256"
          description="Cadastrados"
          icon={<Users size={24} />}
        />
        <InfoCard
          title="Pacientes Ativos"
          value="890"
          description="Em tratamento"
          icon={<Users size={24} />}
        />
        <InfoCard
          title="Novos Pacientes"
          value="45"
          description="Este mês"
          icon={<Users size={24} />}
        />
      </div>

      <Tabs defaultValue="lista" className="w-full">
        <TabsList>
          <TabsTrigger value="lista">Lista de Pacientes</TabsTrigger>
          <TabsTrigger value="adicionar">Adicionar Paciente</TabsTrigger>
        </TabsList>
        <TabsContent value="lista">
          <DashboardTable
            isLoading={false}
            list={filteredPatients}
            table={{ data: patientsList, header: patientsHeader }}
            message={"Nenhum paciente cadastrado."}
            searchFilter={filter}
            setSearchFilter={setFilter}
            title="Pacientes"
          />
        </TabsContent>
        <TabsContent value="adicionar">
          <Card>
            <CardHeader>
              <CardTitle>Novo Paciente</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4">
                <Input placeholder="name completo" disabled />
                <Input placeholder="Data de nascimento" type="date" disabled />
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="type de Paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cancer">Pessoa com Câncer</SelectItem>
                    <SelectItem value="familiar">Familiar</SelectItem>
                    <SelectItem value="outro">Outro Diagnóstico</SelectItem>
                  </SelectContent>
                </Select>
                <Button disabled>Cadastrar Paciente</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Patients;
