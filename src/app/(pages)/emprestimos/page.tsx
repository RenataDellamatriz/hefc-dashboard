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
import { FileText, Plus, Trash2 } from "lucide-react";
import { InfoCard } from "@/components/common/info-card";
import { DashboardTable } from "@/components/common/dashboard-table";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Loan, LoanContact } from "@/types/loan";
import { addLoan, getLoan } from "@/api/loan";
import { formatDate } from "@/lib/utils";
import { getPatient } from "@/api/patient";
import { Patient } from "@/types/patient";
import { PatientAutocomplete } from "@/components/common/patient-autocomplete";
import { DetailsModal } from "@/components/common/details-modal";

const loansHeader = [
  { label: "Paciente", key: "patientName" },
  { label: "Item", key: "item" },
  { label: "Quantidade", key: "quantity" },
  { label: "Status", key: "status" },
  { label: "Mais detalhes", key: "details" },
];

const relationshipOptions = [
  { value: "spouse", label: "Cônjuge" },
  { value: "child", label: "Filho(a)" },
  { value: "parent", label: "Pai/Mãe" },
  { value: "sibling", label: "Irmão(ã)" },
  { value: "friend", label: "Amigo(a)" },
  { value: "caregiver", label: "Cuidador(a)" },
  { value: "other", label: "Outro" },
];

const defaultValues: RegisterLoanFormValues = {
  loanDate: "",
  returnDate: "",
  patientName: "",
  patientId: 0,
  item: "",
  quantity: 0,
  signedDeclaration: false,
  status: "pending",
  contacts: [],
};

function translateStatus(status: string): string {
  switch (status) {
    case "pending":
      return "Pendente";
    case "returned":
      return "Devolvido";
    case "overdue":
      return "Atrasado";
    default:
      return status;
  }
}

function translateRelationship(relationship: string): string {
  const option = relationshipOptions.find(opt => opt.value === relationship);
  return option ? option.label : relationship;
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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "contacts",
  });

  const translatedLoans = loansList.map((loan) => ({
    ...loan,
    status: loan.status && translateStatus(loan.status),
    loanDate: formatDate(loan.loanDate),
    returnDate: formatDate(loan.returnDate),
    item: loan.item || loan.equipment || "-",
    quantity: loan.quantity ? `${loan.quantity} ${loan.unit || ""}` : "-",
  }));

  const filteredLoans = translatedLoans.filter(
    (loan) =>
      loan.patientName.toLowerCase().includes(filter.toLowerCase()) ||
      (loan.item || "").toLowerCase().includes(filter.toLowerCase()) ||
      (loan.status && loan.status.toLowerCase().includes(filter.toLowerCase()))
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
        form.reset(defaultValues);
        setSelectedPatientId(undefined);
        getList();
      }
    } catch (error) {
      toast.error(`Erro ao registrar empréstimo, ${error}`);
    } finally {
      setIsLoading(false);
    }
  }

  const addContact = () => {
    append({
      name: "",
      cpf: "",
      zipCode: "",
      address: "",
      phone: "",
      relationship: "",
    });
  };

  const activeLoans = loansList.filter((loan) => loan.status === "pending");
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
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      Paciente
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLoanDetails.patientName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      Item
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLoanDetails.item || selectedLoanDetails.equipment}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      Data do Empréstimo
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedLoanDetails.loanDate)}
                    </p>
                  </div>

                  {selectedLoanDetails.returnDate && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Data de Devolução
                      </label>
                      <p className="text-sm text-gray-900">
                        {formatDate(selectedLoanDetails.returnDate)}
                      </p>
                    </div>
                  )}
                  {selectedLoanDetails.quantity && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Quantidade
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedLoanDetails.quantity}{" "}
                        {selectedLoanDetails.unit || ""}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      Status
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLoanDetails.status &&
                        translateStatus(selectedLoanDetails.status)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      Declaração Assinada
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLoanDetails.signedDeclaration ? "Sim" : "Não"}
                    </p>
                  </div>
                </div>

                {/* Seção de Contatos */}
                {selectedLoanDetails.contacts && selectedLoanDetails.contacts.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Contatos para Retirada</h4>
                    <div className="space-y-4">
                      {selectedLoanDetails.contacts.map((contact: LoanContact) => (
                        <div key={contact.id} className="border rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-semibold text-gray-700">
                                Nome
                              </label>
                              <p className="text-sm text-gray-900">{contact.name}</p>
                            </div>
                            {contact.relationship && (
                              <div>
                                <label className="text-sm font-semibold text-gray-700">
                                  Parentesco
                                </label>
                                <p className="text-sm text-gray-900">
                                  {translateRelationship(contact.relationship)}
                                </p>
                              </div>
                            )}
                            {contact.cpf && (
                              <div>
                                <label className="text-sm font-semibold text-gray-700">
                                  CPF
                                </label>
                                <p className="text-sm text-gray-900">{contact.cpf}</p>
                              </div>
                            )}
                            {contact.phone && (
                              <div>
                                <label className="text-sm font-semibold text-gray-700">
                                  Telefone
                                </label>
                                <p className="text-sm text-gray-900">{contact.phone}</p>
                              </div>
                            )}
                            {contact.address && (
                              <div className="col-span-2">
                                <label className="text-sm font-semibold text-gray-700">
                                  Endereço
                                </label>
                                <p className="text-sm text-gray-900">{contact.address}</p>
                              </div>
                            )}
                            {contact.zipCode && (
                              <div>
                                <label className="text-sm font-semibold text-gray-700">
                                  CEP
                                </label>
                                <p className="text-sm text-gray-900">{contact.zipCode}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                  className="space-y-6"
                >
                  <div className="space-y-4">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
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
                                <SelectItem value="pending">
                                  Em andamento
                                </SelectItem>
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
                        name="returnDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de devolução</FormLabel>
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
                  </div>

                  {/* Seção de Contatos */}
                  <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Contatos para Retirada (Opcional)</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addContact}
                        disabled={isLoading}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Contato
                      </Button>
                    </div>

                    {fields.map((field, index) => (
                      <div key={field.id} className="border rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium">Contato {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`contacts.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome completo *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Nome do contato"
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
                            name={`contacts.${index}.relationship`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Parentesco</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  disabled={isLoading}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {relationshipOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`contacts.${index}.cpf`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CPF</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="000.000.000-00"
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
                            name={`contacts.${index}.phone`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Telefone</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="(00) 00000-0000"
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
                            name={`contacts.${index}.zipCode`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CEP</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="00000-000"
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
                            name={`contacts.${index}.address`}
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Endereço</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Endereço completo"
                                    {...field}
                                    disabled={isLoading}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button type="submit" isLoading={isLoading} className="w-full">
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