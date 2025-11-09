"use client";

import { Badge, Calendar, Clock, User, Users } from "lucide-react";
import { InfoCard } from "@/components/common/info-card";
import { DashboardTable } from "@/components/common/dashboard-table";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Workshop } from "@/types/workshop";
import {
  RegisterWorkshopFormSchema,
  RegisterWorkshopFormValues,
} from "@/schemas/workshop";
import { addWorkshop, getWorkshop } from "@/api/workshop";
import { getPatient } from "@/api/patient";
import { Patient } from "@/types/patient";
import { DetailsModal } from "@/components/common/details-modal";

const weekdayMap: Record<string, string> = {
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
};

const statusMap: Record<string, string> = {
  active: "Ativa",
  inactive: "Inativa",
  cancelled: "Cancelada",
};

const workshopsHeader = [
  { label: "Nome", key: "name" },
  {
    label: "Dia",
    key: "weekday",
  },
  {
    label: "Horário de início",
    key: "startTime",
  },
  {
    label: "Horário de encerramento",
    key: "endTime",
  },
  { label: "Participantes", key: "participantsCount" },
  {
    label: "Status",
    key: "status",
  },
  { label: "Detalhes", key: "details" },
];

const defaultValues: RegisterWorkshopFormValues = {
  name: "",
  weekday: "monday",
  description: "",
  startTime: "",
  endTime: "",
  participantsCount: 0,
  participants: [],
  status: "active",
};

