/* eslint-disable */
"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useClipboard from "@/hooks/use-clipboard";
import { Copy } from "lucide-react";

interface DataTableProps {
  headers: {
    label: any;
    key: string;
    className?: string;
    enableCopy?: boolean;
    enableRadioGroup?: boolean;
  }[];
  data: Record<string, any>[];
  caption?: string;
  handleSelectedRow?: (rowIndex: number) => void;
  selectedRow?: any;
  setSelectedRow?: (value: any) => void;
}

export function DataTable({ data, headers, caption }: DataTableProps) {
  const { copyToClipboard } = useClipboard();

  const truncate = (string: string, max: number = 18) =>
    string?.length > max ? `${string.substring(0, max)}...` : string;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {headers.map((header, index) => (
            <TableHead
              key={index}
              className={`font-normal ${
                index === headers.length - 1 ? "text-right" : ""
              }`}
            >
              {header.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            {headers.map((header, headerIndex) => (
              <TableCell
                key={headerIndex}
                className={`                
               ${
                 headerIndex === headers.length - 1
                   ? "flex flex-1 justify-end "
                   : ""
               }
                `}
              >
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    {row[header.key] !== undefined &&
                    row[header.key] !== null ? (
                      <div className="flex items-center gap-1">
                        {row[header.key + "Icon"] && (
                          <div className="mr-1">{row[header.key + "Icon"]}</div>
                        )}
                        <div className="flex flex-col gap-2">
                          <div className="font-medium">
                            {truncate(row[header.key])}
                          </div>
                          {row[header.key + "Subtext"] && (
                            <div className="text-sm text-gray-500">
                              {truncate(row[header.key + "Subtext"])}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </div>
                  {header.enableCopy && row[header.key] && (
                    <Copy
                      className="cursor-pointer"
                      size={16}
                      color="#71717A"
                      onClick={() => copyToClipboard(row[header.key])}
                    />
                  )}
                </div>
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
      {caption && <TableCaption>{caption}</TableCaption>}
    </Table>
  );
}
