/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/common/data-table";
import { LoaderSpinner } from "./loader-spinner";
import { Input } from "../ui/input";

interface TableWrapperProps {
  isLoading: boolean;
  title?: string;
  table: Table;
  list: any[];
  message: string;
  searchFilter: string;
  setSearchFilter: React.Dispatch<React.SetStateAction<string>>;
  onDetailsClick?: (item: any) => void;
}

interface Table {
  data: any[];
  header: any;
}

// Função utilitária para transformar objetos em strings
function sanitizeRow(row: any) {
  const sanitizedRow: any = {};
  for (const [key, value] of Object.entries(row)) {
    if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
    ) {
      sanitizedRow[key] = JSON.stringify(value); // Ou selecione o campo principal, ex: value.name
    } else if (Array.isArray(value)) {
      sanitizedRow[key] = value.map((v) =>
        typeof v === "object" ? JSON.stringify(v) : String(v)
      ).join(", ");
    } else {
      sanitizedRow[key] = value;
    }
  }
  return sanitizedRow;
}

export function DashboardTable({
  isLoading,
  title,
  table,
  list,
  message,
  searchFilter,
  setSearchFilter,
  onDetailsClick,
}: TableWrapperProps) {
  // Filtro + sanitização
  const filteredList = list
    .map(sanitizeRow)
    .filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchFilter.toLowerCase())
      )
    );

  return (
    <Card className="md:col-span-1">
      {title && (
        <CardHeader className="flex flex-col md:flex-row justify-between">
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          <div className="w-full md:max-w-xs">
            <Input
              placeholder="Pesquisar"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full md:max-w-sm"
            />
          </div>
        </CardHeader>
      )}
      <CardContent className="px-6">
        {isLoading ? (
          <div className="w-full h-[180px] flex justify-center items-center">
            <LoaderSpinner />
          </div>
        ) : filteredList.length > 0 ? (
          <DataTable
            data={filteredList}
            headers={table.header}
            caption=""
            onDetailsClick={onDetailsClick}
          />
        ) : (
          <div className="w-full h-[180px] flex justify-center items-center">
            <p className="text-gray-500-700 mt-6">{message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