const Workshops = () => {
  const [filter, setFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [workshopsList, setWorkshopsList] = useState<Workshop[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(
    null
  );
  const [selectedPatientIds, setSelectedPatientIds] = useState<number[]>([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const form = useForm<RegisterWorkshopFormValues>({
    resolver: zodResolver(RegisterWorkshopFormSchema),
    defaultValues,
  });

  const translatedWorkshops = workshopsList.map((workshop) => ({
    ...workshop,
    weekday: weekdayMap[workshop.weekday.toLowerCase()] || workshop.weekday,
    status: statusMap[workshop.status.toLowerCase()] || workshop.status,
  }));

  const filteredWorkshops = translatedWorkshops.filter(
    (workshop) =>
      workshop.name.toLowerCase().includes(filter.toLowerCase()) ||
      workshop.weekday.toLowerCase().includes(filter.toLowerCase()) ||
      workshop.status.toLowerCase().includes(filter.toLowerCase())
  );

  async function getList() {
    try {
      setIsLoading(true);
      const workshops = await getWorkshop();
      if (workshops) {
        setWorkshopsList(workshops);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function getPatientsList() {
    try {
      const patientsData = await getPatient();
      if (patientsData) {
        setPatients(patientsData);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getList();
    getPatientsList();
  }, []);

  const handlePatientSelect = (patientId: number) => {
    setSelectedPatientIds((prev) => {
      if (prev.includes(patientId)) {
        return prev.filter((id) => id !== patientId);
      } else {
        return [...prev, patientId];
      }
    });
  };

  console.log("form errors", form.formState.errors);
  console.log("selectedPatientIds", selectedPatientIds);

  async function handleFormSubmit(data: RegisterWorkshopFormValues) {
    try {
      setIsLoading(true);

      const workshopData = {
        ...data,
        participants: selectedPatientIds.map((id) => ({ id })),
        participantsCount: selectedPatientIds.length,
      };

      const response = await addWorkshop(workshopData);
      if (response) {
        toast.success("Oficina criada com sucesso!");
        form.reset();
        setSelectedPatientIds([]);
        getList();
      }
    } catch (error) {
      toast.error(`Erro ao criar oficina, ${error}`);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    form.setValue("participantsCount", selectedPatientIds.length);
  }, [selectedPatientIds, form]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard
          title="Total de Oficinas"
          value={workshopsList.length}
          description="Ativas"
          icon={<Calendar size={24} />}
        />
        <InfoCard
          title="Participantes"
          value={workshopsList.reduce(
            (acc, curr) => acc + (curr.participantsCount ?? 0),
            0
          )}
          description="Ativos"
          icon={<User size={24} />}
        />
        <InfoCard
          title="Oficinas ativas"
          value={workshopsList.filter((w) => w.status === "active").length}
          description="Próximo mês"
          icon={<Calendar size={24} />}
        />
      </div>

      <Tabs defaultValue="lista" className="w-full">
        <TabsList>
          <TabsTrigger value="lista">Lista de Oficinas</TabsTrigger>
          <TabsTrigger value="adicionar">Nova Oficina</TabsTrigger>
        </TabsList>
        <TabsContent value="lista">
          <DashboardTable
            isLoading={isLoading}
            list={filteredWorkshops}
            table={{ data: filteredWorkshops, header: workshopsHeader }}
            message={"Nenhuma oficina cadastrada."}
            searchFilter={filter}
            setSearchFilter={setFilter}
            title="Oficinas"
            onDetailsClick={(item) => {
              const workshop = workshopsList.find((l) => l.id === item.id);
              if (workshop) {
                setSelectedWorkshop(workshop);
                setIsDetailsModalOpen(true);
              }
            }}
          />
          <DetailsModal
            open={isDetailsModalOpen}
            onOpenChange={setIsDetailsModalOpen}
            title={`Detalhes da Oficina - ${selectedWorkshop?.name}`}
          >
            {selectedWorkshop && (
              <div className="space-y-6">
                {/* Informações Básicas */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Informações da Oficina
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Nome
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedWorkshop.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Dia da Semana
                      </label>
                      <p className="text-sm text-gray-900">
                        {weekdayMap[selectedWorkshop.weekday] ||
                          selectedWorkshop.weekday}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Horário de Início
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedWorkshop.startTime}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Horário de Término
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedWorkshop.endTime}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Status
                      </label>
                      <p className="text-sm text-gray-900">
                        {statusMap[selectedWorkshop.status] ||
                          selectedWorkshop.status}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Número de Participantes
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedWorkshop.participantsCount || 0}
                      </p>
                    </div>
                    {selectedWorkshop.createdAt && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          Data de Criação
                        </label>
                        <p className="text-sm text-gray-900">
                          {new Date(
                            selectedWorkshop.createdAt
                          ).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status da Oficina */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        selectedWorkshop.status === "active"
                          ? "bg-green-500"
                          : selectedWorkshop.status === "inactive"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    />
                    <span className="text-sm font-medium">
                      Status:{" "}
                      {statusMap[selectedWorkshop.status] ||
                        selectedWorkshop.status}
                    </span>
                  </div>
                  {selectedWorkshop.status === "active" && (
                    <Badge className="bg-green-100 text-green-800">Ativa</Badge>
                  )}
                  {selectedWorkshop.status === "inactive" && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Inativa
                    </Badge>
                  )}
                  {selectedWorkshop.status === "cancelled" && (
                    <Badge className="bg-red-100 text-red-800">Cancelada</Badge>
                  )}
                </div>

                {/* Descrição */}
                {selectedWorkshop.description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Descrição</h3>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                      {selectedWorkshop.description}
                    </p>
                  </div>
                )}

                {/* Informações Adicionais */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Informações Adicionais
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-500" />
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          Duração
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedWorkshop.startTime &&
                          selectedWorkshop.endTime
                            ? `${selectedWorkshop.startTime} - ${selectedWorkshop.endTime}`
                            : "Horário não definido"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-500" />
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          Total de Participantes
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedWorkshop.participants?.length || 0}{" "}
                          participantes
                        </p>
                      </div>
                    </div>
                    {selectedWorkshop.updatedAt && (
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-500" />
                        <div>
                          <label className="text-sm font-semibold text-gray-700">
                            Última Atualização
                          </label>
                          <p className="text-sm text-gray-900">
                            {new Date(
                              selectedWorkshop.updatedAt
                            ).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lista de Participantes */}
                {selectedWorkshop.participants &&
                  selectedWorkshop.participants.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Participantes ({selectedWorkshop.participants.length})
                      </h3>
                      <div className="max-h-60 overflow-y-auto border rounded-md">
                        <div className="divide-y">
                          {selectedWorkshop.participants.map(
                            (participant, index) => (
                              <div
                                key={participant.id || index}
                                className="p-3 hover:bg-gray-50"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span>{index + 1}.</span>
                                    <p className="font-medium text-sm">
                                      {participant.name || "Nome não informado"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            )}
          </DetailsModal>
          {selectedWorkshop && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>
                  Detalhes da Oficina - {selectedWorkshop.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">
                      Informações da Oficina
                    </h4>
                    <p>
                      <strong>Nome:</strong> {selectedWorkshop.name}
                    </p>
                    <p>
                      <strong>Dia:</strong>{" "}
                      {weekdayMap[selectedWorkshop.weekday]}
                    </p>
                    <p>
                      <strong>Horário:</strong> {selectedWorkshop.startTime} às{" "}
                      {selectedWorkshop.endTime}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      {statusMap[selectedWorkshop.status]}
                    </p>
                    <p>
                      <strong>Participantes:</strong>{" "}
                      {selectedWorkshop.participantsCount}
                    </p>
                  </div>

                  {selectedWorkshop.participants &&
                    selectedWorkshop.participants.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Participantes</h4>
                        <div className="space-y-2">
                          {selectedWorkshop.participants.map((participant) => (
                            <div key={participant.id} className="border-b pb-2">
                              <p className="text-sm">
                                <strong>Nome:</strong>{" "}
                                {participant.name || "N/A"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {selectedWorkshop.description && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Descrição</h4>
                    <p>{selectedWorkshop.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="adicionar">
          <Card>
            <CardHeader>
              <CardTitle>Nova Oficina</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleFormSubmit)}
                  className="grid gap-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Oficina</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="weekday"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dia da Semana</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione um dia" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="monday">
                                Segunda-feira
                              </SelectItem>
                              <SelectItem value="tuesday">
                                Terça-feira
                              </SelectItem>
                              <SelectItem value="wednesday">
                                Quarta-feira
                              </SelectItem>
                              <SelectItem value="thursday">
                                Quinta-feira
                              </SelectItem>
                              <SelectItem value="friday">
                                Sexta-feira
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horário Início</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horário Fim</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue
                                  placeholder="Selecione o status"
                                  className="w-full"
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Ativa</SelectItem>
                              <SelectItem value="inactive">Inativa</SelectItem>
                              <SelectItem value="cancelled">
                                Cancelada
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Input placeholder="Descrição" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Seletor de Participantes */}
                  <div>
                    <h3 className="font-semibold mb-2 mt-2 border-t pt-4">
                      Participantes
                    </h3>
                    <div className="space-y-3">
                      {/* Lista de pacientes disponíveis */}
                      <div>
                        <p className="text-sm font-medium mb-2">
                          Selecionar pacientes:
                        </p>
                        <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                          {patients.map((patient) => (
                            <div
                              key={patient.id}
                              className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                                selectedPatientIds.includes(patient.id)
                                  ? "bg-blue-50 border border-blue-200"
                                  : "hover:bg-gray-50"
                              }`}
                              onClick={() => handlePatientSelect(patient.id)}
                            >
                              <input
                                type="checkbox"
                                checked={selectedPatientIds.includes(
                                  patient.id
                                )}
                                onChange={() => {}}
                                className="w-4 h-4"
                              />
                              <span className="text-sm">{patient.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" isLoading={isLoading}>
                    Criar Oficina
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Workshops;
