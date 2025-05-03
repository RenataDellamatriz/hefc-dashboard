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
import { FileText } from "lucide-react";
import { InfoCard } from "@/components/common/info-card";
import { DashboardTable } from "@/components/common/dashboard-table";
import { useState } from "react";

const loansList = [
  {
    id: 1,
    date: "25/04/2023",
    name: "João Silva",
    equipment: "Muletas",
    status: "Em uso",
  },
  {
    id: 2,
    date: "25/04/2023",
    name: "Maria Oliveira",
    equipment: "Cadeira de rodas",
    status: "Em uso",
  },
];

const loansHeader = [
  { label: "Data", key: "date" },
  { label: "Paciente", key: "name" },
  { label: "Equipamento", key: "equipment" },
  { label: "Status", key: "status" },
  { label: "Mais detalhes", key: "details" },
];

const Loans = () => {
  const [filter, setFilter] = useState("");

  const filteredLoans = loansList.filter(
    (loan) =>
      loan.name.toLowerCase().includes(filter.toLowerCase()) ||
      loan.equipment.toLowerCase().includes(filter.toLowerCase()) ||
      loan.status.toLowerCase().includes(filter.toLowerCase())
  );
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard
          title="Total de Empréstimos"
          value="156"
          description="2023"
          icon={<FileText size={24} />}
        />
        <InfoCard
          title="Empréstimos Ativos"
          value="45"
          description="Em Uso"
          icon={<FileText size={24} />}
        />
        <InfoCard
          title="Equipamentos"
          value="89"
          description="Disponíveis"
          icon={<FileText size={24} />}
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
            list={filteredLoans}
            table={{ data: loansList, header: loansHeader }}
            message={"Nenhum paciente cadastrado."}
            searchFilter={filter}
            setSearchFilter={setFilter}
            title="Empréstimos"
          />
        </TabsContent>
        <TabsContent value="adicionar">
          <Card>
            <CardHeader>
              <CardTitle>Novo Empréstimo</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4">
                <Input placeholder="Nome do Paciente" disabled />
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Equipamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cadeira">Cadeira de Rodas</SelectItem>
                    <SelectItem value="muleta">Muletas</SelectItem>
                    <SelectItem value="cama">Cama Hospitalar</SelectItem>
                  </SelectContent>
                </Select>
                <Button disabled>Registrar Empréstimo</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Loans;
