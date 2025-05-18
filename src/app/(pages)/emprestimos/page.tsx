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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RegisterLoanFormSchema, RegisterLoanFormValues } from "@/schemas/loan";
import { Loan } from "@/types/loan";
import { addLoan, getLoan } from "@/api/loan";
import { formatDate } from "@/lib/utils";

const loansHeader = [
  { label: "Data do empréstimo", key: "loanDate" },
  { label: "Data da devolução", key: "returnDate" },
  { label: "Paciente", key: "patientName" },
  { label: "Equipamento", key: "equipment" },
  { label: "Status", key: "status" },
  { label: "Mais detalhes", key: "details" },
];

const defaultValues: RegisterLoanFormValues = {
  loanDate: "",
  returnDate: "",
  patientName: "",
  equipment: "",
  status: "active",
};

function translateStatus(status: string): string {
  switch (status) {
    case "active":
      return "Ativo";
    case "returned":
      return "Devolvido";
    case "overdue":
      return "Atrasado";
    default:
      return status;
  }
}

const Loans = () => {
  const [loansList, setLoansList] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("");

  const form = useForm<RegisterLoanFormValues>({
    resolver: zodResolver(RegisterLoanFormSchema),
    defaultValues,
  });

  const translatedAppointments = loansList.map((loan) => ({
    ...loan,
    status: translateStatus(loan.status),
    loanDate: formatDate(loan.loanDate),
    returnDate: formatDate(loan.returnDate),
  }));

  const filteredLoans = translatedAppointments.filter(
    (loan) =>
      loan.patientName.toLowerCase().includes(filter.toLowerCase()) ||
      loan.equipment.toLowerCase().includes(filter.toLowerCase()) ||
      loan.status.toLowerCase().includes(filter.toLowerCase())
  );

  async function getList() {
    try {
      setIsLoading(true);
      const loans = await getLoan();
      if (loans) {
        setLoansList(loans);
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

  async function handleFormSubmit(data: RegisterLoanFormValues) {
    try {
      setIsLoading(true);
      const response = await addLoan(data);
      if (response) {
        toast.success("Empréstimo registrado com sucesso!");
        form.reset();
        getList();
      }
    } catch (error) {
      toast.error(`Erro ao registrar empréstimo, ${error}`);
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard
          title="Total de Empréstimos"
          value={loansList.length}
          description=""
          icon={<FileText size={24} />}
        />
        <InfoCard
          title="Empréstimos Ativos"
          value={loansList.filter((loan) => loan.status === "active").length}
          description="Em Uso"
          icon={<FileText size={24} />}
        />
      </div>

      <Tabs defaultValue="lista" className="w-full">
        <TabsList>
          <TabsTrigger value="lista">Lista de Empréstimos</TabsTrigger>
          <TabsTrigger value="adicionar">Adicionar Empréstimos</TabsTrigger>
        </TabsList>
        <TabsContent value="lista">
          <DashboardTable
            isLoading={false}
            list={filteredLoans}
            table={{ data: filteredLoans, header: loansHeader }}
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
                          <Input
                            placeholder="Nome do Paciente"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="equipment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Equipamento</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Equipamento"
                              {...field}
                              disabled={isLoading}
                            />
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
                            disabled={isLoading}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Ativo</SelectItem>
                              <SelectItem value="returned">
                                Devolvido
                              </SelectItem>
                              <SelectItem value="overdue">Atrasado</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="loanDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data do Empréstimo</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="returnDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data da Devolução</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" isLoading={isLoading}>
                    Registrar Empréstimo
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

export default Loans;
