import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { name: "Medicamentos", valor: 1945.19 },
  { name: "Alimentação", valor: 4290.0 },
  { name: "Cesta básica", valor: 76300.8 },
  { name: "Curativos", valor: 3075.75 },
  { name: "Equipamentos", valor: 1640.0 },
  { name: "Fraldas", valor: 23949.64 },
  { name: "Higiene", valor: 876.87 },
];

export function DonationsChart() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Doações por Categoria</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, "Valor"]}
              labelFormatter={(name) => `Categoria: ${name}`}
            />
            <Legend />
            <Bar dataKey="valor" name="Valor (R$)" fill="#33658A" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
