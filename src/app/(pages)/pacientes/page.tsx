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
import { Users, Loader2 } from "lucide-react";
import { InfoCard } from "@/components/common/info-card";
import { DashboardTable } from "@/components/common/dashboard-table";
import { useEffect, useState } from "react";
import { addPatient, getPatient } from "@/api/patient";
import { Patient, PatientStatus, PatientType } from "@/types/patient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  RegisterPatientFormSchema,
  RegisterPatientFormValues,
} from "@/schemas/patients";
import { toast } from "sonner";
import { getAppointment } from "@/api/appointment";
import { getLoan } from "@/api/loan";
import { getDonation } from "@/api/donation";
import { getWorkshop } from "@/api/workshop";
import { Appointment } from "@/types/appointment";
import { Loan } from "@/types/loan";
import { Donation } from "@/types/donation";
import { Workshop } from "@/types/workshop";
import { DetailsModal } from "@/components/common/details-modal";
import { getPatientReport } from "@/api/report";
import { formatToBRL } from "@/lib/utils";
import { SecondaryInfoCard } from "@/components/common/secondary-info-card";

// Funções de máscara
const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
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

const typeLabels: Record<string, string> = {
  cancer: "Oncologia",
  family: "Familiar",
  other: "Outro Diagnóstico",
};

const statusLabels: Record<string, string> = {
  ongoing: "Em Tratamento",
  completed: "Finalizado",
};

const weekdayMap: Record<string, string> = {
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
};

const maritalStatusOptions = [
  { value: "single", label: "Solteiro(a)" },
  { value: "married", label: "Casado(a)" },
  { value: "divorced", label: "Divorciado(a)" },
  { value: "widowed", label: "Viúvo(a)" },
  { value: "separated", label: "Separado(a)" },
];

const patientsHeader = [
  { label: "Nome", key: "name" },
  { label: "Tipo", key: "type" },
  { label: "Status", key: "status" },
  { label: "Mais detalhes", key: "details" },
];

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

const defaultValues: RegisterPatientFormValues = {
  name: "",
  cpf: "",
  rg: "",
  birthDate: "",
  phone: "",
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  maritalStatus: "single",
  spouseName: "",
  children: [],
  type: PatientType.CANCER,
  status: PatientStatus.ONGOING,
};

