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
import { ChartBar } from "lucide-react";
import { InfoCard } from "@/components/common/info-card";
import { DashboardTable } from "@/components/common/dashboard-table";
import { useEffect, useState } from "react";
import {
  RegisterDonationFormSchema,
  RegisterDonationFormValues,
} from "@/schemas/donation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Donation } from "@/types/donation";
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
import { cn, formatToBRL } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { getPatient } from "@/api/patient";
import { Patient } from "@/types/patient";
import { PatientAutocomplete } from "@/components/common/patient-autocomplete";
import { DetailsModal } from "@/components/common/details-modal";

const defaultValues: RegisterDonationFormValues = {
  type: "medicine",
  amount: "",
  patientName: "",
  pacienteId: 0,
  descricaoItem: "",
  quantidade: 0,
  unidade: "",
  valorEstimado: "",
  status: "pending",
};

const donationsHeader = [
  { label: "Data", key: "date" },
  { label: "Paciente", key: "patientName" },
  { label: "Descrição", key: "description" },
  { label: "Quantidade", key: "quantity" },
  { label: "Valor", key: "value" },
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

const Donations = () => {
  const [filter, setFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [donationsList, setDonationsList] = useState<Donation[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number>(0);
  const [selectedDonationDetails, setSelectedDonationDetails] =
    useState<Donation | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const form = useForm<RegisterDonationFormValues>({
    resolver: zodResolver(RegisterDonationFormSchema),
    defaultValues,
  });

  const translatedDonations = donationsList.map((donation) => {
    // Buscar nome do paciente se tiver pacienteId
    const patient = donation.pacienteId
      ? patients.find((p) => p.id === donation.pacienteId)
      : null;

    return {
      ...donation,
      value: donation.amount
        ? formatToBRL(parseFloat(donation.amount.replace(",", ".")))
        : "R$ 0,00",
      date: donation.createdAt
        ? new Date(donation.createdAt).toLocaleDateString("pt-BR")
        : "-",
      type: donationTypeLabels[donation.type?.toLowerCase()] || donation.type,
      status:
        donationStatusLabels[donation.status?.toLowerCase()] || donation.status,
      patientName: donation.patientName || patient?.name || "-",
      description: donation.descricaoItem || "-",
      quantity: donation.quantidade ?? "-",
    };
  });

  const filteredDonations = translatedDonations.filter(
    (donation) =>
      donation.type.toLowerCase().includes(filter.toLowerCase()) ||
      donation.status.toLowerCase().includes(filter.toLowerCase()) ||
      (donation.patientName || "").toLowerCase().includes(filter.toLowerCase())
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
        form.setValue("pacienteId", patient.id);
      }
    }
  }, [selectedPatientId, patients, form]);

  async function handleFormSubmit(data: RegisterDonationFormValues) {
    try {
      setIsLoading(true);
      form.setValue("pacienteId", selectedPatientId);
      const response = await addDonation(data);
      if (response) {
        toast.success("Doação registrada com sucesso!");
        form.reset();
        getList();
      }
    } catch (error) {
      toast.error(`Erro ao registrar doação, ${error}`);
    } finally {
      setIsLoading(false);
    }
  }

  const donationsByPatient = donationsList.reduce((acc, donation) => {
    // Buscar nome do paciente pelo pacienteId
    const patient = donation.pacienteId
      ? patients.find((p) => p.id === donation.pacienteId)
      : null;
    const key = donation.patientName || patient?.name || "Sem paciente";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(donation);
    return acc;
  }, {} as Record<string, Donation[]>);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard
          title="Valor total de Doações"
          value={formatToBRL(
            donationsList.reduce(
              (acc, donation) =>
                acc +
                (donation.valorEstimado
                  ? donation.valorEstimado
                  : donation.amount
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
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {(() => {
                    const patient = selectedDonationDetails.pacienteId
                      ? patients.find(
                          (p) => p.id === selectedDonationDetails.pacienteId
                        )
                      : null;
                    const patientName =
                      selectedDonationDetails.patientName || patient?.name;
                    return patientName ? (
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          Paciente
                        </label>
                        <p className="text-sm text-gray-900">{patientName}</p>
                      </div>
                    ) : null;
                  })()}
                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      Tipo
                    </label>
                    <p className="text-sm text-gray-900">
                      {donationTypeLabels[
                        selectedDonationDetails.type?.toLowerCase()
                      ] || selectedDonationDetails.type}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      Status
                    </label>
                    <p className="text-sm text-gray-900">
                      {donationStatusLabels[
                        selectedDonationDetails.status?.toLowerCase()
                      ] || selectedDonationDetails.status}
                    </p>
                  </div>
                  {(selectedDonationDetails.descricaoItem ||
                    selectedDonationDetails.descricaoItem) && (
                    <div className="col-span-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Descrição
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedDonationDetails.descricaoItem ||
                          selectedDonationDetails.descricaoItem}
                      </p>
                    </div>
                  )}
                  {selectedDonationDetails.quantidade && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Quantidade
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedDonationDetails.quantidade}
                      </p>
                    </div>
                  )}
                  {(selectedDonationDetails.valorEstimado ||
                    selectedDonationDetails.amount) && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Valor
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedDonationDetails.valorEstimado
                          ? formatToBRL(selectedDonationDetails.valorEstimado)
                          : selectedDonationDetails.amount
                          ? formatToBRL(
                              parseFloat(
                                selectedDonationDetails.amount.replace(",", ".")
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
            )}
          </DetailsModal>
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold">
              Histórico de Doações por Paciente
            </h3>
            {Object.entries(donationsByPatient).map(
              ([patientName, donations]) => (
                <Card key={patientName}>
                  <CardHeader>
                    <CardTitle>{patientName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {donations.map((donation) => {
                        const patient = donation.pacienteId
                          ? patients.find((p) => p.id === donation.pacienteId)
                          : null;
                        return (
                          <div key={donation.id} className="border-b pb-2">
                            <p className="text-sm">
                              <strong>Data:</strong>{" "}
                              {donation.createdAt &&
                                new Date(donation.createdAt).toLocaleDateString(
                                  "pt-BR"
                                )}
                            </p>
                            {donation.descricaoItem && (
                              <p className="text-sm">
                                <strong>Descrição:</strong>{" "}
                                {donation.descricaoItem}
                              </p>
                            )}
                            {donation.quantidade && (
                              <p className="text-sm">
                                <strong>Quantidade:</strong>{" "}
                                {donation.quantidade} {donation.unidade || ""}
                              </p>
                            )}
                            {(donation.valorEstimado || donation.amount) && (
                              <p className="text-sm">
                                <strong>Valor:</strong>{" "}
                                {donation.valorEstimado
                                  ? formatToBRL(donation.valorEstimado)
                                  : donation.amount
                                  ? formatToBRL(
                                      parseFloat(
                                        donation.amount.replace(",", ".")
                                      )
                                    )
                                  : "R$ 0,00"}
                              </p>
                            )}
                            {patient && (
                              <p className="text-sm">
                                <strong>Paciente:</strong> {patient.name}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
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
                  className="flex flex-col gap-4"
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
                                form.setValue("pacienteId", patientId);
                              }
                            }}
                            placeholder="Buscar paciente (opcional)..."
                          />
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
                    name="descricaoItem"
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
                      name="quantidade"
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
                      name="unidade"
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
                      name="valorEstimado"
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
