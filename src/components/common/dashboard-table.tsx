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
}

interface Table {
  data: any[];
  header: any;
}

export function DashboardTable({
  isLoading,
  title,
  table,
  list,
  message,
  searchFilter,
  setSearchFilter,
}: TableWrapperProps) {
  const filteredList = list.filter((item) => {
    return Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchFilter.toLowerCase())
    );
  });
  return (
    <Card className="md:col-span-1">
      {title && (
        <CardHeader className="flex justify-between">
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          <div className="max-w-xs">
            <Input
              placeholder="Pesquisar"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
      )}
      <CardContent className="px-6">
        {isLoading ? (
          <div className="w-full h-[180px] flex justify-center items-center">
            <LoaderSpinner />
          </div>
        ) : list.length > 0 ? (
          <DataTable data={filteredList} headers={table.header} caption="" />
        ) : (
          <div className="w-full h-[180px] flex justify-center items-center">
            <p className="text-gray-500-700 mt-6">{message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
