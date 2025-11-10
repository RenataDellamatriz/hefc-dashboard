/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CurrencyInput from "react-currency-input-field";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartBar, Loader2 } from "lucide-react";
import { InfoCard } from "@/components/common/info-card";
import { DashboardTable } from "@/components/common/dashboard-table";
import { useEffect, useState } from "react";
import {
  RegisterDonationFormSchema,
  RegisterDonationFormValues,
} from "@/schemas/donation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Donation, DonationStatus, DonationType } from "@/types/donation";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { addDonation, getDonation } from "@/api/donation";
import { cn, formatDecimalForAPI, formatToBRL } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { getPatient } from "@/api/patient";
import { Patient } from "@/types/patient";
import { PatientAutocomplete } from "@/components/common/patient-autocomplete";
import { DetailsModal } from "@/components/common/details-modal";

const defaultValues: RegisterDonationFormValues = {
  donorName: "",
  donorType: "individual",
  donorCpf: "",
  donorCnpj: "",
  donorPhone: "",
  donorZipCode: "",
  donorStreet: "",
  donorNumber: "",
  donorComplement: "",
  donorNeighborhood: "",
  donorCity: "",
  donorState: "",
  type: DonationType.MEDICINE,
  amount: "",
  patientName: "",
  patientId: 0,
  itemDescription: "",
  quantity: 0,
  unit: "",
  estimatedValue: "",
  status: DonationStatus.PENDING,
};

const donationsHeader = [
  { label: "Data", key: "date" },
  { label: "Doador", key: "donorName" },
  { label: "Tipo", key: "type" },
  { label: "Quantidade", key: "quantity" },
  { label: "Status", key: "status" },
  { label: "Mais detalhes", key: "details" },
];

const donationTypeLabels: Record<string, string> = {
  medicine: "Medicamentos",
  supplies: "Suprimentos",
  equipment: "Equipamentos",
  money: "Dinheiro",
  food: "Alimentos",
  clothes: "Roupas",
  other: "Outros",
};

const donationStatusLabels: Record<string, string> = {
  pending: "Pendente",
  received: "Recebido",
};

const donorTypeLabels: Record<string, string> = {
  individual: "Pessoa Física",
  company: "Pessoa Jurídica",
};

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

// Funções de máscara
const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

const maskCNPJ = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

const maskCEP = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1');
};

