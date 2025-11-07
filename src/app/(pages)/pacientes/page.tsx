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
import { getAppointment } from "@/api/appointment";
import { getLoan } from "@/api/loan";
import { getDonation } from "@/api/donation";
import { getWorkshop } from "@/api/workshop";
import { Appointment } from "@/types/appointment";
import { Loan } from "@/types/loan";
import { Donation } from "@/types/donation";
import { Workshop } from "@/types/workshop";
import {
  cpfMask,
  cpfReplacement,
  rgMask,
  rgReplacement,
  phoneMask,
  phoneReplacement,
  cepMask,
  cepReplacement,
} from "@/lib/masks";
import { DetailsModal } from "@/components/common/details-modal";
import { getPatientReport } from "@/api/report";
import { formatToBRL } from "@/lib/utils";

const typeLabels: Record<string, string> = {
  cancer: "Oncologia",
  family: "Familiar",
  other: "Outro Diagnóstico",
};

const statusLabels: Record<string, string> = {
  ongoing: "Em Tratamento",
  completed: "Finalizado",
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

const defaultValues: RegisterPatientFormValues = {
  name: "",
  cpf: "",
  rg: "",
  dataNascimento: "",
  telefone: "",
  enderecoCompleto: "",
  cep: "",
  estadoCivil: "single", // Valor padrão para estado civil
  nomeEsposa: "",
  filhos: [],
  type: "cancer",
  status: "ongoing",
  nomeCompleto: "",
};

const Patients = () => {
  const [filter, setFilter] = useState("");
  const [patientsList, setPatientsList] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [noSpouse, setNoSpouse] = useState(false);
  const [noChildren, setNoChildren] = useState(false);
  const [selectedPatientDetails, setSelectedPatientDetails] =
    useState<Patient | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

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

  async function handleFormSubmit(data: RegisterPatientFormValues) {
    try {
      setIsLoading(true);
      // Remover spouse e children se os checkboxes estiverem marcados
      const submitData = {
        ...data,
        spouse: noSpouse ? "" : data.nomeEsposa,
        children: noChildren ? "" : data.filhos,
      };
      const response = await addPatient(submitData);
      if (response) {
        toast.success("Paciente cadastrado com sucesso!");
        form.reset();
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
      (apt) => apt.pacienteId === patient.id || apt.patientName === patient.name
    );
    const patientLoans = loans.filter(
      (loan) => loan.pacienteId === patient.id && loan.status === "active"
    );
    const patientDonations = donations.filter(
      (donation) => donation.pacienteId === patient.id
    );
    const patientWorkshops = workshops.filter(
      (workshop) => workshop?.participantes?.length ?? 0 > 0
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
                        {selectedPatientDetails.nomeCompleto ||
                          selectedPatientDetails.name}
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
                    {(selectedPatientDetails.dataNascimento ||
                      selectedPatientDetails.birthDate) && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          Data de Nascimento
                        </label>
                        <p className="text-sm text-gray-900">
                          {new Date(
                            selectedPatientDetails.dataNascimento ||
                              selectedPatientDetails.birthDate ||
                              ""
                          ).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    )}
                    {(selectedPatientDetails.telefone ||
                      selectedPatientDetails.phone) && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          Telefone
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedPatientDetails.telefone ||
                            selectedPatientDetails.phone}
                        </p>
                      </div>
                    )}
                    {((selectedPatientDetails as any).cep ||
                      selectedPatientDetails.zipCode) && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          CEP
                        </label>
                        <p className="text-sm text-gray-900">
                          {(selectedPatientDetails as any).cep ||
                            selectedPatientDetails.zipCode}
                        </p>
                      </div>
                    )}
                    {(selectedPatientDetails.enderecoCompleto ||
                      selectedPatientDetails.address) && (
                      <div className="col-span-2">
                        <label className="text-sm font-semibold text-gray-700">
                          Endereço
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedPatientDetails.enderecoCompleto ||
                            selectedPatientDetails.address}
                        </p>
                      </div>
                    )}
                    {(selectedPatientDetails.estadoCivil ||
                      selectedPatientDetails.maritalStatus) && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          Estado Civil
                        </label>
                        <p className="text-sm text-gray-900">
                          {maritalStatusOptions.find(
                            (opt) =>
                              opt.value ===
                              (selectedPatientDetails.estadoCivil ||
                                selectedPatientDetails.maritalStatus)
                          )?.label ||
                            selectedPatientDetails.estadoCivil ||
                            selectedPatientDetails.maritalStatus}
                        </p>
                      </div>
                    )}
                    {(selectedPatientDetails.nomeEsposa ||
                      selectedPatientDetails.spouse) && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          Cônjuge
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedPatientDetails.nomeEsposa ||
                            selectedPatientDetails.spouse}
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

                {/* Filhos */}
                {selectedPatientDetails.filhos &&
                  selectedPatientDetails.filhos.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Filhos</h3>
                      <div className="space-y-2">
                        {selectedPatientDetails.filhos.map(
                          (
                            filho: { nome: string; idade: number },
                            index: number
                          ) => (
                            <div key={index} className="border-b pb-2">
                              <p className="text-sm">
                                <strong>Nome:</strong> {filho.nome} -{" "}
                                <strong>Idade:</strong> {filho.idade} anos
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Atendimentos */}
                {selectedPatientDetails.atendimentos &&
                  selectedPatientDetails.atendimentos.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Atendimentos (
                        {selectedPatientDetails.atendimentos.length})
                      </h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedPatientDetails.atendimentos.map(
                          (atendimento: any) => (
                            <div key={atendimento.id} className="border-b pb-2">
                              <p className="text-sm">
                                <strong>Data:</strong>{" "}
                                {atendimento.data
                                  ? new Date(
                                      atendimento.data
                                    ).toLocaleDateString("pt-BR")
                                  : "-"}
                              </p>
                              {atendimento.profissional && (
                                <p className="text-sm">
                                  <strong>Profissional:</strong>{" "}
                                  {atendimento.profissional}
                                </p>
                              )}
                              {atendimento.especialidade && (
                                <p className="text-sm">
                                  <strong>Especialidade:</strong>{" "}
                                  {atendimento.especialidade}
                                </p>
                              )}
                              {atendimento.observacoes && (
                                <p className="text-sm">
                                  <strong>Observações:</strong>{" "}
                                  {atendimento.observacoes}
                                </p>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Empréstimos */}
                {selectedPatientDetails.emprestimos &&
                  selectedPatientDetails.emprestimos.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Empréstimos ({selectedPatientDetails.emprestimos.length}
                        )
                      </h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedPatientDetails.emprestimos.map(
                          (emprestimo: any) => (
                            <div key={emprestimo.id} className="border-b pb-2">
                              <p className="text-sm">
                                <strong>Item:</strong> {emprestimo.item}
                              </p>
                              <p className="text-sm">
                                <strong>Data do Empréstimo:</strong>{" "}
                                {emprestimo.dataEmprestimo
                                  ? new Date(
                                      emprestimo.dataEmprestimo
                                    ).toLocaleDateString("pt-BR")
                                  : "-"}
                              </p>
                              {emprestimo.dataDevolucaoPrevista && (
                                <p className="text-sm">
                                  <strong>Data Prevista de Devolução:</strong>{" "}
                                  {new Date(
                                    emprestimo.dataDevolucaoPrevista
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
                {selectedPatientDetails.doacoes &&
                  selectedPatientDetails.doacoes.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Doações ({selectedPatientDetails.doacoes.length})
                      </h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedPatientDetails.doacoes.map((doacao: any) => (
                          <div key={doacao.id} className="border-b pb-2">
                            <p className="text-sm">
                              <strong>Descrição:</strong> {doacao.descricaoItem}
                            </p>
                            {doacao.quantidade && (
                              <p className="text-sm">
                                <strong>Quantidade:</strong> {doacao.quantidade}
                              </p>
                            )}
                            {doacao.valorEstimado && (
                              <p className="text-sm">
                                <strong>Valor Estimado:</strong>{" "}
                                {formatToBRL(doacao.valorEstimado)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Oficinas */}
                {selectedPatientDetails.oficinas &&
                  selectedPatientDetails.oficinas.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Oficinas ({selectedPatientDetails.oficinas.length})
                      </h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedPatientDetails.oficinas.map((oficina: any) => (
                          <div key={oficina.id} className="border-b pb-2">
                            <p className="text-sm">
                              <strong>Nome:</strong> {oficina.name}
                            </p>
                            {oficina.diaSemana && (
                              <p className="text-sm">
                                <strong>Dia da Semana:</strong>{" "}
                                {oficina.diaSemana}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Mensagem quando não há relacionamentos */}
                {(!selectedPatientDetails.atendimentos ||
                  selectedPatientDetails.atendimentos.length === 0) &&
                  (!selectedPatientDetails.emprestimos ||
                    selectedPatientDetails.emprestimos.length === 0) &&
                  (!selectedPatientDetails.doacoes ||
                    selectedPatientDetails.doacoes.length === 0) &&
                  (!selectedPatientDetails.oficinas ||
                    selectedPatientDetails.oficinas.length === 0) && (
                    <div className="text-sm text-gray-500 italic">
                      Nenhum relacionamento registrado (atendimentos,
                      empréstimos, doações ou oficinas).
                    </div>
                  )}
              </div>
            )}
          </DetailsModal>
          {selectedPatient && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Visão Geral - {selectedPatient.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <InfoCard
                    title="Atendimentos"
                    value={getPatientOverview(selectedPatient).appointments}
                    description="Realizados"
                    icon={<Users size={20} />}
                  />
                  <InfoCard
                    title="Empréstimos"
                    value={getPatientOverview(selectedPatient).activeLoans}
                    description="Ativos"
                    icon={<Users size={20} />}
                  />
                  <InfoCard
                    title="Doações"
                    value={getPatientOverview(selectedPatient).donations}
                    description="Recebidas"
                    icon={<Users size={20} />}
                  />
                  <InfoCard
                    title="Oficinas"
                    value={getPatientOverview(selectedPatient).workshops}
                    description="Participações"
                    icon={<Users size={20} />}
                  />
                </div>
              </CardContent>
            </Card>
          )}
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
                                mask={cpfMask}
                                replacement={cpfReplacement}
                                {...field}
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
                                placeholder="00.000.000-0"
                                mask={rgMask}
                                replacement={rgReplacement}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dataNascimento"
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
                        name="telefone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="(00) 00000-0000"
                                mask={phoneMask}
                                replacement={phoneReplacement}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="estadoCivil"
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="cep"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CEP</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="00000-000"
                                mask={cepMask}
                                replacement={cepReplacement}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="enderecoCompleto"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Endereço</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Endereço completo"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Informações Familiares
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nomeEsposa"
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
                        name="filhos"
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
                                      field.onChange([]); // use array vazio em vez de string
                                    }
                                  }}
                                  className="w-4 h-4 cursor-pointer"
                                />
                                <span className="select-none">Não possui</span>
                              </label>
                            </div>
                            <FormControl>
                              {Array.isArray(field.value) && !noChildren
                                ? field.value.map((filho, idx) => (
                                    <div key={idx} className="flex gap-2">
                                      <Input
                                        placeholder="Nome do filho"
                                        value={filho.nome}
                                        onChange={(e) => {
                                          // const newFilhos = [...field.value];
                                          // newFilhos[idx].nome = e.target.value;
                                          // field.onChange(newFilhos);
                                        }}
                                        disabled={noChildren}
                                        name={`filhos[${idx}].nome`}
                                      />
                                      <Input
                                        placeholder="Idade do filho"
                                        value={String(filho.idade)}
                                        onChange={(e) => {
                                          // const newFilhos = [...field.value];
                                          // newFilhos[idx].idade = parseInt(
                                          //   e.target.value,
                                          //   10
                                          // );
                                          // field.onChange(newFilhos);
                                        }}
                                        disabled={noChildren}
                                        name={`filhos[${idx}].idade`}
                                      />
                                    </div>
                                  ))
                                : null}
                            </FormControl>
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
