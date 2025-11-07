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
import { getPatient } from "@/api/patient";
import { Patient } from "@/types/patient";
import { PatientAutocomplete } from "@/components/common/patient-autocomplete";
import { DetailsModal } from "@/components/common/details-modal";

const loansHeader = [
  { label: "Data do empréstimo", key: "loanDate" },
  { label: "Data prevista devolução", key: "expectedReturnDate" },
  { label: "Data da devolução", key: "returnDate" },
  { label: "Paciente", key: "patientName" },
  { label: "Item", key: "item" },
  { label: "Quantidade", key: "quantity" },
  { label: "Status", key: "status" },
  { label: "Mais detalhes", key: "details" },
];

const defaultValues: RegisterLoanFormValues = {
  loanDate: "",
  returnDate: "",
  expectedReturnDate: "",
  patientName: "",
  patientId: undefined,
  item: "",
  equipment: "",
  quantity: undefined,
  unit: "",
  signedDeclaration: false,
  status: "active",
};

function translateStatus(status: string): string {
  switch (status) {
    case "active":
      return "Em andamento";
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
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | undefined>();
  const [selectedLoanDetails, setSelectedLoanDetails] = useState<Loan | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const form = useForm<RegisterLoanFormValues>({
    resolver: zodResolver(RegisterLoanFormSchema),
    defaultValues,
  });

  const translatedLoans = loansList.map((loan) => ({
    ...loan,
    status: translateStatus(loan.status),
    loanDate: formatDate(loan.loanDate),
    returnDate: loan.returnDate ? formatDate(loan.returnDate) : "-",
    expectedReturnDate: loan.expectedReturnDate ? formatDate(loan.expectedReturnDate) : "-",
    item: loan.item || loan.equipment || "-",
    quantity: loan.quantity ? `${loan.quantity} ${loan.unit || ""}` : "-",
  }));

  const filteredLoans = translatedLoans.filter(
    (loan) =>
      loan.patientName.toLowerCase().includes(filter.toLowerCase()) ||
      (loan.item || "").toLowerCase().includes(filter.toLowerCase()) ||
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

  const activeLoans = loansList.filter((loan) => loan.status === "active");
  const returnedLoans = loansList.filter((loan) => loan.status === "returned");

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard
          title="Total de Empréstimos"
          value={loansList.length}
          description=""
          icon={<FileText size={24} />}
        />
        <InfoCard
          title="Empréstimos Ativos"
          value={activeLoans.length}
          description="Em andamento"
          icon={<FileText size={24} />}
        />
        <InfoCard
          title="Devolvidos"
          value={returnedLoans.length}
          description="Finalizados"
          icon={<FileText size={24} />}
        />
      </div>

      <Tabs defaultValue="lista" className="w-full">
        <TabsList>
          <TabsTrigger value="lista">Lista de Empréstimos</TabsTrigger>
          <TabsTrigger value="adicionar">Adicionar Empréstimo</TabsTrigger>
        </TabsList>
        <TabsContent value="lista">
          <DashboardTable
            isLoading={false}
            list={filteredLoans}
            table={{ data: filteredLoans, header: loansHeader }}
            message={"Nenhum empréstimo cadastrado."}
            searchFilter={filter}
            setSearchFilter={setFilter}
            title="Empréstimos"
            onDetailsClick={(item) => {
              const loan = loansList.find((l) => l.id === item.id);
              if (loan) {
                setSelectedLoanDetails(loan);
                setIsDetailsModalOpen(true);
              }
            }}
          />
          <DetailsModal
            open={isDetailsModalOpen}
            onOpenChange={setIsDetailsModalOpen}
            title={`Detalhes do Empréstimo`}
          >
            {selectedLoanDetails && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Paciente</label>
                    <p className="text-sm text-gray-900">{selectedLoanDetails.patientName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Item</label>
                    <p className="text-sm text-gray-900">{selectedLoanDetails.item || selectedLoanDetails.equipment}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Data do Empréstimo</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedLoanDetails.loanDate)}</p>
                  </div>
                  {selectedLoanDetails.expectedReturnDate && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Data Prevista de Devolução</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedLoanDetails.expectedReturnDate)}</p>
                    </div>
                  )}
                  {selectedLoanDetails.returnDate && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Data de Devolução</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedLoanDetails.returnDate)}</p>
                    </div>
                  )}
                  {selectedLoanDetails.quantity && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Quantidade</label>
                      <p className="text-sm text-gray-900">
                        {selectedLoanDetails.quantity} {selectedLoanDetails.unit || ""}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Status</label>
                    <p className="text-sm text-gray-900">{translateStatus(selectedLoanDetails.status)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Declaração Assinada</label>
                    <p className="text-sm text-gray-900">
                      {selectedLoanDetails.signedDeclaration ? "Sim" : "Não"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DetailsModal>
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
                  <FormField
                    control={form.control}
                    name="item"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome do item"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantidade</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Quantidade"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unidade</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: unidade, kg, litros"
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
                              <SelectItem value="active">Em andamento</SelectItem>
                              <SelectItem value="returned">Devolvido</SelectItem>
                              <SelectItem value="overdue">Atrasado</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      name="expectedReturnDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Prevista de Devolução</FormLabel>
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
                  <FormField
                    control={form.control}
                    name="signedDeclaration"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value || false}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="h-4 w-4"
                          />
                        </FormControl>
                        <FormLabel>Declaração assinada</FormLabel>
                      </FormItem>
                    )}
                  />
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
