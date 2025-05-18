"use client";

import { Calendar } from "lucide-react";
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
    label: "Horario de início",
    key: "startTime",
  },
  {
    label: "Horario de encerramento",
    key: "endTime",
  },
  { label: "Participants", key: "participants" },
  {
    label: "Status",
    key: "status",
  },
  { label: "Details", key: "details" },
];

const defaultValues: RegisterWorkshopFormValues = {
  name: "",
  weekday: "",
  startTime: "",
  endTime: "",
  participants: 0,
  status: "active",
};
const Workshops = () => {
  const [filter, setFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [workshopsList, setWorkshopsList] = useState<Workshop[]>([]);

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

  useEffect(() => {
    getList();
  }, []);

  async function handleFormSubmit(data: RegisterWorkshopFormValues) {
    try {
      setIsLoading(true);
      const response = await addWorkshop(data);
      if (response) {
        toast.success("Oficina criada com sucesso!");
        form.reset();
        getList();
      }
    } catch (error) {
      toast.error(`Erro ao criar oficina, ${error}`);
    } finally {
      setIsLoading(false);
    }
  }

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
            (acc, curr) => acc + curr.participants,
            0
          )}
          description="Ativos"
          icon={<Calendar size={24} />}
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
          />
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="participants"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Participantes</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} min={0} />
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
                              <SelectTrigger>
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
