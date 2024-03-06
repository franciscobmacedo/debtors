import { mkConfig, generateCsv, download } from "export-to-csv";
import { DownloadIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";

interface ExportProps<TData> {
  table: Table<TData>;
  exportName: string;
}

export function Download<TData>({ table, exportName }: ExportProps<TData>) {
  const data = getData(table);
  const { t } = useTranslation();
  const config = mkConfig({
    useKeysAsHeaders: true,
    filename: exportName,
  });
  const downloadData = async () => {
    const csv = generateCsv(config)(data);
    download(config)(csv);
    return;
  };
  return (
    <Button variant="ghost" className="h-8 px-2 lg:px-3 text-xs" onClick={downloadData}>
      <DownloadIcon className="mr-2 h-4 w-4" />
      {t("Export")}
    </Button>
  );
}

function getColumns<TData>(table: Table<TData>) {
  const columns: { [key: string]: string } = {};
  table
    .getAllColumns()
    .filter(
      (column) =>
        typeof column.accessorFn !== "undefined" && column.getCanHide()
    )
    .forEach((column) => {
      columns[column.id] = column.columnDef.meta?.title() ?? column.id;
    });
  return columns;
}

function getData<TData>(table: Table<TData>) {
  const columns = getColumns(table);
  const data = table.getCoreRowModel().rows.map((row) => {
    const dataRow = row.original as { [key: string]: any };
    // map the data to the columns
    return Object.keys(columns).reduce((acc, key) => {
      // check if the key is in the data
      if (key in dataRow) {
        acc[columns[key]] = dataRow[key];
      }
      return acc;
    }, {} as { [key: string]: object });
  });
  return data;
}
