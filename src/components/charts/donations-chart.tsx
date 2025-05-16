import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  XAxis,
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

// Cores por categoria
const categoryColors: Record<string, string> = {
  Medicamentos: "#33658A",
  Alimentação: "#55DDE0",
  "Cesta básica": "#2F4858",
  Curativos: "#F6AE2D",
  Equipamentos: "#F26419",
  Fraldas: "#8AC926",
  Higiene: "#FF595E",
};

export function DonationsChart() {
  return (
    <Card className="col-span-12 md:col-span-5 w-full">
      <CardHeader>
        <CardTitle>Doações por Categoria</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            barCategoryGap={20}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" hide />
            <YAxis
              tick={{
                fontSize: 10,
              }}
              tickFormatter={(value) =>
                value.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  minimumFractionDigits: 2,
                })
              }
            />
            <Tooltip
              formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, "Valor"]}
              labelFormatter={(label) => `Categoria: ${label}`}
            />
            <Bar dataKey="valor" barSize={40}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={categoryColors[entry.name]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 flex flex-wrap gap-4">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-sm"
                style={{ backgroundColor: categoryColors[entry.name] }}
              />
              <span className="text-sm">{entry.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
