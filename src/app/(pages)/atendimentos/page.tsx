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
import { useEffect, useState } from "react";
import { Appointment } from "@/types/appointment";
import {
  RegisterAppointmentFormSchema,
  RegisterAppointmentFormValues,
} from "@/schemas/appointment";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addAppointment, getAppointment } from "@/api/appointment";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { formatDate, formatDateAndTime } from "@/lib/utils";
import { getPatient } from "@/api/patient";
import { Patient } from "@/types/patient";
import { PatientAutocomplete } from "@/components/common/patient-autocomplete";
import { DetailsModal } from "@/components/common/details-modal";

const appointmentsHeader = [
  { label: "Paciente", key: "patientName" },
  { label: "Profissional", key: "professionalName" },
  { label: "Especialidade", key: "specialty" },
  { label: "Data", key: "appointmentDate" },
  { label: "Tipo", key: "type" },
  { label: "Status", key: "status" },
  { label: "Mais detalhes", key: "details" },
];

const defaultValues: RegisterAppointmentFormValues = {
  appointmentDate: "",
  patientName: "",
  patientId: 0,
  professional: "",
  specialty: "",
  notes: "",
  type: "cancer",
  status: "ongoing",
};

const appointmentTypeLabels: Record<string, string> = {
  cancer: "Oncologia",
  family: "Familiar",
  other: "Outro",
};

const appointmentStatusLabels: Record<string, string> = {
  ongoing: "Em andamento",
  completed: "Concluído",
};

const Appointments = () => {
  const [filter, setFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number>(0);
  const [selectedAppointmentDetails, setSelectedAppointmentDetails] =
    useState<Appointment | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const form = useForm<RegisterAppointmentFormValues>({
    resolver: zodResolver(RegisterAppointmentFormSchema),
    defaultValues,
  });

  const translatedAppointments = appointmentsList.map((appointment) => ({
    ...appointment,
    appointmentDate: formatDateAndTime(appointment.appointmentDate),
    type: appointmentTypeLabels[appointment.type] || appointment.specialty,
    professionalName: appointment.professional || "-",
    specialty: appointment.specialty || "-",
    status: appointmentStatusLabels[appointment.status] || appointment.status,
  }));

  const filteredAppointments = translatedAppointments.filter(
    (appointment) =>
      appointment.patientName.toLowerCase().includes(filter.toLowerCase()) ||
      appointment.type.toLowerCase().includes(filter.toLowerCase()) ||
      appointment.status.toLowerCase().includes(filter.toLowerCase()) ||
      (appointment.professional || "")
        .toLowerCase()
        .includes(filter.toLowerCase())
  );

  async function getList() {
    try {
      setIsLoading(true);
      const appointments = await getAppointment();
      if (appointments) {
        setAppointmentsList(appointments);
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

  useEffect(() => {
    if (selectedPatientId) {
      const patient = patients.find((p) => p.id === selectedPatientId);
      if (patient) {
        form.setValue("patientName", patient.name);
        form.setValue("patientId", patient.id);
      }
    }
  }, [selectedPatientId, patients, form]);

  async function handleFormSubmit(data: RegisterAppointmentFormValues) {
    try {
      setIsLoading(true);
      form.setValue("patientId", selectedPatientId);
      console.log(data);
      const response = await addAppointment(data);
      if (response) {
        toast.success("Atendimento registrado com sucesso!");
        form.reset();
        getList();
      }
    } catch (error) {
      toast.error(`Erro ao registrar atendimento, ${error}`);
    } finally {
      setIsLoading(false);
    }
  }

  const today = new Date();
  const todayString = today.toISOString().split("T")[0];

  const appointmentsToday = appointmentsList.filter((appointment) => {
    const appointmentDate = appointment.appointmentDate?.split("T")[0];
    return appointmentDate === todayString;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard
          title="Total de Atendimentos"
          value={appointmentsList.length}
          description="2023"
          icon={<Users size={24} />}
        />
        <InfoCard
          title="Atendimentos Hoje"
          value={appointmentsToday.length}
          description={formatDate(todayString)}
          icon={<Users size={24} />}
        />
        <InfoCard
          title="Em andamento"
          value={
            appointmentsList.filter(
              (appointment) => appointment.status === "ongoing"
            ).length
          }
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
            list={filteredAppointments}
            table={{ data: filteredAppointments, header: appointmentsHeader }}
            message={"Nenhum atendimento cadastrado."}
            searchFilter={filter}
            setSearchFilter={setFilter}
            title="Últimos atendimentos"
            onDetailsClick={(item) => {
              const appointment = appointmentsList.find(
                (a) => a.id === item.id
              );
              if (appointment) {
                setSelectedAppointmentDetails(appointment);
                setIsDetailsModalOpen(true);
              }
            }}
          />
          <DetailsModal
            open={isDetailsModalOpen}
            onOpenChange={setIsDetailsModalOpen}
            title={`Detalhes do Atendimento`}
          >
            {selectedAppointmentDetails && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      Paciente
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedAppointmentDetails.patientName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      Data e Hora
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDateAndTime(
                        selectedAppointmentDetails.appointmentDate
                      )}
                    </p>
                  </div>
                  {selectedAppointmentDetails.professional && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Profissional
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedAppointmentDetails.professional}
                      </p>
                    </div>
                  )}
                  {selectedAppointmentDetails.specialty && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Especialidade
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedAppointmentDetails.specialty}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      Tipo
                    </label>
                    <p className="text-sm text-gray-900">
                      {appointmentTypeLabels[
                        selectedAppointmentDetails.type?.toLowerCase()
                      ] || selectedAppointmentDetails.type}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      Status
                    </label>
                    <p className="text-sm text-gray-900">
                      {appointmentStatusLabels[
                        selectedAppointmentDetails.status?.toLowerCase()
                      ] || selectedAppointmentDetails.status}
                    </p>
                  </div>
                  {selectedAppointmentDetails.notes && (
                    <div className="col-span-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Observações
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedAppointmentDetails.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DetailsModal>
        </TabsContent>
        <TabsContent value="adicionar">
          <Card>
            <CardHeader>
              <CardTitle>Novo Atendimento</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleFormSubmit)}
                  className="grid gap-4"
                >
                  <FormField
                    control={form.control}
                    name="patientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Paciente</FormLabel>
                        <FormControl>
                          <PatientAutocomplete
                            patients={patients}
                            value={field.value}
                            onChange={(patientName, patientId) => {
                              field.onChange(patientName);
                              if (patientId) {
                                setSelectedPatientId(patientId);
                                form.setValue("patientId", patientId);
                              }
                            }}
                            placeholder="Buscar paciente..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="professional"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Profissional</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nome do profissional"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="specialty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Especialidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Especialidade" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Atendimento</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Tipo de Atendimento" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cancer">Oncologia</SelectItem>
                              <SelectItem value="family">Familiar</SelectItem>
                              <SelectItem value="other">
                                Outro Diagnóstico
                              </SelectItem>
                            </SelectContent>
                          </Select>
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
                                <SelectValue placeholder="Status do Atendimento" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ongoing">
                                Em andamento
                              </SelectItem>
                              <SelectItem value="completed">
                                Concluído
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="appointmentDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data e Hora</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Observações sobre o atendimento"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={isLoading}
                    isLoading={isLoading}
                  >
                    Salvar Atendimento
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

export default Appointments;