const Patients = () => {
  const [filter, setFilter] = useState("");
  const [patientsList, setPatientsList] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [noSpouse, setNoSpouse] = useState(false);
  const [noChildren, setNoChildren] = useState(false);
  const [selectedPatientDetails, setSelectedPatientDetails] =
    useState<Patient | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);

  const form = useForm<RegisterPatientFormValues>({
    resolver: zodResolver(RegisterPatientFormSchema),
    defaultValues,
  });

  // Função para buscar CEP
  const fetchCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, "");

    if (cleanCEP.length !== 8) return;

    setIsLoadingCEP(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data: ViaCEPResponse = await response.json();

      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }

      // Preenche os campos de endereço automaticamente
      form.setValue("street", data.logradouro || "");
      form.setValue("complement", data.complemento || "");
      form.setValue("neighborhood", data.bairro || "");
      form.setValue("city", data.localidade || "");
      form.setValue("state", data.uf || "");

      // Foca no campo número após preencher o CEP
      const numberInput = document.querySelector('input[name="number"]') as HTMLInputElement;
      if (numberInput) {
        numberInput.focus();
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(`Erro ao buscar CEP ${cleanCEP}: ${error.message}`);

      console.error(error);
    } finally {
      setIsLoadingCEP(false);
    }
  };

  // Monitora mudanças no CEP
  const watchedCEP = form.watch("zipCode");
  useEffect(() => {
    if (watchedCEP && watchedCEP.replace(/\D/g, "").length === 8) {
      fetchCEP(watchedCEP);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedCEP]);

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

  async function loadRelatedData() {
    try {
      const [appointmentsRes, loansRes, donationsRes, workshopsRes] =
        await Promise.all([
          getAppointment(),
          getLoan(),
          getDonation(),
          getWorkshop(),
        ]);
      if (appointmentsRes) setAppointments(appointmentsRes);
      if (loansRes) setLoans(loansRes);
      if (donationsRes) setDonations(donationsRes);
      if (workshopsRes) setWorkshops(workshopsRes);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getPatientsList();
    loadRelatedData();
  }, []);

  const prepareSubmitData = (data: RegisterPatientFormValues) => {
    let childrenArray: { name: string; age: number }[] | undefined;

    if (typeof data.children === "string") {
      try {
        const parsed = JSON.parse(data.children);
        if (Array.isArray(parsed)) {
          childrenArray = parsed;
        }
      } catch {
        childrenArray = undefined;
      }
    } else {
      childrenArray = data.children;
    }

    return {
      ...data,
      children: childrenArray,
    };
  };

  async function handleFormSubmit(data: RegisterPatientFormValues) {
    try {
      setIsLoading(true);
      const submitData = prepareSubmitData(data);
      const response = await addPatient(submitData);
      if (response) {
        toast.success("Paciente cadastrado com sucesso!");
        form.reset(defaultValues);
        setNoSpouse(false);
        setNoChildren(false);
        getPatientsList();
      }
    } catch (error) {
      toast.error(`Erro ao cadastrar paciente, ${error}`);
    } finally {
      setIsLoading(false);
    }
  }

  const getPatientOverview = (patient: Patient) => {
    const patientAppointments = appointments.filter(
      (apt) => apt.patientId === patient.id || apt.patientName === patient.name
    );
    const patientLoans = loans.filter(
      (loan) => loan.patientId === patient.id && loan.status === "pending"
    );
    const patientDonations = donations.filter(
      (donation) => donation.patientId === patient.id
    );
    const patientWorkshops = workshops.filter(
      (workshop) => workshop?.participants?.length ?? 0 > 0
    );

    return {
      appointments: patientAppointments.length,
      activeLoans: patientLoans.length,
      donations: patientDonations.length,
      workshops: patientWorkshops.length,
    };
  };

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
            onDetailsClick={async (item) => {
              try {
                const report = await getPatientReport(item.id.toString());
                if (report && !Array.isArray(report)) {
                  // O relatório retorna os dados completos do paciente
                  const fullPatientData = {
                    ...item,
                    ...report.paciente,
                    atendimentos: report.atendimentos || [],
                    emprestimos: report.emprestimos || [],
                    doacoes: report.doacoes || [],
                    oficinas: report.oficinas || [],
                  };
                  setSelectedPatientDetails(fullPatientData);
                  setIsDetailsModalOpen(true);
                } else {
                  // Fallback: usar dados da lista
                  const patient = patientsList.find((p) => p.id === item.id);
                  if (patient) {
                    setSelectedPatientDetails(patient);
                    setIsDetailsModalOpen(true);
                  }
                }
              } catch (error) {
                console.error("Erro ao buscar detalhes do paciente:", error);
                // Fallback: usar dados da lista
                const patient = patientsList.find((p) => p.id === item.id);
                if (patient) {
                  setSelectedPatientDetails(patient);
                  setIsDetailsModalOpen(true);
                }
              }
            }}
          />
          <DetailsModal
            open={isDetailsModalOpen}
            onOpenChange={setIsDetailsModalOpen}
            title={`Detalhes do Paciente - ${
              selectedPatientDetails?.name || ""
            }`}
          >
            {selectedPatientDetails && (
              <div className="space-y-6">
                {/* Informações Básicas */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Informações Básicas
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Nome Completo
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedPatientDetails.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Tipo
                      </label>
                      <p className="text-sm text-gray-900">
                        {typeLabels[selectedPatientDetails.type] ||
                          selectedPatientDetails.type}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Status
                      </label>
                      <p className="text-sm text-gray-900">
                        {statusLabels[selectedPatientDetails.status] ||
                          selectedPatientDetails.status}
                      </p>
                    </div>
                    {selectedPatientDetails.cpf && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          CPF
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedPatientDetails.cpf}
                        </p>
                      </div>
                    )}
                    {selectedPatientDetails.rg && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          RG
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedPatientDetails.rg}
                        </p>
                      </div>
                    )}
                    {selectedPatientDetails.birthDate && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          Data de Nascimento
                        </label>
                        <p className="text-sm text-gray-900">
                          {new Date(
                            selectedPatientDetails.birthDate + "T00:00:00"
                          ).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    )}
                    {selectedPatientDetails.phone && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          Telefone
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedPatientDetails.phone}
                        </p>
                      </div>
                    )}
                    {selectedPatientDetails.maritalStatus && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          Estado Civil
                        </label>
                        <p className="text-sm text-gray-900">
                          {maritalStatusOptions.find(
                            (opt) =>
                              opt.value === selectedPatientDetails.maritalStatus
                          )?.label || selectedPatientDetails.maritalStatus}
                        </p>
                      </div>
                    )}
                    {(selectedPatientDetails.spouseName) && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          Cônjuge
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedPatientDetails.spouseName}
                        </p>
                      </div>
                    )}
                    {selectedPatientDetails.createdAt && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          Data de Cadastro
                        </label>
                        <p className="text-sm text-gray-900">
                          {new Date(
                            selectedPatientDetails.createdAt
                          ).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Endereço */}
                {(selectedPatientDetails.zipCode || selectedPatientDetails.street) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Endereço</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedPatientDetails.zipCode && (
                        <div>
                          <label className="text-sm font-semibold text-gray-700">
                            CEP
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedPatientDetails.zipCode}
                          </p>
                        </div>
                      )}
                      {selectedPatientDetails.street && (
                        <div className="col-span-2">
                          <label className="text-sm font-semibold text-gray-700">
                            Logradouro
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedPatientDetails.street}
                            {selectedPatientDetails.number && `, ${selectedPatientDetails.number}`}
                            {selectedPatientDetails.complement && ` - ${selectedPatientDetails.complement}`}
                          </p>
                        </div>
                      )}
                      {selectedPatientDetails.neighborhood && (
                        <div>
                          <label className="text-sm font-semibold text-gray-700">
                            Bairro
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedPatientDetails.neighborhood}
                          </p>
                        </div>
                      )}
                      {selectedPatientDetails.city && (
                        <div>
                          <label className="text-sm font-semibold text-gray-700">
                            Cidade
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedPatientDetails.city}
                            {selectedPatientDetails.state && ` - ${selectedPatientDetails.state}`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Filhos */}
                {selectedPatientDetails.children &&
                  selectedPatientDetails.children.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Filhos</h3>
                      <div className="space-y-2">
                        {selectedPatientDetails.children.map(
                          (
                            child: { name: string; age: number },
                            index: number
                          ) => (
                            <div key={index} className="border-b pb-2">
                              <p className="text-sm">
                                <strong>Nome:</strong> {child.name} -{" "}
                                <strong>Idade:</strong> {child.age} anos
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                <div className="w-full h-[1px] bg-cyan-700" />
                {selectedPatientDetails && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Visão Geral</h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <SecondaryInfoCard
                        title="Atendimentos"
                        value={
                          getPatientOverview(selectedPatientDetails)
                            .appointments
                        }
                        description="Realizados"
                      />
                      <SecondaryInfoCard
                        title="Empréstimos"
                        value={
                          getPatientOverview(selectedPatientDetails).activeLoans
                        }
                        description="Ativos"
                      />
                      <SecondaryInfoCard
                        title="Doações"
                        value={
                          getPatientOverview(selectedPatientDetails).donations
                        }
                        description="Recebidas"
                      />
                      <SecondaryInfoCard
                        title="Oficinas"
                        value={
                          getPatientOverview(selectedPatientDetails).workshops
                        }
                        description="Participações"
                      />
                    </div>
                  </div>
                )}
                {/* Atendimentos */}
                {selectedPatientDetails.appointments &&
                  selectedPatientDetails.appointments.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Atendimentos (
                        {selectedPatientDetails.appointments.length})
                      </h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedPatientDetails.appointments.map(
                          (atendimento: Appointment) => (
                            <div key={atendimento.id} className="border-b pb-2">
                              <p className="text-sm">
                                <strong>Data:</strong>{" "}
                                {atendimento.appointmentDate
                                  ? new Date(
                                      atendimento.appointmentDate
                                    ).toLocaleDateString("pt-BR")
                                  : "-"}
                              </p>
                              {atendimento.professional && (
                                <p className="text-sm">
                                  <strong>Profissional:</strong>{" "}
                                  {atendimento.professional}
                                </p>
                              )}
                              {atendimento.specialty && (
                                <p className="text-sm">
                                  <strong>Especialidade:</strong>{" "}
                                  {atendimento.specialty}
                                </p>
                              )}
                              {atendimento.notes && (
                                <p className="text-sm">
                                  <strong>Observações:</strong>{" "}
                                  {atendimento.notes}
                                </p>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Empréstimos */}
                {selectedPatientDetails.loans &&
                  selectedPatientDetails.loans.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Empréstimos ({selectedPatientDetails.loans.length})
                      </h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedPatientDetails.loans.map(
                          (emprestimo: Loan) => (
                            <div key={emprestimo.id} className="border-b pb-2">
                              <p className="text-sm">
                                <strong>Item:</strong> {emprestimo.item}
                              </p>
                              <p className="text-sm">
                                <strong>Data do Empréstimo:</strong>{" "}
                                {emprestimo.loanDate
                                  ? new Date(
                                      emprestimo.loanDate
                                    ).toLocaleDateString("pt-BR")
                                  : "-"}
                              </p>
                              {emprestimo.returnDate && (
                                <p className="text-sm">
                                  <strong>Data de Devolução:</strong>{" "}
                                  {new Date(
                                    emprestimo.returnDate
                                  ).toLocaleDateString("pt-BR")}
                                </p>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Doações */}
                {selectedPatientDetails.donations &&
                  selectedPatientDetails.donations.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Doações ({selectedPatientDetails.donations.length})
                      </h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedPatientDetails.donations.map(
                          (doacao: Donation) => (
                            <div key={doacao.id} className="border-b pb-2">
                              <p className="text-sm">
                                <strong>Descrição:</strong>{" "}
                                {doacao.itemDescription}
                              </p>
                              {doacao.quantity && (
                                <p className="text-sm">
                                  <strong>Quantidade:</strong> {doacao.quantity}
                                </p>
                              )}
                              {doacao.estimatedValue && (
                                <p className="text-sm">
                                  <strong>Valor Estimado:</strong>{" "}
                                  {formatToBRL(doacao.estimatedValue)}
                                </p>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Oficinas */}
                {selectedPatientDetails.workshops &&
                  selectedPatientDetails.workshops.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Oficinas ({selectedPatientDetails.workshops.length})
                      </h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedPatientDetails.workshops.map(
                          (oficina: Workshop) => (
                            <div key={oficina.id} className="border-b pb-2">
                              <p className="text-sm">
                                <strong>Nome:</strong> {oficina.name}
                              </p>
                              {oficina.weekday && (
                                <p className="text-sm">
                                  <strong>Dia da Semana:</strong>{" "}
                                  {weekdayMap[oficina.weekday]}
                                </p>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Mensagem quando não há relacionamentos */}
                {(!selectedPatientDetails.appointments ||
                  selectedPatientDetails.appointments.length === 0) &&
                  (!selectedPatientDetails.loans ||
                    selectedPatientDetails.loans.length === 0) &&
                  (!selectedPatientDetails.donations ||
                    selectedPatientDetails.donations.length === 0) &&
                  (!selectedPatientDetails.workshops ||
                    selectedPatientDetails.workshops.length === 0) && (
                    <div className="text-sm text-gray-500 italic">
                      Nenhum relacionamento registrado (atendimentos,
                      empréstimos, doações ou oficinas).
                    </div>
                  )}
              </div>
            )}
          </DetailsModal>
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
                  className="space-y-6"
                >
                  {/* Dados Pessoais */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Dados Pessoais</h3>
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="cpf"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CPF</FormLabel>
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
                      <FormField
                        control={form.control}
                        name="rg"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>RG</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="RG"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="birthDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Nascimento</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
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
                      <FormField
                        control={form.control}
                        name="maritalStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado Civil</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {maritalStatusOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-semibold">Endereço</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="zipCode"
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
                        name="state"
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
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Cidade"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="street"
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
                        name="number"
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
                        name="complement"
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
                        name="neighborhood"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bairro</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Bairro"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Informações Familiares */}
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-semibold">
                      Informações Familiares
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="spouseName"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-2">
                              <FormLabel>Conjugê</FormLabel>
                              <label className="flex items-center gap-1 text-sm text-gray-600 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={noSpouse}
                                  onChange={(e) => {
                                    setNoSpouse(e.target.checked);
                                    if (e.target.checked) {
                                      field.onChange("");
                                    }
                                  }}
                                  className="w-4 h-4 cursor-pointer"
                                />
                                <span className="select-none">Não possui</span>
                              </label>
                            </div>
                            <FormControl>
                              <Input
                                placeholder="Nome do cônjuge"
                                disabled={noSpouse}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="children"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-2">
                              <FormLabel>Filhos</FormLabel>
                              <label className="flex items-center gap-1 text-sm text-gray-600 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={noChildren}
                                  onChange={(e) => {
                                    setNoChildren(e.target.checked);
                                    if (e.target.checked) {
                                      field.onChange([]);
                                    } else {
                                      field.onChange([{ name: "", age: 0 }]);
                                    }
                                  }}
                                  className="w-4 h-4 cursor-pointer"
                                />
                                <span className="select-none">Não possui</span>
                              </label>
                            </div>
                            <FormControl>
                              <div>
                                {Array.isArray(field.value) &&
                                field.value.length > 0 &&
                                !noChildren
                                  ? field.value.map((child, idx) => (
                                      <div
                                        key={idx}
                                        className="flex gap-2 mb-2"
                                      >
                                        <Input
                                          placeholder="Nome do filho"
                                          value={child.name || ""}
                                          onChange={(e) => {
                                            if (!field.value) return;
                                            const newChildren = [
                                              ...field.value,
                                            ];
                                            newChildren[idx] = {
                                              ...newChildren[idx],
                                              name: e.target.value,
                                            };
                                            field.onChange(newChildren);
                                          }}
                                          disabled={noChildren}
                                          name={`children[${idx}].name`}
                                        />
                                        <Input
                                          type="number"
                                          placeholder="Idade do filho"
                                          value={child.age || ""}
                                          onChange={(e) => {
                                            if (!field.value) return;
                                            const newChildren = [
                                              ...field.value,
                                            ];
                                            newChildren[idx] = {
                                              ...newChildren[idx],
                                              age:
                                                parseInt(e.target.value, 10) ||
                                                0,
                                            };
                                            field.onChange(newChildren);
                                          }}
                                          disabled={noChildren}
                                          name={`children[${idx}].age`}
                                        />
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            const newChildren =
                                              field.value &&
                                              field.value.filter(
                                                (_, i) => i !== idx
                                              );
                                            field.onChange(newChildren);
                                          }}
                                          disabled={noChildren}
                                        >
                                          Remover
                                        </Button>
                                      </div>
                                    ))
                                  : null}
                              </div>
                            </FormControl>
                            {!noChildren && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const currentValue = Array.isArray(
                                    field.value
                                  )
                                    ? field.value
                                    : [];
                                  field.onChange([
                                    ...currentValue,
                                    { name: "", age: 0 },
                                  ]);
                                }}
                                disabled={noChildren}
                              >
                                Adicionar Filho
                              </Button>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

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
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Tipo de Paciente" />
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
                          <FormLabel>Status do Paciente</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
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