const Donations = () => {
  const [filter, setFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [donationsList, setDonationsList] = useState<Donation[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number>(0);
  const [selectedDonationDetails, setSelectedDonationDetails] =
    useState<Donation | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);

  const form = useForm<RegisterDonationFormValues>({
    resolver: zodResolver(RegisterDonationFormSchema),
    defaultValues,
  });

  const donorType = form.watch("donorType");

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
      form.setValue("donorStreet", data.logradouro || "");
      form.setValue("donorComplement", data.complemento || "");
      form.setValue("donorNeighborhood", data.bairro || "");
      form.setValue("donorCity", data.localidade || "");
      form.setValue("donorState", data.uf || "");

      // Foca no campo número após preencher o CEP
      const numberInput = document.querySelector(
        'input[name="donorNumber"]'
      ) as HTMLInputElement;
      if (numberInput) {
        numberInput.focus();
      }
    } catch (error: any) {
      toast.error("Erro ao buscar CEP");
      console.error(error);
    } finally {
      setIsLoadingCEP(false);
    }
  };

  // Monitora mudanças no CEP
  const watchedCEP = form.watch("donorZipCode");
  useEffect(() => {
    if (watchedCEP && watchedCEP.replace(/\D/g, "").length === 8) {
      fetchCEP(watchedCEP);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedCEP]);

  const translatedDonations = donationsList.map((donation) => {
    const patient = donation.patientId
      ? patients.find((p) => p.id === donation.patientId)
      : null;

    return {
      ...donation,
      amount: donation.amount
        ? formatToBRL(parseFloat(donation.amount.replace(",", ".")))
        : "R$ 0,00",
      date: donation.createdAt
        ? new Date(donation.createdAt).toLocaleDateString("pt-BR")
        : "-",
      type:
        (donation.type && donationTypeLabels[donation.type?.toLowerCase()]) ||
        donation.type,
      status:
        (donation.status &&
          donationStatusLabels[donation.status?.toLowerCase()]) ||
        donation.status,
      donorName: donation.donorName || "-",
      description: donation.itemDescription || "-",
      quantity: donation.quantity ?? "-",
      patient: patient?.name || "-",
    };
  });

  const filteredDonations = translatedDonations.filter(
    (donation) =>
      (donation.type &&
        donation.type.toLowerCase().includes(filter.toLowerCase())) ||
      (donation.status &&
        donation.status.toLowerCase().includes(filter.toLowerCase())) ||
      (donation.donorName || "").toLowerCase().includes(filter.toLowerCase()) ||
      (donation.patient || "").toLowerCase().includes(filter.toLowerCase())
  );

  async function getList() {
    try {
      setIsLoading(true);
      const donations = await getDonation();
      if (donations) {
        setDonationsList(donations);
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

  async function handleFormSubmit(data: RegisterDonationFormValues) {
    try {
      setIsLoading(true);
      const submitData = {
        ...data,
        patientId: selectedPatientId || undefined,
        estimatedValue: data.estimatedValue
          ? formatDecimalForAPI(data.estimatedValue)
          : undefined,
        amount: data.amount ? formatDecimalForAPI(data.amount) : undefined,
      };

      const response = await addDonation(submitData);
      if (response) {
        toast.success("Doação registrada com sucesso!");
        form.reset(defaultValues);
        setSelectedPatientId(0);
        getList();
      }
    } catch (error) {
      toast.error(`Erro ao registrar doação, ${error}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard
          title="Valor total de Doações"
          value={formatToBRL(
            donationsList.reduce(
              (acc, donation) =>
                acc +
                (donation.amount
                  ? parseFloat(donation.amount.replace(",", "."))
                  : 0),
              0
            )
          )}
          description="2023"
          icon={<ChartBar size={24} />}
        />

        <InfoCard
          title="Total de doações"
          value={donationsList.length}
          description="Recorrentes"
          icon={<ChartBar size={24} />}
        />
      </div>

      <Tabs defaultValue="lista" className="w-full">
        <TabsList>
          <TabsTrigger value="lista">Lista de Doações</TabsTrigger>
          <TabsTrigger value="adicionar">Nova Doação</TabsTrigger>
        </TabsList>
        <TabsContent value="lista">
          <DashboardTable
            isLoading={isLoading}
            list={filteredDonations}
            table={{ data: filteredDonations, header: donationsHeader }}
            message={"Nenhuma doação cadastrada."}
            searchFilter={filter}
            setSearchFilter={setFilter}
            title="Doações"
            onDetailsClick={(item) => {
              const donation = donationsList.find((d) => d.id === item.id);
              if (donation) {
                setSelectedDonationDetails(donation);
                setIsDetailsModalOpen(true);
              }
            }}
          />
          <DetailsModal
            open={isDetailsModalOpen}
            onOpenChange={setIsDetailsModalOpen}
            title={`Detalhes da Doação`}
          >
            {selectedDonationDetails && (
              <div className="space-y-6">
                {/* Seção do Doador */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Dados do Doador
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Nome do Doador
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedDonationDetails.donorName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Tipo
                      </label>
                      <p className="text-sm text-gray-900">
                        {donorTypeLabels[selectedDonationDetails.donorType] ||
                          selectedDonationDetails.donorType}
                      </p>
                    </div>
                    {selectedDonationDetails.donorCpf && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          CPF
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedDonationDetails.donorCpf}
                        </p>
                      </div>
                    )}
                    {selectedDonationDetails.donorCnpj && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          CNPJ
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedDonationDetails.donorCnpj}
                        </p>
                      </div>
                    )}
                    {selectedDonationDetails.donorPhone && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          Telefone
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedDonationDetails.donorPhone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Seção de Endereço */}
                {(selectedDonationDetails.donorZipCode ||
                  selectedDonationDetails.donorStreet) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Endereço</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedDonationDetails.donorZipCode && (
                        <div>
                          <label className="text-sm font-semibold text-gray-700">
                            CEP
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedDonationDetails.donorZipCode}
                          </p>
                        </div>
                      )}
                      {selectedDonationDetails.donorStreet && (
                        <div className="col-span-2">
                          <label className="text-sm font-semibold text-gray-700">
                            Logradouro
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedDonationDetails.donorStreet}
                            {selectedDonationDetails.donorNumber &&
                              `, ${selectedDonationDetails.donorNumber}`}
                            {selectedDonationDetails.donorComplement &&
                              ` - ${selectedDonationDetails.donorComplement}`}
                          </p>
                        </div>
                      )}
                      {selectedDonationDetails.donorNeighborhood && (
                        <div>
                          <label className="text-sm font-semibold text-gray-700">
                            Bairro
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedDonationDetails.donorNeighborhood}
                          </p>
                        </div>
                      )}
                      {selectedDonationDetails.donorCity && (
                        <div>
                          <label className="text-sm font-semibold text-gray-700">
                            Cidade
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedDonationDetails.donorCity}
                            {selectedDonationDetails.donorState &&
                              ` - ${selectedDonationDetails.donorState}`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Seção da Doação */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Dados da Doação
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {(() => {
                      const patient = selectedDonationDetails.patientId
                        ? patients.find(
                            (p) => p.id === selectedDonationDetails.patientId
                          )
                        : null;
                      const patientName =
                        selectedDonationDetails.patient || patient?.name;
                      return patientName ? (
                        <div>
                          <label className="text-sm font-semibold text-gray-700">
                            Paciente (se aplicável)
                          </label>
                          <p className="text-sm text-gray-900">
                            {patientName.toString()}
                          </p>
                        </div>
                      ) : null;
                    })()}
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Tipo
                      </label>
                      <p className="text-sm text-gray-900">
                        {(selectedDonationDetails.type &&
                          donationTypeLabels[
                            selectedDonationDetails.type?.toLowerCase()
                          ]) ||
                          selectedDonationDetails.type}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Status
                      </label>
                      <p className="text-sm text-gray-900">
                        {(selectedDonationDetails.status &&
                          donationStatusLabels[
                            selectedDonationDetails.status?.toLowerCase()
                          ]) ||
                          selectedDonationDetails.status}
                      </p>
                    </div>
                    {selectedDonationDetails.itemDescription && (
                      <div className="col-span-2">
                        <label className="text-sm font-semibold text-gray-700">
                          Descrição
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedDonationDetails.itemDescription}
                        </p>
                      </div>
                    )}
                    {selectedDonationDetails.quantity && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          Quantidade
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedDonationDetails.quantity}
                        </p>
                      </div>
                    )}
                    {selectedDonationDetails.unit && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          Unidade
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedDonationDetails.unit}
                        </p>
                      </div>
                    )}
                    {(selectedDonationDetails.estimatedValue ||
                      selectedDonationDetails.amount) && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          Valor
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedDonationDetails.estimatedValue
                            ? formatToBRL(
                                selectedDonationDetails.estimatedValue
                              )
                            : selectedDonationDetails.amount
                            ? formatToBRL(
                                parseFloat(
                                  selectedDonationDetails.amount.replace(
                                    ",",
                                    "."
                                  )
                                )
                              )
                            : "R$ 0,00"}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Data
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedDonationDetails.createdAt &&
                          new Date(
                            selectedDonationDetails.createdAt
                          ).toLocaleDateString("pt-BR")}
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
              <CardTitle>Nova Doação</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleFormSubmit)}
                  className="space-y-6"
                >
                  {/* Seção do Doador */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Dados do Doador</h3>

                    <FormField
                      control={form.control}
                      name="donorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome completo do doador *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="donorType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de doador</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
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
                      {donorType === "individual" && (
                        <FormField
                          control={form.control}
                          name="donorCpf"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CPF *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="000.000.000-00"
                                  {...field}
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

                      {donorType === "company" && (
                        <FormField
                          control={form.control}
                          name="donorCnpj"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CNPJ *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="00.000.000/0000-00"
                                  {...field}
                                  onChange={(e) => {
                                    const maskedValue = maskCNPJ(e.target.value);
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
                        name="donorPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="(00) 00000-0000" 
                                {...field}
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
                        name="donorZipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CEP</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="00000-000"
                                  {...field}
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
                        name="donorState"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="UF"
                                {...field}
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
                        name="donorCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade</FormLabel>
                            <FormControl>
                              <Input placeholder="Cidade" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="donorStreet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logradouro</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Rua, Avenida, etc."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="donorNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número (opcional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Número" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="donorComplement"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Complemento (opcional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Apto, Bloco, etc."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="donorNeighborhood"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bairro</FormLabel>
                            <FormControl>
                              <Input placeholder="Bairro" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Seção da Doação */}
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-semibold">Dados da Doação</h3>

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
                            />
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
                            <FormLabel>Tipo de Doação</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Tipo de Doação" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(donationTypeLabels).map(
                                    ([key, label]) => (
                                      <SelectItem key={key} value={key}>
                                        {label}
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
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
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Status da doação" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(donationStatusLabels).map(
                                    ([key, label]) => (
                                      <SelectItem key={key} value={key}>
                                        {label}
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="itemDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição do Item</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Descrição do item doado"
                              {...field}
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
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
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
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="estimatedValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor Estimado</FormLabel>
                            <FormControl>
                              <CurrencyInput
                                onValueChange={(value: any) => {
                                  field.onChange(value);
                                }}
                                allowDecimals={true}
                                placeholder="R$0.00"
                                prefix="R$"
                                decimalSeparator=","
                                groupSeparator="."
                                intlConfig={{
                                  locale: "pt-BR",
                                  currency: "BRL",
                                }}
                                decimalScale={2}
                                decimalsLimit={2}
                                className={cn(
                                  "flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                )}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor (se aplicável)</FormLabel>
                          <FormControl>
                            <CurrencyInput
                              onValueChange={(value: any) => {
                                field.onChange(value);
                              }}
                              allowDecimals={true}
                              placeholder="R$0.00"
                              prefix="R$"
                              decimalSeparator=","
                              groupSeparator="."
                              intlConfig={{ locale: "pt-BR", currency: "BRL" }}
                              decimalScale={2}
                              decimalsLimit={2}
                              className={cn(
                                "flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" variant="default" isLoading={isLoading}>
                    Registrar Doação
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

export default Donations;