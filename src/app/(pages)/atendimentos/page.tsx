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

const appointmentsHeader = [
  { label: "Paciente", key: "patientName" },
  { label: "Data", key: "appointmentDate" },
  { label: "tipo", key: "type" },
  { label: "Status", key: "status" },
  { label: "Mais detalhes", key: "details" },
];

const defaultValues: RegisterAppointmentFormValues = {
  appointmentDate: "",
  patientName: "",
  type: "cancer",
  status: "ongoing",
};

const appointmentTypeLabels: Record<string, string> = {
  cancer: "Cancer",
  family: "Familia",
  other: "Outro",
};

const appointmentStatusLabels: Record<string, string> = {
  ongoing: "Em andamento",
  completed: "Concluido",
};

const Appointments = () => {
  const [filter, setFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([]);

  const form = useForm<RegisterAppointmentFormValues>({
    resolver: zodResolver(RegisterAppointmentFormSchema),
    defaultValues,
  });

  const translatedAppointments = appointmentsList.map((appointment) => ({
    ...appointment,
    appointmentDate: formatDateAndTime(appointment.appointmentDate),
    type:
      appointmentTypeLabels[appointment.type.toLowerCase()] || appointment.type,
    status:
      appointmentStatusLabels[appointment.status.toLowerCase()] ||
      appointment.status,
  }));

  const filteredAppointments = translatedAppointments.filter(
    (appointment) =>
      appointment.patientName.toLowerCase().includes(filter.toLowerCase()) ||
      appointment.type.toLowerCase().includes(filter.toLowerCase()) ||
      appointment.status.toLowerCase().includes(filter.toLowerCase())
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

  useEffect(() => {
    getList();
  }, []);

  async function handleFormSubmit(data: RegisterAppointmentFormValues) {
    try {
      setIsLoading(true);
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
                        <FormLabel>Nome do Paciente</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do Paciente" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                              <SelectItem value="cancer">
                                Pessoa com Câncer
                              </SelectItem>
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
                          <FormLabel>Data</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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
