import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

const data = [
  { name: "Andador", valor: 270, quantidade: 9 },
  { name: "Bengala", valor: 197, quantidade: 12 },
  { name: "Cadeira de Banho", valor: 450, quantidade: 33 },
  { name: "Cadeira de Rodas", valor: 670, quantidade: 28 },
  { name: "Cama Hospitalar", valor: 920, quantidade: 15 },
  { name: "Outros", valor: 1335, quantidade: 59 },
];

export function LoansChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Empréstimos por Tipo</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" stroke="#33658A" />
            <YAxis yAxisId="right" orientation="right" stroke="#F26419" />
            <Tooltip 
              formatter={(value, name) => [
                name === "quantidade" ? `${value} unidades` : `R$ ${Number(value).toFixed(2)}`, 
                name === "quantidade" ? "Quantidade" : "Valor"
              ]}
              labelFormatter={(name) => `Item: ${name}`}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="valor" name="Valor (R$)" fill="#33658A" />
            <Bar yAxisId="right" dataKey="quantidade" name="Quantidade" fill="#F26419" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}