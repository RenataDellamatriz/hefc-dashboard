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
import { FileText, Loader2 } from "lucide-react";
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

// Funções de máscara
const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};

const maskCNPJ = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};

const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
};

const maskCEP = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{3})\d+?$/, "$1");
};

const loansHeader = [
  { label: "Pessoa", key: "personName" },
  { label: "Item", key: "item" },
  { label: "Quantidade", key: "quantity" },
  { label: "Status", key: "status" },
  { label: "Mais detalhes", key: "details" },
];

const personTypeLabels: Record<string, string> = {
  individual: "Pessoa Física",
  company: "Pessoa Jurídica",
};

const defaultValues: RegisterLoanFormValues = {
  personName: "",
  personType: "individual",
  personCpf: "",
  personCnpj: "",
  personPhone: "",
  personZipCode: "",
  personStreet: "",
  personNumber: "",
  personComplement: "",
  personNeighborhood: "",
  personCity: "",
  personState: "",
  loanDate: "",
  returnDate: "",
  patientName: "",
  patientId: null,
  item: "",
  quantity: 0,
  unit: "",
  signedDeclaration: false,
  status: "pending",
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

// Tipo para a resposta da API de CEP
interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

const Loans = () => {
  const [loansList, setLoansList] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<
    number | undefined
  >();
  const [selectedLoanDetails, setSelectedLoanDetails] = useState<Loan | null>(
    null
  );
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);

  const form = useForm<RegisterLoanFormValues>({
    resolver: zodResolver(RegisterLoanFormSchema),
    defaultValues,
  });

  const personType = form.watch("personType");

  // Função para buscar CEP
  const fetchCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, "");

    if (cleanCEP.length !== 8) return;

    setIsLoadingCEP(true);
    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCEP}/json/`
      );
      const data: ViaCEPResponse = await response.json();

      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }

      // Preenche os campos de endereço automaticamente
      form.setValue("personStreet", data.logradouro || "");
      form.setValue("personComplement", data.complemento || "");
      form.setValue("personNeighborhood", data.bairro || "");
      form.setValue("personCity", data.localidade || "");
      form.setValue("personState", data.uf || "");

      // Foca no campo número após preencher o CEP
      const numberInput = document.querySelector(
        'input[name="personNumber"]'
      ) as HTMLInputElement;
      if (numberInput) {
        numberInput.focus();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error("Erro ao buscar CEP");
      console.error(error);
    } finally {
      setIsLoadingCEP(false);
    }
  };

  // Monitora mudanças no CEP
  const watchedCEP = form.watch("personZipCode");
  useEffect(() => {
    if (watchedCEP && watchedCEP.replace(/\D/g, "").length === 8) {
      fetchCEP(watchedCEP);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedCEP]);

  const translatedLoans = loansList.map((loan) => ({
    ...loan,
    status: loan.status && translateStatus(loan.status),
    loanDate: loan.loanDate && formatDate(loan.loanDate),
    returnDate: loan.returnDate && formatDate(loan.returnDate),
    item: loan.item || loan.equipment || "-",
    quantity: loan.quantity ? `${loan.quantity} ${loan.unit || ""}` : "-",
    personName: loan.personName || "-",
  }));

  const filteredLoans = translatedLoans.filter(
    (loan) =>
      loan.personName.toLowerCase().includes(filter.toLowerCase()) ||
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

      const submitData = {
        ...data,
        patientId:
          selectedPatientId && selectedPatientId > 0 ? selectedPatientId : null,
      };

      const response = await addLoan(submitData);
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
                {/* Seção da Pessoa */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Dados da Pessoa
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Nome completo
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedLoanDetails.personName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Tipo
                      </label>
                      <p className="text-sm text-gray-900">
                        {personTypeLabels[selectedLoanDetails.personType] ||
                          selectedLoanDetails.personType}
                      </p>
                    </div>
                    {selectedLoanDetails.personCpf && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          CPF
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedLoanDetails.personCpf}
                        </p>
                      </div>
                    )}
                    {selectedLoanDetails.personCnpj && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          CNPJ
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedLoanDetails.personCnpj}
                        </p>
                      </div>
                    )}
                    {selectedLoanDetails.personPhone && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          Telefone
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedLoanDetails.personPhone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Seção de Endereço */}
                {(selectedLoanDetails.personZipCode ||
                  selectedLoanDetails.personStreet) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Endereço</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedLoanDetails.personZipCode && (
                        <div>
                          <label className="text-sm font-semibold text-gray-700">
                            CEP
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedLoanDetails.personZipCode}
                          </p>
                        </div>
                      )}
                      {selectedLoanDetails.personStreet && (
                        <div className="col-span-2">
                          <label className="text-sm font-semibold text-gray-700">
                            Logradouro
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedLoanDetails.personStreet}
                            {selectedLoanDetails.personNumber &&
                              `, ${selectedLoanDetails.personNumber}`}
                            {selectedLoanDetails.personComplement &&
                              ` - ${selectedLoanDetails.personComplement}`}
                          </p>
                        </div>
                      )}
                      {selectedLoanDetails.personNeighborhood && (
                        <div>
                          <label className="text-sm font-semibold text-gray-700">
                            Bairro
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedLoanDetails.personNeighborhood}
                          </p>
                        </div>
                      )}
                      {selectedLoanDetails.personCity && (
                        <div>
                          <label className="text-sm font-semibold text-gray-700">
                            Cidade
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedLoanDetails.personCity}
                            {selectedLoanDetails.personState &&
                              ` - ${selectedLoanDetails.personState}`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Seção do Empréstimo */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Dados do Empréstimo
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedLoanDetails.patientName && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          Paciente (se aplicável)
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedLoanDetails.patientName}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Item
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedLoanDetails.item ||
                          selectedLoanDetails.equipment}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Data do Empréstimo
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedLoanDetails.loanDate &&
                          formatDate(selectedLoanDetails.loanDate)}
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
                  className="space-y-6"
                >
                  {/* Seção da Pessoa */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Dados da Pessoa</h3>

                    <FormField
                      control={form.control}
                      name="personName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome completo *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nome completo"
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
                      name="personType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de pessoa</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="individual">
                                Pessoa Física
                              </SelectItem>
                              <SelectItem value="company">
                                Pessoa Jurídica
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {personType === "individual" && (
                        <FormField
                          control={form.control}
                          name="personCpf"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CPF *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="000.000.000-00"
                                  {...field}
                                  disabled={isLoading}
                                  onChange={(e) => {
                                    const maskedValue = maskCPF(e.target.value);
                                    field.onChange(maskedValue);
                                  }}
                                  maxLength={14}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {personType === "company" && (
                        <FormField
                          control={form.control}
                          name="personCnpj"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CNPJ *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="00.000.000/0000-00"
                                  {...field}
                                  disabled={isLoading}
                                  onChange={(e) => {
                                    const maskedValue = maskCNPJ(
                                      e.target.value
                                    );
                                    field.onChange(maskedValue);
                                  }}
                                  maxLength={18}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="personPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="(00) 00000-0000"
                                {...field}
                                disabled={isLoading}
                                onChange={(e) => {
                                  const maskedValue = maskPhone(e.target.value);
                                  field.onChange(maskedValue);
                                }}
                                maxLength={15}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Seção de Endereço */}
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-semibold">Endereço</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="personZipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CEP</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="00000-000"
                                  {...field}
                                  disabled={isLoading}
                                  onChange={(e) => {
                                    const maskedValue = maskCEP(e.target.value);
                                    field.onChange(maskedValue);
                                  }}
                                  maxLength={9}
                                />
                                {isLoadingCEP && (
                                  <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin" />
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="personState"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="UF"
                                {...field}
                                disabled={isLoading}
                                maxLength={2}
                                className="uppercase"
                                onChange={(e) =>
                                  field.onChange(e.target.value.toUpperCase())
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="personCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Cidade"
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
                      name="personStreet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logradouro</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Rua, Avenida, etc."
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
                        name="personNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número (opcional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Número"
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
                        name="personComplement"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Complemento (opcional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Apto, Bloco, etc."
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
                        name="personNeighborhood"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bairro</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Bairro"
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

                  {/* Seção do Empréstimo */}
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-semibold">
                      Dados do Empréstimo
                    </h3>

                    <FormField
                      control={form.control}
                      name="patientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Paciente (opcional)</FormLabel>
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
                              placeholder="Buscar paciente (opcional)..."
                              disabled={isLoading}
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
                          <FormLabel>Item *</FormLabel>
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
                            <FormLabel>Quantidade *</FormLabel>
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
                                <SelectItem value="pending">
                                  Em andamento
                                </SelectItem>
                                <SelectItem value="returned">
                                  Devolvido
                                </SelectItem>
                                <SelectItem value="overdue">
                                  Atrasado
                                </SelectItem>
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
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormLabel>Declaração assinada</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="w-full"
                  >
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
