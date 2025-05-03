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
import { Calendar } from "lucide-react";
import { InfoCard } from "@/components/common/info-card";
import { DashboardTable } from "@/components/common/dashboard-table";
import { useState } from "react";

const workshopsList = [
  {
    id: 1,
    name: "Artes Manuais",
    weekday: "Segunda-feira",
    time: "10:00 - 13:00",
    participants: "10",
    status: "Ativo",
  },
  {
    id: 2,
    name: "Musicoterapia",
    weekday: "Segunda-feira",
    time: "10:00 - 13:00",
    participants: "10",
    status: "Ativo",
  },
  {
    id: 3,
    name: "Yoga",
    weekday: "Segunda-feira",
    time: "10:00 - 13:00",
    participants: "10",
    status: "Ativo",
  },
];

const workshopsHeader = [
  { label: "Nome", key: "name" },
  { label: "Dia", key: "weekday" },
  { label: "Horário", key: "time" },
  { label: "Participantes", key: "participants" },
  { label: "Status", key: "status" },
  { label: "Mais detalhes", key: "details" },
];

const Workshops = () => {
  const [filter, setFilter] = useState("");

  const filteredWorkshops = workshopsList.filter(
    (workshop) =>
      workshop.name.toLowerCase().includes(filter.toLowerCase()) ||
      workshop.weekday.toLowerCase().includes(filter.toLowerCase()) ||
      workshop.status.toLowerCase().includes(filter.toLowerCase())
  );
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard
          title="Total de Oficinas"
          value="8"
          description="Ativas"
          icon={<Calendar size={24} />}
        />
        <InfoCard
          title="Participantes"
          value="124"
          description="Ativos"
          icon={<Calendar size={24} />}
        />
        <InfoCard
          title="Oficinas Programadas"
          value="3"
          description="Próximo mês"
          icon={<Calendar size={24} />}
        />
      </div>

      <Tabs defaultValue="lista" className="w-full">
        <TabsList>
          <TabsTrigger value="lista">Lista de Oficinas</TabsTrigger>
          <TabsTrigger value="adicionar">Nova Oficina</TabsTrigger>
          <TabsTrigger value="participantes">
            Adicionar Participantes
          </TabsTrigger>
        </TabsList>
        <TabsContent value="lista">
          <DashboardTable
            isLoading={false}
            list={filteredWorkshops}
            table={{ data: workshopsList, header: workshopsHeader }}
            message={"Nenhum paciente cadastrado."}
            searchFilter={filter}
            setSearchFilter={setFilter}
            title="Oficinas"
          />
        </TabsContent>
        <TabsContent value="adicionar">
          <Card>
            <CardHeader>
              <CardTitle>Nova Oficina</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4">
                <Input placeholder="Nome da Oficina" disabled />
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Dia da Semana" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="segunda">Segunda-feira</SelectItem>
                    <SelectItem value="terca">Terça-feira</SelectItem>
                    <SelectItem value="quarta">Quarta-feira</SelectItem>
                    <SelectItem value="quinta">Quinta-feira</SelectItem>
                    <SelectItem value="sexta">Sexta-feira</SelectItem>
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="Horário Início" type="time" disabled />
                  <Input placeholder="Horário Fim" type="time" disabled />
                </div>
                <Input placeholder="Capacidade Máxima" type="number" disabled />
                <Input placeholder="Nome do Facilitador" disabled />
                <Button disabled>Criar Oficina</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="participantes">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Participante à Oficina</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4">
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar Oficina" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="artes">Artes Manuais</SelectItem>
                    <SelectItem value="musica">Musicoterapia</SelectItem>
                    <SelectItem value="yoga">Yoga</SelectItem>
                  </SelectContent>
                </Select>
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar Paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ana">Ana Oliveira</SelectItem>
                    <SelectItem value="pedro">Pedro Costa</SelectItem>
                    <SelectItem value="maria">Maria Silva</SelectItem>
                  </SelectContent>
                </Select>
                <Button disabled>Adicionar Participante</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Workshops;
