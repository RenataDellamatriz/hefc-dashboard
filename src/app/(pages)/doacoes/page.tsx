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

const defaultValues: RegisterDonationFormValues = {
  type: "medicine",
  amount: "",
  status: "pending",
};

const donationsHeader = [
  { label: "Data", key: "date" },
  { label: "Tipo", key: "type" },
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

  const form = useForm<RegisterDonationFormValues>({
    resolver: zodResolver(RegisterDonationFormSchema),
    defaultValues,
  });

  const translatedDonations = donationsList.map((donation) => ({
    ...donation,
    date: new Date(donation.createdAt).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    value: `R$ ${donation.amount}`,
    type: donationTypeLabels[donation.type.toLowerCase()] || donation.type,
    status:
      donationStatusLabels[donation.status.toLowerCase()] || donation.status,
  }));

  const filteredDonations = translatedDonations.filter(
    (donation) =>
      donation.type.toLowerCase().includes(filter.toLowerCase()) ||
      donation.status.toLowerCase().includes(filter.toLowerCase())
  );

  async function getList() {
    try {
      setIsLoading(true);
      const donations = await getDonation();
      console.log(donations);
      if (donations) {
        setDonationsList(donations);
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

  async function handleFormSubmit(data: RegisterDonationFormValues) {
    try {
      setIsLoading(true);
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

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard
          title="Valor total de Doações"
          value={formatToBRL(
            donationsList.reduce(
              (acc, donation) => acc + parseFloat(donation.amount),
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
          />
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
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor</FormLabel>
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
