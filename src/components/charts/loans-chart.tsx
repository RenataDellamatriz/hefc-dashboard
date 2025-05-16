import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  TooltipProps,
} from "recharts";
import React from "react";

const data = [
  { name: "Andador", valor: 270, quantidade: 9 },
  { name: "Bengala", valor: 197, quantidade: 12 },
  { name: "Cadeira de Banho", valor: 450, quantidade: 33 },
  { name: "Cadeira de Rodas", valor: 670, quantidade: 28 },
  { name: "Cama Hospitalar", valor: 920, quantidade: 15 },
  { name: "Outros", valor: 1335, quantidade: 59 },
];

const legendColors = {
  valor: "#33658A",
  quantidade: "#F26419",
};

type DataItem = {
  name: string;
  valor: number;
  quantidade: number;
};

type CustomTooltipProps = TooltipProps<number, string> & {
  active?: boolean;
  payload?: Array<{ payload: DataItem; dataKey: string; value: number }>;
  label?: string | number;
};

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-300 p-2 rounded shadow-lg">
        <p className="font-medium mb-1">{data.name}</p>
        <p style={{ color: legendColors.valor }}>Valor: R$ {data.valor.toFixed(2)}</p>
        <p style={{ color: legendColors.quantidade }}>Quantidade: {data.quantidade}</p>
      </div>
    );
  }
  return null;
}

export function LoansChart() {
  return (
    <Card className="col-span-12 md:col-span-4 w-full">
      <CardHeader>
        <CardTitle>Empréstimos por Tipo</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 10, left: 20, bottom: 5 }}
            barCategoryGap={20}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke={legendColors.valor}
              tickFormatter={(value) => `R$${value}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={legendColors.quantidade}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              yAxisId="left"
              dataKey="valor"
              name="Valor (R$)"
              fill={legendColors.valor}
            />
            <Bar
              yAxisId="right"
              dataKey="quantidade"
              name="Quantidade"
              fill={legendColors.quantidade}
            />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-6 flex flex-wrap gap-6 justify-center">
          <div className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: legendColors.valor }}
            />
            <span className="text-sm font-medium">Valor (R$)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: legendColors.quantidade }}
            />
            <span className="text-sm font-medium">Quantidade</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
