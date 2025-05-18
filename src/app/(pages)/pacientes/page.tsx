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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users } from "lucide-react";
import { InfoCard } from "@/components/common/info-card";
import { DashboardTable } from "@/components/common/dashboard-table";
import { useEffect, useState } from "react";
import { addPatient, getPatient } from "@/api/patient";
import { Patient } from "@/types/patient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  RegisterPatientFormSchema,
  RegisterPatientFormValues,
} from "@/schemas/patients";
import { toast } from "sonner";

const typeLabels: Record<string, string> = {
  cancer: "Pessoa com Câncer",
  family: "Familiar",
  other: "Outro Diagnóstico",
};

const statusLabels: Record<string, string> = {
  ongoing: "Em Tratamento",
  completed: "Finalizado",
};

const patientsHeader = [
  { label: "Nome", key: "name" },
  { label: "Tipo", key: "type" },
  { label: "Status", key: "status" },
  { label: "Mais detalhes", key: "details" },
];

const defaultValues: RegisterPatientFormValues = {
  name: "",
  type: "cancer",
  status: "ongoing",
};

const Patients = () => {
  const [filter, setFilter] = useState("");
  const [patientsList, setPatientsList] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterPatientFormValues>({
    resolver: zodResolver(RegisterPatientFormSchema),
    defaultValues,
  });

  const translatedPatientList = patientsList.map((patient) => ({
    ...patient,
    type: typeLabels[patient.type] || patient.type,
    status: statusLabels[patient.status] || patient.status,
  }));

  const filteredPatients = translatedPatientList.filter(
    (patient) =>
      patient.name.toLowerCase().includes(filter.toLowerCase()) ||
      patient.type.toLowerCase().includes(filter.toLowerCase()) ||
      patient.status.toLowerCase().includes(filter.toLowerCase())
  );

  async function getPatientsList() {
    try {
      setIsLoading(true);
      const patients = await getPatient();
      if (patients) {
        setPatientsList(patients);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getPatientsList();
  }, []);

  async function handleFormSubmit(data: RegisterPatientFormValues) {
    try {
      setIsLoading(true);
      const response = await addPatient(data);
      if (response) {
        toast.success("Paciente cadastrado com sucesso!");
        form.reset();
        getPatientsList();
      }
    } catch (error) {
      toast.error(`Erro ao cadastrar paciente, ${error}`);
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard
          title="Total de Pacientes"
          value={new Map(patientsList.map((p) => [p.id, p])).size}
          description="Cadastrados"
          icon={<Users size={24} />}
        />
        <InfoCard
          title="Pacientes Ativos"
          value={patientsList.filter((p) => p.status === "ongoing").length}
          description="Em tratamento"
          icon={<Users size={24} />}
        />
        <InfoCard
          title="Atendimentos finalizados"
          value={patientsList.filter((p) => p.status === "completed").length}
          description="Pessoas atendidas"
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
            isLoading={isLoading}
            list={filteredPatients}
            table={{ data: filteredPatients, header: patientsHeader }}
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
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((data) => {
                    handleFormSubmit(data);
                  })}
                  className="grid gap-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Paciente</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Tipo de Paciente" />
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
                          <FormLabel>Status do Paciente</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Status do Paciente" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ongoing">
                                Em Tratamento
                              </SelectItem>
                              <SelectItem value="completed">
                                Finalizado
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" variant="default" isLoading={isLoading}>
                    Cadastrar Paciente
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

export default Patients;
