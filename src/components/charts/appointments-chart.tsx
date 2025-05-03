import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { name: "Pessoas com câncer", value: 55 },
  { name: "Familiares", value: 53 },
  { name: "Outros diagnósticos", value: 174 },
];

const COLORS = ["#F26419", "#F6AE2D", "#33658A"];

export function AppointmentsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atendimentos por Tipo</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`${value} pessoas`, "Quantidade"]} 
              labelFormatter={(name) => `Categoria: ${name}`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}